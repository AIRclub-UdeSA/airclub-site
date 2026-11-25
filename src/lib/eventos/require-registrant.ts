import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { isProfileComplete } from "@/lib/perfil/completeness";

/**
 * Pide sesión y perfil completo (ver isProfileComplete) para inscribirse a un evento, individual o por equipo. Sin sesión
 * manda a "/"; sin perfil, a completarlo y vuelve a /eventos con "?evento=<slug>&inscribir=<slug>", que abre el evento y
 * retoma la inscripción (ver EventsHub). Devuelve el email de la sesión en minúsculas.
 */
export async function requireEventRegistrantEmail(slug: string): Promise<string> {
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
