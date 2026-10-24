// Lista de secciones que se pueden asignar a un Editor en /admin/usuarios. Cada sección de
// contenido que sume su propio panel agrega su entrada acá, y su tarjeta en /admin (page.tsx).
//
// `access` dice qué puede hacer un Editor que la tiene asignada:
// - "edit": ver y editar (crear, cambiar, borrar).
// - "view": solo ver. Las acciones de escritura de esa sección quedan para ADMIN.
// Ver #97: se eligió un nivel por sección y no un rol global de "lector", así cada página
// nueva no tiene que acordarse de frenar a un rol más. Ante la duda, una sección nueva va con "edit"
// solo si de verdad un Editor tiene que poder escribir en ella.
export const ADMIN_SECTIONS = [
  { id: "talks", label: "Charlas", access: "edit" },
  { id: "equipo", label: "Equipo", access: "edit" },
  { id: "workshops", label: "Workshops", access: "edit" },
  { id: "comunidad", label: "Comunidad", access: "view" },
  // Ver: lista y detalle. Editar: cambiar el estado (#123).
  { id: "feedback", label: "Feedback", access: "edit" },
] as const;

export type AdminSectionId = (typeof ADMIN_SECTIONS)[number]["id"];

type SectionHolder = { role: "ADMIN" | "EDITOR"; sections: string[] };

function findSection(id: string) {
  return ADMIN_SECTIONS.find((s) => s.id === id);
}

export function sectionLabel(id: string): string {
  return findSection(id)?.label ?? id;
}

/** Etiqueta para asignar secciones en /admin/usuarios: aclara las que son de solo ver. */
export function sectionAssignLabel(id: string): string {
  const section = findSection(id);
  if (!section) return id;
  return section.access === "view" ? `${section.label} (solo ver)` : section.label;
}

/** true si la sesión puede ver `section` (ADMIN ve todas; un Editor, las que tiene asignadas). */
export function canViewSection(admin: SectionHolder, section: string): boolean {
  return admin.role === "ADMIN" || admin.sections.includes(section);
}

/**
 * true si la sesión puede escribir en `section`. ADMIN puede en todas; un Editor, solo en las
 * asignadas cuyo nivel es "edit". Una sección que no está en ADMIN_SECTIONS es solo de ADMIN.
 */
export function canEditSection(admin: SectionHolder, section: string): boolean {
  if (admin.role === "ADMIN") return true;
  return admin.sections.includes(section) && findSection(section)?.access === "edit";
}
