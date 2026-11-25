"use server";

import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@/lib/prisma";
import { isUpcoming } from "@/lib/dates";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { canRegisterTo } from "@/lib/udesa";
import { requireEventRegistrantEmail } from "@/lib/eventos/require-registrant";
import { isRegistrationOpen } from "@/lib/event-registration";
import type { CancelResult, MyRegistrationsResult, RegisterResult } from "@/app/talks/register-actions";

// Inscripción individual a un evento (registrationType INDIVIDUAL; la de equipos está en team-actions.ts). Mismo
// comportamiento que la de charlas (src/app/talks/register-actions.ts): mismo diálogo, mismos resultados, cupo atómico
// y vuelta al evento después de loguearse o completar el perfil.

const MAX_ATTEMPTS = 3;

// Mismo criterio que muestra el botón "Inscribirme" (calendar.ts): publicado, de tipo individual y que no terminó.
async function findLiveEvent(slug: string) {
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
    },
  });
  if (!event || event.status !== "PUBLISHED" || event.registrationType !== "INDIVIDUAL") return null;
  if (!isUpcoming(event.startsAt, event.endsAt)) return null;
  return event;
}

/** Inscribe a la cuenta logueada. Idempotente: si ya estaba inscripta, es "already", no un error. */
export async function registerForEventAction(slug: string): Promise<RegisterResult> {
  const email = await requireEventRegistrantEmail(slug);

  const event = await findLiveEvent(slug);
  if (!event || !isRegistrationOpen(event)) return { status: "closed" };

  // Serializable, como en las charlas: el conteo del cupo y la inscripción tienen que ser atómicos.
  for (let attempt = 1; ; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx): Promise<RegisterResult> => {
          const existing = await tx.eventRegistration.findUnique({
            where: { eventId_email: { eventId: event.id, email } },
            select: { id: true },
          });
          if (existing) return { status: "already" };

          // Como en las charlas: después de "already" y antes del cupo.
          if (!canRegisterTo(event.audience, email)) return { status: "restricted" };

          if (event.capacity !== null) {
            const taken = await tx.eventRegistration.count({ where: { eventId: event.id } });
            if (taken >= event.capacity) return { status: "full" };
          }

          await tx.eventRegistration.create({ data: { eventId: event.id, email } });
          return { status: "registered" };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      revalidatePath("/admin/comunidad");
      return result;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") return { status: "already" };
        if (e.code === "P2034" && attempt < MAX_ATTEMPTS) continue;
      }
      throw e;
    }
  }
}

/** Da de baja la inscripción de la cuenta logueada. Mientras el evento no haya terminado. */
export async function cancelEventRegistrationAction(slug: string): Promise<CancelResult> {
  const email = await requireEventRegistrantEmail(slug);

  const event = await findLiveEvent(slug);
  if (!event) return { status: "closed" };

  // deleteMany y no delete: si ya no estaba inscripta, no es un error.
  await prisma.eventRegistration.deleteMany({ where: { eventId: event.id, email } });
  revalidatePath("/admin/comunidad");
  return { status: "cancelled" };
}

/**
 * Estado de la cuenta logueada frente a los eventos con inscripción propia (misma forma que getMyTalkRegistrationsAction):
 * `registered` los slugs en los que ya está inscripta, `full` los que llegaron al cupo sin que ella esté adentro y
 * `restricted` los solo UdeSA con un mail que no lo es. Sin sesión, `signedIn: false`. Es lo que el cliente pide con
 * sesión, porque /eventos es estática (ISR).
 */
export async function getMyEventRegistrationsAction(): Promise<MyRegistrationsResult> {
  const email = await getSessionEmail();
  if (!email) return { signedIn: false };

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED", registrationType: { in: ["INDIVIDUAL", "TEAM"] }, registrationOpen: true },
    select: {
      id: true,
      slug: true,
      registrationType: true,
      startsAt: true,
      endsAt: true,
      registrationDeadline: true,
      capacity: true,
      audience: true,
      _count: { select: { registrations: true, teams: true } },
    },
  });

  const ids = events.map((e) => e.id);
  const [mine, myTeams] = await Promise.all([
    prisma.eventRegistration.findMany({ where: { email, eventId: { in: ids } }, select: { eventId: true } }),
    // Capitán o integrante: en los dos casos "ya está adentro" (el diálogo le muestra su equipo).
    prisma.eventTeamMember.findMany({ where: { email, eventId: { in: ids } }, select: { eventId: true } }),
  ]);
  const mineIds = new Set([...mine, ...myTeams].map((r) => r.eventId));

  const registered: string[] = [];
  const full: string[] = [];
  const restricted: string[] = [];
  for (const e of events) {
    if (!isUpcoming(e.startsAt, e.endsAt)) continue;
    if (mineIds.has(e.id)) registered.push(e.slug);
    else if (!isRegistrationOpen({ ...e, registrationOpen: true })) continue;
    else if (!canRegisterTo(e.audience, email)) restricted.push(e.slug);
    else {
      const taken = e.registrationType === "TEAM" ? e._count.teams : e._count.registrations;
      if (e.capacity !== null && taken >= e.capacity) full.push(e.slug);
    }
  }
  return { signedIn: true, registered, full, restricted };
}
