"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canEditSection, requireAdminSession } from "@/lib/admin/permissions";
import { FEEDBACK_STATUSES, type FeedbackStatusId } from "@/lib/feedback/rules";

export type UpdateStatusState = { error: string | null; saved: boolean };

/** Cambia el estado de un feedback y lo deja en AuditLog (section "feedback"), solo con el estado de antes y después. */
export async function updateFeedbackStatusAction(_prev: UpdateStatusState, formData: FormData): Promise<UpdateStatusState> {
  const admin = await requireAdminSession();
  if (!canEditSection(admin, "feedback")) return { error: "No tenés permiso para cambiar el estado.", saved: false };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id) return { error: "Falta el feedback.", saved: false };
  if (!(FEEDBACK_STATUSES as readonly string[]).includes(status)) return { error: "Elegí un estado.", saved: false };

  try {
    const found = await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.findUnique({ where: { id }, select: { status: true } });
      if (!feedback) return false;
      if (feedback.status === status) return true;

      await tx.feedback.update({ where: { id }, data: { status: status as FeedbackStatusId } });
      await tx.auditLog.create({
        data: {
          adminUserId: admin.adminId,
          section: "feedback",
          entityId: id,
          action: "update",
          before: { status: feedback.status },
          after: { status },
        },
      });
      return true;
    });
    if (!found) return { error: "Ese feedback ya no existe.", saved: false };
  } catch {
    return { error: "No se pudo guardar. Probá de nuevo.", saved: false };
  }

  revalidatePath("/admin", "layout");
  return { error: null, saved: true };
}
