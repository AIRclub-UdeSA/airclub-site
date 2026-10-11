import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Confirma que hay sesion (@udesa.edu.ar, ver src/auth.ts) y que esa cuenta ya completo su
 * perfil publico. Si no hay sesion, manda a "/" (ahi se loguea desde el Nav). Si hay sesion
 * pero no hay perfil, manda a completarlo. Usar antes de mostrar "/perfil" o de autocompletar
 * una inscripcion a charla (#50) con los datos del perfil.
 */
export async function requireUserProfile() {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const profile = await prisma.userProfile.findUnique({ where: { email: session.user.email } });
  if (!profile) redirect("/perfil/completar");

  return profile;
}
