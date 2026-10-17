"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canEditSection, requireAdminSession } from "@/lib/admin/permissions";

export type RemoveRegistrationState = { error: string | null };

/**
 * Da de baja una inscripción a una charla. Solo ADMIN: un Editor con "comunidad" solo ve (#97). Deja el "antes"
 * en AuditLog (section "comunidad") y revalida /talks para que se libere el cupo en el sitio.
 * Idempotente: si ya no existe, no es un error.
 */
export async function removeRegistrationAction(
  _prev: RemoveRegistrationState,
  formData: FormData,
): Promise<RemoveRegistrationState> {
  const admin = await requireAdminSession();
  if (!canEditSection(admin, "comunidad")) return { error: "No tenés permiso para dar de baja inscriptos." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la inscripción." };

  try {
    await prisma.$transaction(async (tx) => {
      const registration = await tx.talkRegistration.findUnique({
        where: { id },
        include: { talk: { select: { slug: true, title: true } } },
      });
      if (!registration) return;

      await tx.talkRegistration.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          adminUserId: admin.adminId,
          section: "comunidad",
          entityId: id,
          action: "delete",
          before: {
            talkId: registration.talkId,
            talkSlug: registration.talk.slug,
            talkTitle: registration.talk.title,
            email: registration.email,
            createdAt: registration.createdAt.toISOString(),
          },
        },
      });
    });
  } catch {
    return { error: "No se pudo dar de baja. Probá de nuevo." };
  }

  revalidatePath("/talks");
  revalidatePath("/admin/comunidad");
  return { error: null };
}
