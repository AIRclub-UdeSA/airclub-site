import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type AdminSession = {
  adminId: string;
  role: "ADMIN" | "EDITOR";
  sections: string[];
  email: string;
};

/**
 * Confirma que hay una sesion con acceso a /admin (email @udesa.edu.ar Y cargado en
 * AdminUser). Si no, redirige — a /admin/login sin sesion, a /admin/sin-permiso si esta
 * logueado pero no autorizado. Usar en el layout de /admin y de nuevo en cada server
 * action de escritura (no alcanza con esconder botones en el cliente).
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");
  if (!session.user.role) redirect("/admin/sin-permiso");

  return {
    adminId: session.user.adminId!,
    role: session.user.role,
    sections: session.user.sections,
    email: session.user.email,
  };
}

/** true si la sesion puede escribir en `section` (ADMIN entra a todas). */
export function canAccessSection(admin: Pick<AdminSession, "role" | "sections">, section: string): boolean {
  return admin.role === "ADMIN" || admin.sections.includes(section);
}

/** Como requireAdminSession, pero ademas exige acceso a `section` puntual. */
export async function requireSectionAccess(section: string): Promise<AdminSession> {
  const admin = await requireAdminSession();
  if (!canAccessSection(admin, section)) redirect("/admin/sin-permiso");
  return admin;
}
