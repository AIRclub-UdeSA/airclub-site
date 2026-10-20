import { MIN_START_YEAR, OTHER_CAREER_SLUG } from "./careers";
import { needsInstitution } from "./completeness";

/**
 * Validación del formulario de perfil en el cliente, para mostrar cada error junto a su campo y llevar el foco al primero.
 * Replica las reglas de saveProfileAction (src/app/perfil/actions.ts), que sigue siendo la que decide: si algo se cuela,
 * el servidor lo rechaza y su mensaje sale arriba del botón.
 */

/** Orden de los campos en la pantalla: el primero con error recibe el foco. */
export const FIELD_ORDER = [
  "fullName",
  "affiliation",
  "institution",
  "role",
  "otherRole",
  "studentStatus",
  "careers",
  "otherCareer",
  "startYear",
  "consent",
] as const;

export type ProfileField = (typeof FIELD_ORDER)[number];
export type FieldErrors = Partial<Record<ProfileField, string>>;

export type ProfileFormValues = {
  fullName: string;
  affiliation: string;
  institution: string;
  role: string;
  otherRole: string;
  studentStatus: string;
  careers: string[];
  otherCareer: string;
  startYear: string;
  consent: boolean;
};

const MAX_TEXT_LENGTH = 120;

export function validateProfileForm(v: ProfileFormValues, currentYear: number): FieldErrors {
  const errors: FieldErrors = {};

  const fullName = v.fullName.trim().replace(/\s+/g, " ");
  if (fullName.length < 2 || !fullName.includes(" ")) errors.fullName = "Escribí tu nombre y apellido.";
  else if (fullName.length > MAX_TEXT_LENGTH) errors.fullName = "El nombre es demasiado largo.";

  if (!["UDESA", "OTHER_UNIVERSITY", "WORK", "INDEPENDENT"].includes(v.affiliation)) {
    errors.affiliation = "Contanos de dónde sos.";
  } else if (needsInstitution(v.affiliation as Parameters<typeof needsInstitution>[0])) {
    const institution = v.institution.trim();
    if (!institution) {
      errors.institution = v.affiliation === "WORK" ? "Contanos en qué empresa o lugar trabajás." : "Contanos de qué universidad sos.";
    } else if (institution.length > MAX_TEXT_LENGTH) errors.institution = "El nombre de la institución es demasiado largo.";
  }

  if (!["STUDENT", "PROFESSOR", "OTHER"].includes(v.role)) {
    errors.role = "Elegí una opción: estudiante, profesor u otro.";
  } else if (v.role === "OTHER") {
    if (!v.otherRole.trim()) errors.otherRole = "Contanos qué rol tenés.";
  } else if (v.role === "STUDENT") {
    if (v.studentStatus !== "STUDYING" && v.studentStatus !== "GRADUATED") {
      errors.studentStatus = "Decinos si estás cursando actualmente o ya te recibiste.";
    }

    const otherCareer = v.otherCareer.trim();
    if (v.affiliation === "UDESA") {
      if (v.careers.length === 0) errors.careers = "Elegí al menos una carrera.";
      else if (v.careers.includes(OTHER_CAREER_SLUG) && !otherCareer) errors.otherCareer = "Contanos qué carrera estás cursando.";
    } else if (v.affiliation && !otherCareer) {
      errors.otherCareer = "Contanos qué carrera estudiás.";
    }
    if (otherCareer.length > MAX_TEXT_LENGTH) errors.otherCareer = "El nombre de la carrera es demasiado largo.";

    if (v.studentStatus === "STUDYING") {
      const year = Number(v.startYear);
      if (!v.startYear) errors.startYear = "Elegí el año en que empezaste la carrera.";
      else if (!Number.isInteger(year) || year < MIN_START_YEAR || year > currentYear) {
        errors.startYear = `El año de inicio tiene que estar entre ${MIN_START_YEAR} y ${currentYear}.`;
      }
    }
  }

  if (!v.consent) errors.consent = "Para guardar el perfil tenés que aceptar el aviso de privacidad.";

  return errors;
}

/** El primer campo con error, en el orden de la pantalla (o null si no hay). */
export function firstInvalidField(errors: FieldErrors): ProfileField | null {
  return FIELD_ORDER.find((f) => errors[f]) ?? null;
}
