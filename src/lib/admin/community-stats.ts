import { careerLabel } from "@/lib/perfil/careers";

export const ROLE_LABELS = { STUDENT: "Estudiante", PROFESSOR: "Profesor/a", OTHER: "Otro" } as const;
export const STATUS_LABELS = { STUDYING: "Cursando", GRADUATED: "Recibido/a" } as const;

export type ProfileLike = {
  role: keyof typeof ROLE_LABELS;
  otherRole: string | null;
  careers: string[];
  otherCareer: string | null;
  startYear: number | null;
  studentStatus: keyof typeof STATUS_LABELS | null;
};

export type Bucket = { label: string; count: number };

export type Distributions = {
  role: Bucket[];
  career: Bucket[];
  startYear: Bucket[];
  status: Bucket[];
};

function tally(into: Map<string, number>, key: string) {
  into.set(key, (into.get(key) ?? 0) + 1);
}

function sorted(map: Map<string, number>, by: "count" | "label" = "count"): Bucket[] {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => (by === "label" ? a.label.localeCompare(b.label, "es") : b.count - a.count || a.label.localeCompare(b.label, "es")));
}

/** Detalle de la carrera "Otra": se muestra como "Otra: <lo que escribió>". */
export function careerText(slug: string, otherCareer: string | null): string {
  const label = careerLabel(slug);
  return label === "Otra" ? (otherCareer ? `Otra: ${otherCareer}` : "Otra") : label;
}

/**
 * Distribuciones de un grupo de personas. `null` = no tiene perfil (se cuenta aparte, como
 * "Sin perfil", solo en el rol). Carrera, año y estado solo existen para estudiantes; una
 * persona con dos carreras cuenta en cada una.
 */
export function distributions(profiles: (ProfileLike | null)[]): Distributions {
  const role = new Map<string, number>();
  const career = new Map<string, number>();
  const year = new Map<string, number>();
  const status = new Map<string, number>();

  for (const p of profiles) {
    if (!p) {
      tally(role, "Sin perfil");
      continue;
    }
    tally(role, ROLE_LABELS[p.role]);
    if (p.role !== "STUDENT") continue;
    for (const slug of p.careers) tally(career, careerText(slug, p.otherCareer));
    if (p.startYear) tally(year, String(p.startYear));
    if (p.studentStatus) tally(status, STATUS_LABELS[p.studentStatus]);
  }

  return { role: sorted(role), career: sorted(career), startYear: sorted(year, "label"), status: sorted(status) };
}

/** Una celda de CSV: comillas dobles escapadas y, contra la inyección de fórmulas, un apóstrofo si empieza con = + - @. */
export function csvCell(value: string | number | null | undefined): string {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
