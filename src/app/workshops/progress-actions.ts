"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { getWorkshopSlugs, workshopHref } from "@/lib/workshops";

export type ProgressResult = { signedIn: false } | { signedIn: true; completed: string[] };

async function completedOf(email: string): Promise<string[]> {
  const rows = await prisma.workshopCompletion.findMany({ where: { email }, select: { workshopSlug: true } });
  return rows.map((r) => r.workshopSlug);
}

/**
 * Lo que la cuenta logueada marcó como hecho. /workshops es estática (ISR), así que el progreso se pide desde el cliente
 * cuando hay sesión, igual que la inscripción a charlas en /talks.
 */
export async function getMyWorkshopProgressAction(): Promise<ProgressResult> {
  const email = await getSessionEmail();
  if (!email) return { signedIn: false };
  return { signedIn: true, completed: await completedOf(email) };
}

/**
 * Marca (o desmarca) un workshop como hecho para la cuenta logueada. Pide perfil completo, como la inscripción a charlas:
 * si falta, manda a completarlo y vuelve a la página del workshop. Idempotente en los dos sentidos.
 */
export async function setWorkshopDoneAction(slug: string, done: boolean): Promise<ProgressResult> {
  const email = await getSessionEmail();
  if (!email) return { signedIn: false };

  const profile = await prisma.userProfile.findUnique({ where: { email }, select: { email: true } });
  if (!profile) redirect(`/perfil/completar?next=${encodeURIComponent(workshopHref(slug))}`);

  // La acción se puede llamar con cualquier texto: solo se aceptan workshops que existen y ya se pueden hacer.
  if (!(await getWorkshopSlugs()).includes(slug)) throw new Error(`No existe el workshop "${slug}".`);

  if (done) {
    await prisma.workshopCompletion.upsert({
      where: { email_workshopSlug: { email, workshopSlug: slug } },
      create: { email, workshopSlug: slug },
      update: {},
    });
  } else {
    await prisma.workshopCompletion.deleteMany({ where: { email, workshopSlug: slug } });
  }

  revalidatePath("/perfil/aprendizaje");
  return { signedIn: true, completed: await completedOf(email) };
}
