import type { Metadata } from "next";

export const SITE_NAME = "AIR Club UdeSA";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function buildMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
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
