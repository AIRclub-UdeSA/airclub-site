import type { Audience } from "@/lib/udesa";

// Los tipos de inscripción de un evento. Igual que el enum RegistrationType de schema.prisma; se repite acá para que
// lo pueda importar el cliente sin traer Prisma. Los campos de cada tipo viven en el código: un evento que necesite otra
// forma suma un tipo nuevo una vez (acá, en el schema y en el formulario de /admin/eventos) y después se elige desde el panel.
export type RegistrationType = "NONE" | "EXTERNAL_LINK" | "INDIVIDUAL" | "TEAM";

/** Lo que dice el selector "Cómo se inscribe la gente" del panel, en orden. */
export const REGISTRATION_TYPE_OPTIONS: { value: RegistrationType; label: string; hint: string }[] = [
  { value: "NONE", label: "Sin inscripción", hint: "El evento se muestra, pero no tiene botón de inscripción." },
  { value: "EXTERNAL_LINK", label: "Link externo", hint: "El botón lleva a un sitio o formulario de afuera." },
  { value: "INDIVIDUAL", label: "Individual", hint: "Un clic con la cuenta de Google y los datos del perfil, como en las charlas." },
  { value: "TEAM", label: "Equipo", hint: "Una persona inscribe a su equipo con un nombre y los emails de los integrantes." },
];

export function parseRegistrationType(value: unknown): RegistrationType | null {
  return REGISTRATION_TYPE_OPTIONS.some((o) => o.value === value) ? (value as RegistrationType) : null;
}

/** El tipo de inscripción cuyo botón abre un diálogo en el sitio (los otros llevan a un link o no hay botón). */
export function isOwnRegistration(type: RegistrationType | undefined): type is "INDIVIDUAL" | "TEAM" {
  return type === "INDIVIDUAL" || type === "TEAM";
}

/** Texto del botón cuando el panel no cargó uno. */
export function defaultCtaLabel(type: RegistrationType | undefined): string {
  return type === "TEAM" ? "Inscribir mi equipo" : "Inscribirme";
}

/** Lo que hace falta saber de un evento para decidir si se puede inscribir (sirve igual en el servidor y en el cliente). */
export type RegistrationConfig = {
  registrationType?: RegistrationType;
  registrationOpen?: boolean;
  registrationDeadline?: Date | null;
  startsAt: Date;
  endsAt?: Date | null;
  audience?: Audience;
};

/**
 * Si el evento está recibiendo inscripciones ahora: es de un tipo propio del sitio, está abierta desde el panel, no pasó
 * la fecha de cierre y el evento no terminó. Sin fecha de cierre, se inscribe hasta que el evento termina.
 */
export function isRegistrationOpen(event: RegistrationConfig, now = new Date()): boolean {
  if (!isOwnRegistration(event.registrationType) || !event.registrationOpen) return false;
  if (event.registrationDeadline) return now.getTime() <= event.registrationDeadline.getTime();
  return (event.endsAt ?? event.startsAt).getTime() >= now.getTime();
}
