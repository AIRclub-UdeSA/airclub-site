"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Prisma, prisma } from "@/lib/prisma";

export type RegisterResult = { status: "registered" | "already" };

/**
 * Inscribe a la cuenta logueada a una charla con registrationOpen = true, usando el email del
 * perfil ya completo (#49). Idempotente: si ya estaba inscripta (choca con el @@unique de
 * TalkRegistration), se trata como éxito, no como error.
 *
 * No usa requireUserProfile() a propósito: esa redirige a /perfil/completar sin el parámetro
 * `next`, así que si falta el perfil se perdería la charla puntual al volver. Acá sí se arrastra
 * (ver src/app/talks/TalksHub.tsx, que abre este mismo diálogo al volver con "?inscribir=<slug>").
 */
export async function registerForTalkAction(talkSlug: string): Promise<RegisterResult> {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const nextTarget = `/talks?inscribir=${talkSlug}`;
  const profile = await prisma.userProfile.findUnique({ where: { email: session.user.email } });
  if (!profile) redirect(`/perfil/completar?next=${encodeURIComponent(nextTarget)}`);

  const talk = await prisma.talk.findUnique({ where: { slug: talkSlug }, select: { id: true } });
  if (!talk) throw new Error(`No existe la charla "${talkSlug}".`);

  try {
    await prisma.talkRegistration.create({ data: { talkId: talk.id, email: profile.email } });
    return { status: "registered" };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { status: "already" };
    }
    throw e;
  }
}
