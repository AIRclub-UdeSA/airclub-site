"use server";

import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@/lib/prisma";
import { isUpcoming } from "@/lib/dates";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { canRegisterTo } from "@/lib/udesa";
import { requireEventRegistrantEmail } from "@/lib/eventos/require-registrant";
import { isRegistrationOpen } from "@/lib/event-registration";
import { normalizeEmail, validateTeam } from "@/lib/team-validation";
import type { CancelResult } from "@/app/talks/register-actions";

// Inscripción por equipos (registrationType TEAM). Quien inscribe es el capitán: pone el nombre del equipo y los emails de
// los demás integrantes (todos @udesa.edu.ar, ver validateTeam). Nadie está en dos equipos del mismo evento (lo garantiza
// el @@unique de EventTeamMember). El capitán edita o da de baja el equipo hasta el cierre de la inscripción.

const MAX_ATTEMPTS = 3;

export type TeamView = {
  name: string;
  /** Capitán primero, el resto en el orden en que se cargaron. */
  members: string[];
  isCaptain: boolean;
};

/** Lo que necesita el diálogo al abrirse: el equipo de la cuenta (si lo tiene) y las reglas del evento. */
export type TeamInfo = {
  /** Integrantes mínimo y máximo, capitán incluido; null = sin límite de ese lado. */
  minSize: number | null;
  maxSize: number | null;
  team: TeamView | null;
  /** El capitán puede editarlo o darlo de baja (la inscripción sigue abierta). */
  canEdit: boolean;
};

export type SaveTeamResult =
  | { status: "saved"; team: TeamView }
  | { status: "invalid"; errors: string[] }
  | { status: "closed" | "full" | "restricted" };

const TEAM_INCLUDE = { members: { orderBy: [{ isCaptain: "desc" }, { createdAt: "asc" }] } } as const satisfies Prisma.EventTeamInclude;

function toView(team: { name: string; members: { email: string }[] }, isCaptain: boolean): TeamView {
  return { name: team.name, members: team.members.map((m) => m.email), isCaptain };
}

// Mismo criterio que muestra el botón (calendar.ts): publicado, de tipo equipo y que no terminó.
async function findTeamEvent(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      status: true,
      registrationType: true,
      registrationOpen: true,
      registrationDeadline: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      audience: true,
      teamMinSize: true,
      teamMaxSize: true,
    },
  });
  if (!event || event.status !== "PUBLISHED" || event.registrationType !== "TEAM") return null;
  if (!isUpcoming(event.startsAt, event.endsAt)) return null;
  return event;
}

/**
 * El equipo de la cuenta logueada en ese evento y las reglas para armarlo; null si el evento no es de equipos o no hay
 * sesión. No exige perfil (solo mira). La página es estática (ISR): el diálogo lo pide al abrirse.
 */
export async function getMyTeamAction(slug: string): Promise<TeamInfo | null> {
  const email = await getSessionEmail();
  if (!email) return null;
  const event = await findTeamEvent(slug);
  if (!event) return null;

  const membership = await prisma.eventTeamMember.findUnique({
    where: { eventId_email: { eventId: event.id, email } },
    include: { team: { include: TEAM_INCLUDE } },
  });
  return {
    minSize: event.teamMinSize,
    maxSize: event.teamMaxSize,
    team: membership ? toView(membership.team, membership.isCaptain) : null,
    canEdit: Boolean(membership?.isCaptain) && isRegistrationOpen(event),
  };
}

/** Los emails de `emails` que ya están en un equipo de ese evento (de otro, si se está editando `exceptTeamId`). */
async function takenEmails(tx: Prisma.TransactionClient, eventId: string, emails: string[], exceptTeamId?: string): Promise<string[]> {
  const rows = await tx.eventTeamMember.findMany({
    where: { eventId, email: { in: emails }, ...(exceptTeamId && { NOT: { teamId: exceptTeamId } }) },
    select: { email: true },
  });
  return rows.map((r) => r.email);
}

const takenErrors = (emails: string[]) => emails.map((e) => `${e} ya está en otro equipo de este evento.`);

/**
 * Crea el equipo de la cuenta logueada (que queda como capitán) o, si ya es capitán, lo reemplaza con lo nuevo. Valida
 * todo en el servidor: nombre, emails @udesa.edu.ar sin repetidos, tamaño dentro del mínimo y máximo del evento, que nadie
 * esté en otro equipo, el cupo de equipos, la audiencia y que la inscripción esté abierta y no haya cerrado.
 */
export async function saveTeamAction(slug: string, input: { name: string; memberEmails: string[] }): Promise<SaveTeamResult> {
  const email = await requireEventRegistrantEmail(slug);

  const event = await findTeamEvent(slug);
  if (!event || !isRegistrationOpen(event)) return { status: "closed" };
  if (!canRegisterTo(event.audience, email)) return { status: "restricted" };

  const memberEmails = Array.isArray(input.memberEmails) ? input.memberEmails.map((e) => String(e)) : [];
  const checked = validateTeam({
    name: String(input.name ?? ""),
    captainEmail: email,
    memberEmails,
    minSize: event.teamMinSize,
    maxSize: event.teamMaxSize,
  });
  if (!checked.ok) return { status: "invalid", errors: checked.errors };

  // Serializable, como en las charlas: el cupo de equipos y la unicidad de emails se chequean y se escriben juntos.
  for (let attempt = 1; ; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx): Promise<SaveTeamResult> => {
          const mine = await tx.eventTeamMember.findUnique({ where: { eventId_email: { eventId: event.id, email } } });
          if (mine && !mine.isCaptain) {
            return { status: "invalid", errors: ["Ya estás en un equipo de este evento: solo el capitán puede cambiarlo."] };
          }

          const taken = await takenEmails(tx, event.id, checked.emails, mine?.teamId);
          if (taken.length) return { status: "invalid", errors: takenErrors(taken) };

          const members = checked.emails.map((e, i) => ({ eventId: event.id, email: e, isCaptain: i === 0 }));
          if (mine) {
            const team = await tx.eventTeam.update({
              where: { id: mine.teamId },
              data: { name: checked.name, members: { deleteMany: {}, createMany: { data: members } } },
              include: TEAM_INCLUDE,
            });
            return { status: "saved", team: toView(team, true) };
          }

          if (event.capacity !== null && (await tx.eventTeam.count({ where: { eventId: event.id } })) >= event.capacity) {
            return { status: "full" };
          }
          const team = await tx.eventTeam.create({
            data: { eventId: event.id, name: checked.name, captainEmail: email, members: { createMany: { data: members } } },
            include: TEAM_INCLUDE,
          });
          return { status: "saved", team: toView(team, true) };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      if (result.status === "saved") revalidatePath("/admin/comunidad");
      return result;
    } catch (e) {
      // P2034: choque de serialización; P2002: alguien tomó un email en el medio. En el reintento se ve y se informa.
      if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2034" || e.code === "P2002") && attempt < MAX_ATTEMPTS) continue;
      throw e;
    }
  }
}

/** Da de baja el equipo de la cuenta logueada, solo si es el capitán y la inscripción sigue abierta. */
export async function cancelTeamAction(slug: string): Promise<CancelResult> {
  const email = await requireEventRegistrantEmail(slug);

  const event = await findTeamEvent(slug);
  if (!event || !isRegistrationOpen(event)) return { status: "closed" };

  // deleteMany y no delete: si ya no estaba, no es un error. Las filas de integrantes se van por el onDelete: Cascade.
  const normalized = normalizeEmail(email);
  await prisma.eventTeam.deleteMany({ where: { eventId: event.id, captainEmail: normalized } });
  revalidatePath("/admin/comunidad");
  return { status: "cancelled" };
}
