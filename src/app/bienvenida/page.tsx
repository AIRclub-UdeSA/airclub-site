import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { prisma } from "@/lib/prisma";

/**
 * Destino de signInAction (src/lib/admin/auth-actions.ts) para el login publico desde el Nav.
 * Solo decide a donde mandar segun si ya existe el perfil, nunca se queda: asi el chequeo de
 * sesion (que depende de cookies, por lo tanto siempre dinamico) no vive en "/" y no le rompe
 * el ISR (`revalidate = 60` en src/app/page.tsx).
 */
export default async function BienvenidaPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/");

  const profile = await prisma.userProfile.findUnique({ where: { email } });
  redirect(profile ? "/" : "/perfil/completar");
}
