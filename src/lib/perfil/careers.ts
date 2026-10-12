// Catalogo de carreras de grado de UdeSA, para el selector de carrera(s) del perfil (ver
// CareerSelect.tsx). Fuente: udesa.edu.ar/carreras (2026-10-11). La universidad puede agregar
// o renombrar carreras: si el selector queda desactualizado, actualizar esto a mano (no hay
// una API que lo mantenga sincronizado).
//
// Agrupadas por area (no es la facultad oficial de UdeSA, es solo para que el selector muestre
// grupos grandes en vez de 18 carreras sueltas en una lista larga).
export const CAREER_GROUPS = [
  {
    id: "ingenieria",
    label: "Ingeniería",
    careers: [
      { slug: "ingenieria-ia", label: "Ingeniería en Inteligencia Artificial" },
      { slug: "ingenieria-biotecnologia", label: "Ingeniería en Biotecnología" },
      { slug: "ingenieria-industrial", label: "Ingeniería Industrial" },
      { slug: "ingenieria-tecnologias-sustentables", label: "Ingeniería en Tecnologías Sustentables" },
    ],
  },
  {
    id: "negocios",
    label: "Negocios y Economía",
    careers: [
      { slug: "administracion-empresas", label: "Licenciatura en Administración de Empresas" },
      { slug: "economia", label: "Licenciatura en Economía" },
      { slug: "economia-empresarial", label: "Licenciatura en Economía Empresarial" },
      { slug: "finanzas", label: "Licenciatura en Finanzas" },
      { slug: "negocios-digitales", label: "Licenciatura en Negocios Digitales" },
    ],
  },
  {
    id: "humanidades",
    label: "Humanidades y Ciencias Sociales",
    careers: [
      { slug: "humanidades", label: "Licenciatura en Humanidades" },
      { slug: "ciencias-educacion", label: "Licenciatura en Ciencias de la Educación" },
      { slug: "ciencias-comportamiento", label: "Licenciatura en Ciencias del Comportamiento" },
      { slug: "ciencia-politica-gobierno", label: "Licenciatura en Ciencia Política y Gobierno" },
      { slug: "relaciones-internacionales", label: "Licenciatura en Relaciones Internacionales" },
      { slug: "profesorado-educacion-primaria", label: "Profesorado en Educación Primaria" },
    ],
  },
  {
    id: "diseno-comunicacion",
    label: "Diseño y Comunicación",
    careers: [
      { slug: "diseno", label: "Licenciatura en Diseño" },
      { slug: "comunicacion", label: "Licenciatura en Comunicación" },
    ],
  },
  {
    id: "derecho",
    label: "Derecho",
    careers: [{ slug: "abogacia", label: "Abogacía" }],
  },
] as const;

// No es una carrera real de UdeSA: cuando se elige, el formulario pide especificarla a mano
// (ver UserProfile.otherCareer).
export const OTHER_CAREER_SLUG = "otra";

// UdeSA es de 1988; antes de esa fecha no hay carreras que elegir. Usado tanto por el <select>
// de año de inicio (PerfilForm) como por la validacion del servidor (perfil/actions.ts).
export const MIN_START_YEAR = 1990;

export const ALL_CAREER_SLUGS: string[] = [
  ...CAREER_GROUPS.flatMap((g) => g.careers.map((c) => c.slug)),
  OTHER_CAREER_SLUG,
];

export function careerLabel(slug: string): string {
  if (slug === OTHER_CAREER_SLUG) return "Otra";
  for (const group of CAREER_GROUPS) {
    const found = group.careers.find((c) => c.slug === slug);
    if (found) return found.label;
  }
  return slug;
}
