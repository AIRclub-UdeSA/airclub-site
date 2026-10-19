/**
 * Datos estructurados para buscadores (ver src/lib/structured-data.ts). No se ven en la página.
 * El replace de "<" evita que un texto cargado desde /admin cierre el <script> (recomendación de la guía de Next).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | undefined }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
