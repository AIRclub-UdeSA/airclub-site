import { isUdesaEmail } from "@/lib/udesa";

/**
 * Quién puede entrar al sitio: cualquier cuenta de Google con el mail verificado. El dominio ya no es una barrera
 * de login (solo decide el rol del panel y la audiencia de los eventos, ver `adminAccessFor` y src/lib/udesa.ts).
 * `email_verified` llega en el perfil de Google; si falta o no es `true`, no se entra.
 */
export function canSignIn(profile: { email?: string | null; email_verified?: boolean | null } | null | undefined): boolean {
  return !!profile?.email && profile.email_verified === true;
}

type AdminUserRow = { id: string; role: "ADMIN" | "EDITOR"; sections: string[]; active: boolean };

/**
 * El acceso a /admin de una sesión: solo si el mail es @udesa.edu.ar Y la fila de `AdminUser` está activa. Un mail
 * externo no obtiene rol aunque alguien lo haya cargado a mano en `AdminUser` (defensa en profundidad: el login
 * ya no filtra por dominio). Sin acceso devuelve `adminId` y `role` en null y `sections` vacío.
 */
export function adminAccessFor(email: string, adminUser: AdminUserRow | null | undefined) {
  if (!isUdesaEmail(email) || !adminUser?.active) {
    return { adminId: null, role: null, sections: [] as string[] };
  }
  return { adminId: adminUser.id, role: adminUser.role, sections: adminUser.sections };
}
