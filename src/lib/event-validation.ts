import { AUDIENCE_REQUIRED_ERROR, type Audience } from "@/lib/udesa";
import { isOwnRegistration, type RegistrationType } from "@/lib/event-registration";

export type EventFormData = {
  slug: string;
  title: string;
  description: string;
  startsAt: Date | null;
  endsAt: Date | null;
  registrationType: RegistrationType | null;
  externalUrl: string | null;
  registrationDeadline: Date | null;
  audience: Audience | null;
  // Vacío = null. Un valor que no es un número queda como NaN para que lo rechace la validación.
  capacity: number | null;
  teamMinSize: number | null;
  teamMaxSize: number | null;
};

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const isPositiveInt = (n: number | null): n is number => n !== null && Number.isInteger(n) && n >= 1;

/**
 * Chequea lo que carga el panel de /admin/eventos. Devuelve el primer error en castellano, o null si está bien. Solo mira
 * lo que corresponde al tipo de inscripción elegido: lo de otros tipos se descarta al guardar (ver normalizeEventData).
 */
export function validateEventData(data: EventFormData): string | null {
  if (!data.slug) return "El slug es obligatorio.";
  if (!/^[a-z0-9-]+$/.test(data.slug)) return "El slug solo puede tener minúsculas, números y guiones.";
  if (!data.title) return "El título es obligatorio.";
  if (!data.description) return "La descripción es obligatoria.";
  if (!data.startsAt || Number.isNaN(data.startsAt.getTime())) return "El evento necesita fecha de inicio.";
  if (data.endsAt && data.endsAt < data.startsAt) return "La fecha de fin no puede ser anterior a la de inicio.";
  if (!data.registrationType) return "Elegí cómo se inscribe la gente.";

  if (data.registrationType === "EXTERNAL_LINK") {
    if (!data.externalUrl) return "El link externo necesita una URL.";
    if (!isHttpUrl(data.externalUrl)) return "El link externo tiene que ser una URL (https://…).";
  }

  if (isOwnRegistration(data.registrationType)) {
    if (!data.audience) return AUDIENCE_REQUIRED_ERROR;
    if (data.capacity !== null && !isPositiveInt(data.capacity)) {
      return `El cupo tiene que ser un número entero mayor a 0, o quedar vacío (sin límite).`;
    }
    if (data.registrationDeadline) {
      if (Number.isNaN(data.registrationDeadline.getTime())) return "La fecha de cierre no es válida.";
      if (data.registrationDeadline > (data.endsAt ?? data.startsAt)) return "La inscripción tiene que cerrar antes de que termine el evento.";
    }
  }

  if (data.registrationType === "TEAM") {
    // validateTeam exige @udesa.edu.ar a todos los integrantes, capitán incluido: con "cualquier persona" una cuenta de
    // Gmail vería el botón habilitado y recién fallaría al guardar el equipo.
    if (data.audience !== "UDESA") return "Un evento por equipos es solo para la comunidad UdeSA: todos los integrantes tienen que tener email @udesa.edu.ar.";
    if (!isPositiveInt(data.teamMinSize) || !isPositiveInt(data.teamMaxSize)) {
      return "Poné el mínimo y el máximo de integrantes (números enteros desde 1, capitán incluido).";
    }
    if (data.teamMaxSize < data.teamMinSize) return "El máximo de integrantes no puede ser menor que el mínimo.";
  }
  return null;
}

/** Lo que se guarda de la inscripción: solo lo que usa el tipo elegido, el resto queda vacío (como las charlas con sus excluyentes). */
export function normalizeRegistration(data: EventFormData) {
  const own = isOwnRegistration(data.registrationType ?? undefined);
  return {
    externalUrl: data.registrationType === "EXTERNAL_LINK" ? data.externalUrl : null,
    registrationDeadline: own ? data.registrationDeadline : null,
    audience: own ? data.audience : ("ALL" as const),
    capacity: own ? data.capacity : null,
    teamMinSize: data.registrationType === "TEAM" ? data.teamMinSize : null,
    teamMaxSize: data.registrationType === "TEAM" ? data.teamMaxSize : null,
  };
}
