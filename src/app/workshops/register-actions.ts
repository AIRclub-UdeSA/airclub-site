"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, prisma } from "@/lib/prisma";
import { isUpcoming } from "@/lib/dates";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { canRegisterTo } from "@/lib/udesa";
import type { CancelResult, MyRegistrationsResult, RegisterResult } from "@/app/talks/register-actions";

// Inscripción a talleres presenciales (#70). Mismo comportamiento que la de charlas (#50, src/app/talks/register-actions.ts):
// mismo diálogo, mismos resultados, cupo atómico y vuelta al taller después de loguearse o completar el perfil.

const MAX_ATTEMPTS = 3;

/** Pide sesión y perfil completo; si falta el perfil, vuelve a /workshops con "?inscribir=<slug>" después de completarlo. */
async function requireRegistrantEmail(slug: string): Promise<string> {
  const email = await getSessionEmail();
  if (!email) redirect("/");

  const profile = await prisma.userProfile.findUnique({ where: { email }, select: { email: true } });
  if (!profile) {
    const nextTarget = `/workshops?inscribir=${encodeURIComponent(slug)}`;
    redirect(`/perfil/completar?next=${encodeURIComponent(nextTarget)}`);
  }
  return email;
}

// Mismo criterio que muestra el botón "Inscribirme": publicado, con fecha y que todavía no pasó.
async function findUpcomingSession(slug: string) {
  const session = await prisma.workshopSession.findUnique({
    where: { slug },
    select: { id: true, status: true, registrationOpen: true, startsAt: true, endsAt: true, capacity: true, audience: true, track: { select: { status: true } } },
  });
  if (!session || session.status !== "PUBLISHED" || session.track.status !== "PUBLISHED") return null;
  if (!session.startsAt || !isUpcoming(session.startsAt, session.endsAt)) return null;
  return session;
}

/** Inscribe a la cuenta logueada. Idempotente: si ya estaba inscripta, es "already", no un error. */
export async function registerForWorkshopAction(slug: string): Promise<RegisterResult> {
  const email = await requireRegistrantEmail(slug);

  const session = await findUpcomingSession(slug);
  if (!session || !session.registrationOpen) return { status: "closed" };

  // Serializable, como en las charlas: el conteo del cupo y la inscripción tienen que ser atómicos.
  for (let attempt = 1; ; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx): Promise<RegisterResult> => {
          const existing = await tx.workshopRegistration.findUnique({
            where: { sessionId_email: { sessionId: session.id, email } },
            select: { id: true },
          });
          if (existing) return { status: "already" };

          // Como en las charlas: después de "already" y antes del cupo.
          if (!canRegisterTo(session.audience, email)) return { status: "restricted" };

          if (session.capacity !== null) {
            const taken = await tx.workshopRegistration.count({ where: { sessionId: session.id } });
            if (taken >= session.capacity) return { status: "full" };
          }

          await tx.workshopRegistration.create({ data: { sessionId: session.id, email } });
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

/** Da de baja la inscripción de la cuenta logueada. Solo mientras el taller no haya pasado. */
export async function cancelWorkshopRegistrationAction(slug: string): Promise<CancelResult> {
  const email = await requireRegistrantEmail(slug);

  const session = await findUpcomingSession(slug);
  if (!session) return { status: "closed" };

  // deleteMany y no delete: si ya no estaba inscripta, no es un error.
  await prisma.workshopRegistration.deleteMany({ where: { sessionId: session.id, email } });
  revalidatePath("/admin/comunidad");
  return { status: "cancelled" };
}

/**
 * Estado de la cuenta logueada frente a los talleres con inscripción propia, como getMyTalkRegistrationsAction: en cuáles
 * ya está inscripta y cuáles llegaron al cupo sin ella adentro y cuáles son solo UdeSA y su mail no lo es. /workshops es estática (ISR), así que lo pide el cliente.
 */
export async function getMyWorkshopRegistrationsAction(): Promise<MyRegistrationsResult> {
  const email = await getSessionEmail();
  if (!email) return { signedIn: false };

  const sessions = await prisma.workshopSession.findMany({
    where: { status: "PUBLISHED", track: { status: "PUBLISHED" }, registrationOpen: true, startsAt: { not: null } },
    select: { id: true, slug: true, startsAt: true, endsAt: true, capacity: true, audience: true, _count: { select: { registrations: true } } },
  });

  const mine = await prisma.workshopRegistration.findMany({
    where: { email, sessionId: { in: sessions.map((s) => s.id) } },
    select: { sessionId: true },
  });
  const mineIds = new Set(mine.map((r) => r.sessionId));

  const registered: string[] = [];
  const full: string[] = [];
  const restricted: string[] = [];
  for (const s of sessions) {
    if (!s.startsAt || !isUpcoming(s.startsAt, s.endsAt)) continue;
    if (mineIds.has(s.id)) registered.push(s.slug);
    else if (!canRegisterTo(s.audience, email)) restricted.push(s.slug);
    else if (s.capacity !== null && s._count.registrations >= s.capacity) full.push(s.slug);
  }
  return { signedIn: true, registered, full, restricted };
}
