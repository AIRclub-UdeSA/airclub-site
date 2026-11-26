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
  /** Integrantes mínimo y máximo, capitán incluido (los fija el evento). null = sin límite de ese lado. */
  minSize: number | null;
  maxSize: number | null;
};

/**
 * El tamaño de equipo que pide el evento, en una frase que empieza en minúscula: "entre 2 y 4 integrantes", "hasta 20
 * integrantes", "al menos 2 integrantes", "sin límite de integrantes". Quien la use al principio de una oración la capitaliza.
 */
export function teamSizeText(minSize: number | null, maxSize: number | null): string {
  const plural = (n: number) => (n === 1 ? "1 integrante" : `${n} integrantes`);
  if (minSize !== null && maxSize !== null) return minSize === maxSize ? plural(minSize) : `entre ${minSize} y ${maxSize} integrantes`;
  if (maxSize !== null) return `hasta ${plural(maxSize)}`;
  if (minSize !== null) return `al menos ${plural(minSize)}`;
  return "sin límite de integrantes";
}

/** Cuántas filas de email de "los demás integrantes" muestra el formulario al empezar: las del mínimo, y al menos una. */
export function initialMemberRows(minSize: number | null, maxSize: number | null): number {
  return Math.min(Math.max((minSize ?? 1) - 1, 1), (maxSize ?? Infinity) - 1);
}

export type TeamValidation = { ok: true; name: string; emails: string[] } | { ok: false; errors: string[] };

/**
 * Valida un equipo antes de guardarlo. Los emails (el del capitán y los que carga) se normalizan a minúsculas;
 * todos tienen que ser @udesa.edu.ar, sin repetidos, y la cantidad (capitán incluido) tiene que estar entre el mínimo y
 * el máximo del evento (si no fija alguno, sin límite de ese lado; un equipo tiene al menos al capitán). Las filas vacías se ignoran. Si está bien, devuelve los emails con el capitán primero.
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
  if (size < (minSize ?? 1) || size > (maxSize ?? Infinity)) {
    errors.push(`El equipo tiene que tener ${teamSizeText(minSize, maxSize)}, contándote a vos (ahora son ${size}).`);
  }

  return errors.length ? { ok: false, errors } : { ok: true, name: teamName, emails: all };
}
