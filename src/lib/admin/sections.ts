// Lista de secciones que se pueden asignar a un Editor en /admin/usuarios. Cada sección de
// contenido que sume su propio panel agrega su entrada acá, y su tarjeta en /admin (page.tsx).
export const ADMIN_SECTIONS = [{ id: "talks", label: "Charlas" }] as const;

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]["id"];

export function sectionLabel(id: string): string {
  return ADMIN_SECTIONS.find((s) => s.id === id)?.label ?? id;
}
