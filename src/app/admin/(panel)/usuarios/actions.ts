"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, type Prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
import { ADMIN_SECTIONS } from "@/lib/admin/sections";

const ALLOWED_EMAIL_DOMAIN = "@udesa.edu.ar";
const VALID_SECTION_IDS = new Set<string>(ADMIN_SECTIONS.map((s) => s.id));

export type ActionState = { error: string | null };

async function requireAdminRole() {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") redirect("/admin/sin-permiso");
  return admin;
}

function parseSections(formData: FormData): string[] {
  return formData
    .getAll("sections")
    .map((v) => String(v))
    .filter((id) => VALID_SECTION_IDS.has(id));
}

async function countAdmins(tx: Prisma.TransactionClient) {
  return tx.adminUser.count({ where: { role: "ADMIN" } });
}

export async function addOrUpdateAdminUser(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminRole();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "EDITOR";
  const sections = parseSections(formData);

  if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
    return { error: `El email tiene que terminar en ${ALLOWED_EMAIL_DOMAIN}.` };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.adminUser.findUnique({ where: { email } });

      if (before?.role === "ADMIN" && role !== "ADMIN" && (await countAdmins(tx)) <= 1) {
        throw new Error("No podés sacarle ADMIN a la última persona con ese rol — te quedarías sin nadie que pueda arreglar el panel.");
      }

      const after = await tx.adminUser.upsert({
        where: { email },
        create: { email, role, sections },
        update: { role, sections },
      });

      await tx.auditLog.create({
        data: {
          adminUserId: actor.adminId,
          section: "admin-usuarios",
          entityId: after.id,
          action: before ? "update" : "create",
          before: before ? { email: before.email, role: before.role, sections: before.sections } : undefined,
          after: { email: after.email, role: after.role, sections: after.sections },
        },
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar." };
  }

  revalidatePath("/admin/usuarios");
  return { error: null };
}

export async function removeAdminUser(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdminRole();
  const id = String(formData.get("id") ?? "");

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.adminUser.findUniqueOrThrow({ where: { id } });

      if (target.role === "ADMIN" && (await countAdmins(tx)) <= 1) {
        throw new Error("No podés borrar a la última persona ADMIN — te quedarías sin nadie que pueda arreglar el panel.");
      }

      await tx.adminUser.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          adminUserId: actor.adminId,
          section: "admin-usuarios",
          entityId: id,
          action: "delete",
          before: { email: target.email, role: target.role, sections: target.sections },
        },
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo borrar." };
  }

  revalidatePath("/admin/usuarios");
  return { error: null };
}
