import { isUdesaEmail, UDESA_EMAIL_DOMAIN } from "@/lib/udesa";

export const TEAM_NAME_MAX_LENGTH = 60;

// Forma básica de un email (algo@dominio.tld): no pretende validar de verdad, solo atajar errores de tipeo.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export type TeamInput = {
  name: string;
  /** Email de la sesión del capitán. */
  captainEmail: string;
  /** Los demás integrantes, como los tipeó el capitán (el capitán no va acá: se suma solo). */
  memberEmails: string[];
  /** Integrantes mínimo y máximo, capitán incluido (los fija el evento). */
  minSize: number;
  maxSize: number;
};

export type TeamValidation = { ok: true; name: string; emails: string[] } | { ok: false; errors: string[] };

/**
 * Valida un equipo antes de guardarlo. Los emails (el del capitán y los que carga) se normalizan a minúsculas;
 * todos tienen que ser @udesa.edu.ar, sin repetidos, y la cantidad (capitán incluido) tiene que estar entre el mínimo y
 * el máximo del evento. Las filas vacías se ignoran. Si está bien, devuelve los emails con el capitán primero.
 * Si no, todos los errores juntos, para que el capitán los corrija de una vez. Que alguien ya esté en otro equipo lo
 * decide la base (ver src/app/eventos/team-actions.ts).
 */
export function validateTeam({ name, captainEmail, memberEmails, minSize, maxSize }: TeamInput): TeamValidation {
  const errors: string[] = [];
  const teamName = name.trim().replace(/\s+/g, " ");
  if (!teamName) errors.push("Poné un nombre para el equipo.");
  else if (teamName.length > TEAM_NAME_MAX_LENGTH) errors.push(`El nombre del equipo puede tener hasta ${TEAM_NAME_MAX_LENGTH} caracteres.`);

  const captain = normalizeEmail(captainEmail);
  const others = memberEmails.map(normalizeEmail).filter(Boolean);
  const all = [captain, ...others];

  const seen = new Set<string>();
  const reportedRepeats = new Set<string>();
  for (const email of all) {
    if (!EMAIL_SHAPE.test(email)) errors.push(`"${email}" no es un email válido.`);
    else if (!isUdesaEmail(email)) errors.push(`${email} no es un email ${UDESA_EMAIL_DOMAIN}: todos los integrantes tienen que serlo.`);
    if (seen.has(email) && !reportedRepeats.has(email)) {
      reportedRepeats.add(email);
      errors.push(email === captain ? `${email} sos vos: el capitán ya cuenta, no lo repitas.` : `${email} está repetido.`);
    }
    seen.add(email);
  }

  const size = seen.size;
  if (size < minSize || size > maxSize) {
    const range = minSize === maxSize ? `${minSize}` : `entre ${minSize} y ${maxSize}`;
    errors.push(`El equipo tiene que tener ${range} integrantes, contándote a vos (ahora son ${size}).`);
  }

  return errors.length ? { ok: false, errors } : { ok: true, name: teamName, emails: all };
}
