import "server-only";

/**
 * Talleres que una cuenta marcó como hechos, para el detalle de /admin/cuentas/[id].
 * Devuelve null mientras /workshops (WorkshopCompletion, #64) no esté mergeado: el detalle
 * oculta la sección. Al mergearlo, reemplazar el cuerpo por la consulta a la tabla
 * (`prisma.workshopCompletion.findMany({ where: { email } })`) y devolver los slugs.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function completedWorkshopsOf(email: string): Promise<string[] | null> {
  return null;
}
