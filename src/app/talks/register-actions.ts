"use server";

import { redirect } from "next/navigation";
import { Prisma, prisma } from "@/lib/prisma";
import { isUpcoming } from "@/lib/dates";
import { getSessionEmail } from "@/lib/perfil/require-profile";

/**
 * `closed`: la charla no existe, es un borrador, no tiene inscripción propia o ya pasó.
 * `full`: se llegó al cupo (`Talk.capacity`).
 */
export type RegisterResult = { status: "registered" | "already" | "closed" | "full" };
export type CancelResult = { status: "cancelled" | "closed" };

/**
 * Pide sesión y perfil completo. No usa requireUserProfile() a propósito: esa redirige a
 * /perfil/completar sin el parámetro `next`, así que si falta el perfil se perdería la charla
 * puntual al volver. Acá sí se arrastra (ver src/components/talks/TalksHub.tsx, que abre este
 * mismo diálogo al volver con "?inscribir=<slug>").
 */
async function requireRegistrantEmail(talkSlug: string): Promise<string> {
  const email = await getSessionEmail();
  if (!email) redirect("/");

  const profile = await prisma.userProfile.findUnique({ where: { email }, select: { email: true } });
  if (!profile) {
    const nextTarget = `/talks?inscribir=${encodeURIComponent(talkSlug)}`;
    redirect(`/perfil/completar?next=${encodeURIComponent(nextTarget)}`);
  }
  return email;
}

// Mismo criterio que muestra el botón "Inscribirme" (talksHubProps en src/lib/talks.ts), repetido
// acá porque la acción se puede llamar con cualquier slug.
async function findUpcomingTalk(talkSlug: string) {
  const talk = await prisma.talk.findUnique({
    where: { slug: talkSlug },
    select: { id: true, status: true, registrationOpen: true, startsAt: true, endsAt: true, capacity: true },
  });
  if (!talk || talk.status !== "PUBLISHED" || !talk.startsAt || !isUpcoming(talk.startsAt, talk.endsAt)) return null;
  return talk;
}

/**
 * Inscribe a la cuenta logueada a una charla con registrationOpen = true, usando el email del
 * perfil ya completo (#49). Idempotente: si ya estaba inscripta (choca con el @@unique de
 * TalkRegistration), se trata como éxito, no como error.
 */
export async function registerForTalkAction(talkSlug: string): Promise<RegisterResult> {
  const email = await requireRegistrantEmail(talkSlug);

  const talk = await findUpcomingTalk(talkSlug);
  if (!talk || !talk.registrationOpen) return { status: "closed" };

  try {
    // Serializable: el conteo del cupo y la inscripción tienen que ser atómicos, si no dos
    // inscripciones simultáneas pueden pasarse del cupo.
    return await prisma.$transaction(
      async (tx): Promise<RegisterResult> => {
        const existing = await tx.talkRegistration.findUnique({
          where: { talkId_email: { talkId: talk.id, email } },
          select: { id: true },
        });
        if (existing) return { status: "already" };

        if (talk.capacity !== null) {
          const taken = await tx.talkRegistration.count({ where: { talkId: talk.id } });
          if (taken >= talk.capacity) return { status: "full" };
        }

        await tx.talkRegistration.create({ data: { talkId: talk.id, email } });
        return { status: "registered" };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { status: "already" };
    }
    throw e;
  }
}

/** Da de baja la inscripción de la cuenta logueada. Solo mientras la charla no haya pasado. */
export async function cancelTalkRegistrationAction(talkSlug: string): Promise<CancelResult> {
  const email = await requireRegistrantEmail(talkSlug);

  const talk = await findUpcomingTalk(talkSlug);
  if (!talk) return { status: "closed" };

  // deleteMany y no delete: si ya no estaba inscripta, no es un error.
  await prisma.talkRegistration.deleteMany({ where: { talkId: talk.id, email } });
  return { status: "cancelled" };
}
