"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@/lib/prisma";
import { isUpcoming } from "@/lib/dates";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { canRegisterTo } from "@/lib/udesa";
import { isProfileComplete } from "@/lib/perfil/completeness";
import { isRegistrationOpen } from "@/lib/event-registration";
import type { CancelResult, MyRegistrationsResult, RegisterResult } from "@/app/talks/register-actions";

// Inscripción individual a un evento (registrationType INDIVIDUAL). Mismo comportamiento que la de charlas
// (src/app/talks/register-actions.ts): mismo diálogo, mismos resultados, cupo atómico y vuelta al evento después de
// loguearse o completar el perfil.

const MAX_ATTEMPTS = 3;

/**
 * Pide sesión y perfil completo (ver isProfileComplete). Si falta el perfil, lo completa y vuelve a /eventos con
 * "?evento=<slug>&inscribir=<slug>", que abre el evento y retoma la inscripción (ver EventsHub).
 */
async function requireRegistrantEmail(slug: string): Promise<string> {
  const email = await getSessionEmail();
  if (!email) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { email },
    select: { fullName: true, affiliation: true, institution: true, consentAcceptedAt: true },
  });
  if (!profile || !isProfileComplete(profile)) {
    const nextTarget = `/eventos?evento=${encodeURIComponent(slug)}&inscribir=${encodeURIComponent(slug)}`;
    redirect(`/perfil/completar?next=${encodeURIComponent(nextTarget)}`);
  }
  return email;
}

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
  const email = await requireRegistrantEmail(slug);

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
  const email = await requireRegistrantEmail(slug);

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
    where: { status: "PUBLISHED", registrationType: "INDIVIDUAL", registrationOpen: true },
    select: {
      id: true,
      slug: true,
      startsAt: true,
      endsAt: true,
      registrationDeadline: true,
      capacity: true,
      audience: true,
      _count: { select: { registrations: true } },
    },
  });

  const mine = await prisma.eventRegistration.findMany({
    where: { email, eventId: { in: events.map((e) => e.id) } },
    select: { eventId: true },
  });
  const mineIds = new Set(mine.map((r) => r.eventId));

  const registered: string[] = [];
  const full: string[] = [];
  const restricted: string[] = [];
  for (const e of events) {
    if (!isUpcoming(e.startsAt, e.endsAt)) continue;
    if (mineIds.has(e.id)) registered.push(e.slug);
    else if (!isRegistrationOpen({ ...e, registrationType: "INDIVIDUAL", registrationOpen: true })) continue;
    else if (!canRegisterTo(e.audience, email)) restricted.push(e.slug);
    else if (e.capacity !== null && e._count.registrations >= e.capacity) full.push(e.slug);
  }
  return { signedIn: true, registered, full, restricted };
}
