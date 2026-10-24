// Reglas del feedback (#120) que comparten el formulario (cliente) y la server action. Sin dependencias de
// servidor: lo que necesita `node:crypto` o la base está en spam.ts.

export const FEEDBACK_TYPES = ["BUG", "CONTENIDO", "IDEA", "OTRO"] as const;
export type FeedbackTypeId = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackTypeId, string> = {
  BUG: "Bug",
  CONTENIDO: "Contenido incorrecto",
  IDEA: "Idea",
  OTRO: "Otro",
};

export const FEEDBACK_STATUSES = ["NUEVO", "EN_CURSO", "RESUELTO", "DESCARTADO"] as const;
export type FeedbackStatusId = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatusId, string> = {
  NUEVO: "Nuevo",
  EN_CURSO: "En curso",
  RESUELTO: "Resuelto",
  DESCARTADO: "Descartado",
};

/** Campo trampa del formulario (#121): una persona no lo ve ni lo completa; un bot que llena todo, sí. */
export const HONEYPOT_FIELD = "website";

export const FEEDBACK_MAX_LENGTH = 2000;
const PATH_MAX_LENGTH = 300;
const EMAIL_MAX_LENGTH = 254;
const USER_AGENT_MAX_LENGTH = 500;

export type FeedbackInput = {
  type: FeedbackTypeId;
  message: string;
  path: string;
  viewport: string | null;
  theme: "light" | "dark" | null;
  email: string | null;
};

export type ValidationResult = { ok: true; data: FeedbackInput } | { ok: false; error: string };

/**
 * Normaliza la ruta donde se tocó el botón: tiene que ser una ruta propia del sitio y se guarda sin query
 * string ni hash (pueden traer `next=`, tokens, etc.). Mismo criterio que safeNext: se resuelve contra un
 * origen ficticio y se exige que no cambie. Devuelve null si no es una ruta interna.
 */
export function normalizePath(raw: string): string | null {
  if (!raw.startsWith("/") || /[\\\t\r\n]/.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw, "http://x.invalid");
  } catch {
    return null;
  }
  if (url.origin !== "http://x.invalid") return null;
  return url.pathname.slice(0, PATH_MAX_LENGTH);
}

/** Valida en el servidor lo que manda el formulario. Lo opcional que viene mal (viewport, tema) se descarta en vez de rechazar el envío. */
export function validateFeedback(fields: {
  type: string;
  message: string;
  path: string;
  viewport?: string;
  theme?: string;
  email?: string;
}): ValidationResult {
  if (!(FEEDBACK_TYPES as readonly string[]).includes(fields.type)) return { ok: false, error: "Elegí un tipo de feedback." };

  const message = fields.message.trim();
  if (!message) return { ok: false, error: "Escribí tu comentario." };
  if (message.length > FEEDBACK_MAX_LENGTH) return { ok: false, error: `El comentario puede tener hasta ${FEEDBACK_MAX_LENGTH} caracteres.` };

  const path = normalizePath(fields.path);
  if (!path) return { ok: false, error: "No se pudo leer la página. Recargala y probá de nuevo." };

  const email = (fields.email ?? "").trim().toLowerCase();
  if (email && (email.length > EMAIL_MAX_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return { ok: false, error: "Ese email no parece válido. Podés dejarlo vacío." };
  }

  const viewport = /^\d{1,5}x\d{1,5}$/.test(fields.viewport ?? "") ? fields.viewport! : null;
  const theme = fields.theme === "light" || fields.theme === "dark" ? fields.theme : null;

  return { ok: true, data: { type: fields.type as FeedbackTypeId, message, path, viewport, theme, email: email || null } };
}

export function trimUserAgent(userAgent: string | null): string | null {
  return userAgent ? userAgent.slice(0, USER_AGENT_MAX_LENGTH) : null;
}
