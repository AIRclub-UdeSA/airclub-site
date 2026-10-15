"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { getWorkshopItems, workshopHref } from "@/lib/workshops";
import { completionsOf, setCompletion } from "@/lib/workshop-completions";

export type ProgressResult = { signedIn: false } | { signedIn: true; completed: string[] };

/** Lo marcado a mano más los presenciales terminados con inscripción (#70). */
async function completedOf(email: string): Promise<string[]> {
  return [...(await completionsOf(email)).keys()];
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

  // La acción se puede llamar con cualquier texto: solo se aceptan talleres que existen y ya se pueden hacer.
  const item = (await getWorkshopItems()).find((w) => w.slug === slug);
  if (!item) throw new Error(`No existe el taller "${slug}".`);

  const profile = await prisma.userProfile.findUnique({ where: { email }, select: { email: true } });
  if (!profile) redirect(`/perfil/completar?next=${encodeURIComponent(workshopHref(item))}`);

  await setCompletion(email, slug, done);

  revalidatePath("/perfil/aprendizaje");
  return { signedIn: true, completed: await completedOf(email) };
}
