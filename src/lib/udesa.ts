// Igual que el enum Audience de schema.prisma; se repite acá para que lo pueda importar el cliente sin traer Prisma.
export type Audience = "UDESA" | "ALL";

export const UDESA_EMAIL_DOMAIN = "@udesa.edu.ar";

/**
 * Si el email es de la comunidad UdeSA: sale solo del dominio del mail de la sesión (el login de Google),
 * nunca de un campo del perfil. Solo `@udesa.edu.ar`, sin subdominios ni otros dominios.
 */
export function isUdesaEmail(email: string | null | undefined): boolean {
  return !!email?.toLowerCase().endsWith(UDESA_EMAIL_DOMAIN);
}

/** Si esa cuenta puede inscribirse a un evento con esa audiencia. Cancelar no pasa por acá: siempre se puede. */
export function canRegisterTo(audience: Audience, email: string): boolean {
  return audience === "ALL" || isUdesaEmail(email);
}

/** Lo que dicen los formularios del panel; "Quién puede inscribirse" no trae ninguna preseleccionada. */
export const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "UDESA", label: "Solo la comunidad UdeSA (@udesa.edu.ar)" },
  { value: "ALL", label: "Cualquier persona con cuenta de Google" },
];

export function parseAudience(value: unknown): Audience | null {
  return value === "UDESA" || value === "ALL" ? value : null;
}

export const AUDIENCE_REQUIRED_ERROR = "Elegí quién puede inscribirse.";
