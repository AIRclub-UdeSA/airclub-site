import "server-only";
import { completionsOf } from "@/lib/workshop-completions";

/**
 * Talleres hechos de una cuenta, el más reciente primero, para el detalle de /admin/cuentas/[id]. Mismo criterio que
 * /perfil/aprendizaje (completionsOf): lo marcado a mano más los presenciales terminados a los que se inscribió.
 */
export async function completedWorkshopsOf(email: string): Promise<string[]> {
  const done = await completionsOf(email);
  return [...done].sort(([, a], [, b]) => b.getTime() - a.getTime()).map(([slug]) => slug);
}
