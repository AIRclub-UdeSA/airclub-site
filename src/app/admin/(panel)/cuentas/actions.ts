"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteAccountData } from "@/lib/delete-account-data";
import { requireAdminSession } from "@/lib/admin/permissions";

export type DeleteAccountState = { error: string | null };

/**
 * Borra una cuenta del sitio: el perfil (UserProfile), todas sus inscripciones a charlas, a talleres presenciales y a
 * eventos, sus equipos de eventos y los talleres que marcó como hechos (WorkshopCompletion, que se guarda por email).
 * Borra lo mismo que cuando la persona lo hace desde /perfil (ver deleteAccountData).
 * Solo ADMIN. No toca a AdminUser (quién entra al panel; eso es /admin/usuarios) ni la cuenta
 * de Google: si la persona vuelve a entrar, puede crear el perfil de nuevo. Deja en AuditLog
 * (section "cuentas") solo el rol, la fecha de alta y los slugs de las inscripciones, los eventos (individuales y por
 * equipo) y los talleres hechos que tenía: ni el email, ni los nombres de equipo ni
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

      const deleted = await deleteAccountData(tx, profile.email);
      await tx.auditLog.create({
        data: {
          adminUserId: admin.adminId,
          section: "cuentas",
          entityId: id,
          action: "delete",
          before: {
            role: profile.role,
            createdAt: profile.createdAt.toISOString(),
            inscripciones: deleted.charlas,
            talleresHechos: deleted.talleresHechos,
            inscripcionesTalleres: deleted.talleresPresenciales,
            eventosIndividuales: deleted.eventosIndividuales,
            eventosPorEquipo: deleted.eventosPorEquipo,
          },
        },
      });
    });
  } catch {
    return { error: "No se pudo borrar la cuenta. Probá de nuevo." };
  }

  revalidatePath("/talks");
  revalidatePath("/eventos");
  revalidatePath("/admin/comunidad");
  revalidatePath("/admin/workshops");
  revalidatePath("/admin/cuentas");
  redirect("/admin/cuentas");
}
