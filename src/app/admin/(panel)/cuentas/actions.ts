"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";

export type DeleteAccountState = { error: string | null };

/**
 * Borra una cuenta del sitio: el perfil (UserProfile), todas sus inscripciones a charlas y los talleres que marcó como
 * hechos (WorkshopCompletion, que se guarda por email).
 * Solo ADMIN. No toca a AdminUser (quién entra al panel; eso es /admin/usuarios) ni la cuenta
 * de Google: si la persona vuelve a entrar, puede crear el perfil de nuevo. Deja en AuditLog
 * (section "cuentas") el perfil, las inscripciones y los talleres hechos que tenía.
 */
export async function deleteAccountAction(_prev: DeleteAccountState, formData: FormData): Promise<DeleteAccountState> {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") return { error: "No tenés permiso para borrar cuentas." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta la cuenta." };

  try {
    await prisma.$transaction(async (tx) => {
      const profile = await tx.userProfile.findUnique({ where: { id } });
      if (!profile) return;

      const registrations = await tx.talkRegistration.findMany({
        where: { email: profile.email },
        include: { talk: { select: { slug: true } } },
      });
      const completions = await tx.workshopCompletion.findMany({
        where: { email: profile.email },
        select: { workshopSlug: true },
      });
      await tx.talkRegistration.deleteMany({ where: { email: profile.email } });
      await tx.workshopCompletion.deleteMany({ where: { email: profile.email } });
      await tx.userProfile.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          adminUserId: admin.adminId,
          section: "cuentas",
          entityId: id,
          action: "delete",
          before: {
            email: profile.email,
            role: profile.role,
            otherRole: profile.otherRole,
            careers: profile.careers,
            otherCareer: profile.otherCareer,
            startYear: profile.startYear,
            studentStatus: profile.studentStatus,
            createdAt: profile.createdAt.toISOString(),
            inscripciones: registrations.map((r) => r.talk.slug),
            talleresHechos: completions.map((c) => c.workshopSlug),
          },
        },
      });
    });
  } catch {
    return { error: "No se pudo borrar la cuenta. Probá de nuevo." };
  }

  revalidatePath("/talks");
  revalidatePath("/admin/comunidad");
  revalidatePath("/admin/cuentas");
  redirect("/admin/cuentas");
}
