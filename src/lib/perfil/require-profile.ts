import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Email de la sesion en minusculas (igual que `AdminUser` en src/auth.ts), o null si no hay sesion. */
export async function getSessionEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email?.toLowerCase() ?? null;
}

/** Nombre de la cuenta de Google de la sesion, para prellenar el perfil. */
export async function getSessionName(): Promise<string> {
  const session = await auth();
  return session?.user?.name?.trim() ?? "";
}

/**
 * Confirma que hay sesion (cualquier cuenta de Google, ver src/auth.ts) y que esa cuenta ya completo su
 * perfil publico. Si no hay sesion, manda a "/" (ahi se loguea desde el Nav). Si hay sesion
 * pero no hay perfil, manda a completarlo. Usar antes de mostrar "/perfil" o de autocompletar
 * una inscripcion a charla (#50) con los datos del perfil.
 */
export async function requireUserProfile() {
  const email = await getSessionEmail();
  if (!email) redirect("/");

  const profile = await prisma.userProfile.findUnique({ where: { email } });
  if (!profile) redirect("/perfil/completar");

  return profile;
}
