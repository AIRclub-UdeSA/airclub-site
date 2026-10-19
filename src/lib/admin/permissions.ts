import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canEditSection, canViewSection } from "./sections";

export type AdminSession = {
  adminId: string;
  role: "ADMIN" | "EDITOR";
  sections: string[];
  email: string;
};

/**
 * Confirma que hay una sesion con acceso a /admin (email @udesa.edu.ar Y cargado y activo en
 * AdminUser; cualquier otra cuenta de Google puede loguearse al sitio pero no recibe rol, ver
 * adminAccessFor en src/lib/auth-access.ts). Si no, redirige — a /admin/login sin sesion, a /admin/sin-permiso si esta
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

export { canEditSection, canViewSection } from "./sections";

/** Como requireAdminSession, pero ademas exige poder ver `section`. Para paginas de lectura. */
export async function requireSectionView(section: string): Promise<AdminSession> {
  const admin = await requireAdminSession();
  if (!canViewSection(admin, section)) redirect("/admin/sin-permiso");
  return admin;
}

/** Como requireAdminSession, pero ademas exige poder escribir en `section`. Para paginas de edicion y server actions. */
export async function requireSectionEdit(section: string): Promise<AdminSession> {
  const admin = await requireAdminSession();
  if (!canEditSection(admin, section)) redirect("/admin/sin-permiso");
  return admin;
}
