// URLs de /workshops. Sin dependencias de servidor (src/lib/workshops.ts lee de Prisma): los componentes cliente las
// importan de acá.

/** Página de un workshop. */
export const trackHref = (key: string) => `/workshops/${key}`;
/** Página de un taller: va adentro de su workshop. */
export const workshopHref = (w: { slug: string; track: string }) => `${trackHref(w.track)}/${w.slug}`;
