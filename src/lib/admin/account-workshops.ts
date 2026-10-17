import "server-only";
import { prisma } from "@/lib/prisma";

/** Talleres que una cuenta marcó como hechos (WorkshopCompletion), el más reciente primero, para el detalle de /admin/cuentas/[id]. */
export async function completedWorkshopsOf(email: string): Promise<string[]> {
  const rows = await prisma.workshopCompletion.findMany({
    where: { email },
    select: { workshopSlug: true },
    orderBy: { completedAt: "desc" },
  });
  return rows.map((r) => r.workshopSlug);
}
