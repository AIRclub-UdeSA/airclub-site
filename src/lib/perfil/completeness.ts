import type { ProfileAffiliation } from "../../../generated/prisma/client";

export const AFFILIATION_LABELS: Record<ProfileAffiliation, string> = {
  UDESA: "UdeSA",
  OTHER_UNIVERSITY: "Otra universidad",
  WORK: "Trabajo o empresa",
  INDEPENDENT: "Independiente",
};

export const AFFILIATION_OPTIONS = Object.entries(AFFILIATION_LABELS) as [ProfileAffiliation, string][];

/** Con UdeSA no hace falta el nombre de la institución; con cualquier otra afiliación sí. */
export function needsInstitution(affiliation: ProfileAffiliation | null | undefined): boolean {
  return affiliation === "OTHER_UNIVERSITY" || affiliation === "WORK";
}

type CompletenessInput = {
  fullName: string | null;
  affiliation: ProfileAffiliation | null;
  institution: string | null;
  consentAcceptedAt: Date | null;
};

/** Lo que le falta cargar a un perfil, en lenguaje de pantalla. Vacío = perfil completo. */
export function missingProfileFields(profile: CompletenessInput): string[] {
  const missing: string[] = [];
  if (!profile.fullName?.trim()) missing.push("nombre y apellido");
  if (!profile.affiliation) missing.push("de dónde sos");
  else if (needsInstitution(profile.affiliation) && !profile.institution?.trim()) missing.push("el nombre de tu institución");
  if (!profile.consentAcceptedAt) missing.push("aceptar el aviso de privacidad");
  return missing;
}

/** "Perfil completo": lo exige inscribirse a una charla (ver requireRegistrantEmail). */
export function isProfileComplete(profile: CompletenessInput): boolean {
  return missingProfileFields(profile).length === 0;
}
