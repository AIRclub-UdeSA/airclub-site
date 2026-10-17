import type { Metadata } from "next";

export const SITE_NAME = "AIR Club UdeSA";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// La portada define su metadata en src/app/page.tsx; el layout raíz la usa de base para las páginas que no definen
// la suya (ahí sin canonical, ver buildMetadata).
export const HOME_TITLE = "AIR Club UdeSA, Club de Robótica e Inteligencia Artificial";
// "Club de Robótica e Inteligencia Artificial de la Universidad de San Andrés" va tal cual: es como nos buscan (#65).
export const HOME_DESCRIPTION =
  "AIR Club UdeSA es el Club de Robótica e Inteligencia Artificial de la Universidad de San Andrés: estudiantes que aprenden y crean con IA y robótica. Organizamos el Challenge JAR 2026 en Rosario.";

export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  // Sin `path` no hay canonical ni og:url: si el layout raíz los pusiera, toda página sin metadata propia
  // heredaría el de "/" y los buscadores la tomarían como un duplicado de la portada (#63).
  const url = path ? new URL(path, SITE_URL).toString() : undefined;

  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      title,
      description,
      ...(url ? { url } : {}),
      siteName: SITE_NAME,
      type: "website",
      // La imagen sale de app/opengraph-image.tsx (convencion de archivo de Next.js):
      // se genera una vez y Next la aplica automaticamente a todas las rutas.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
