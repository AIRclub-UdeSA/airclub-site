"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";

export type DeleteAccountState = { error: string | null };

/**
 * Borra una cuenta del sitio: el perfil (UserProfile), todas sus inscripciones a charlas y a talleres presenciales, y
 * los talleres que marcó como hechos (WorkshopCompletion, que se guarda por email).
 * Solo ADMIN. No toca a AdminUser (quién entra al panel; eso es /admin/permisos) ni la cuenta
 * de Google: si la persona vuelve a entrar, puede crear el perfil de nuevo. Deja en AuditLog
 * (section "cuentas") solo el rol, la fecha de alta, las inscripciones y los talleres hechos que tenía: ni el email ni
 * los datos del perfil, para que borrar una cuenta no deje a la persona identificable (el entityId es el id del perfil).
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
      const workshopRegistrations = await tx.workshopRegistration.findMany({
        where: { email: profile.email },
        include: { session: { select: { slug: true } } },
      });
      await tx.workshopCompletion.deleteMany({ where: { email: profile.email } });
      await tx.workshopRegistration.deleteMany({ where: { email: profile.email } });
      await tx.userProfile.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          adminUserId: admin.adminId,
          section: "cuentas",
          entityId: id,
          action: "delete",
          before: {
            role: profile.role,
            createdAt: profile.createdAt.toISOString(),
            inscripciones: registrations.map((r) => r.talk.slug),
            talleresHechos: completions.map((c) => c.workshopSlug),
            inscripcionesTalleres: workshopRegistrations.map((r) => r.session.slug),
          },
        },
      });
    });
  } catch {
    return { error: "No se pudo borrar la cuenta. Probá de nuevo." };
  }

  revalidatePath("/talks");
  revalidatePath("/admin/comunidad");
  revalidatePath("/admin/workshops");
  revalidatePath("/admin/cuentas");
  redirect("/admin/cuentas");
}
