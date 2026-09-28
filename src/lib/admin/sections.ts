// Lista de secciones que se pueden asignar a un Editor en /admin/usuarios. Se va a ir
// agregando una entrada por cada sección de contenido que sume su propio panel (empezando
// por "talks" en la Etapa 4 del plan de admin).
export const ADMIN_SECTIONS = [{ id: "talks", label: "Charlas" }] as const;

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]["id"];

export function sectionLabel(id: string): string {
  return ADMIN_SECTIONS.find((s) => s.id === id)?.label ?? id;
}
