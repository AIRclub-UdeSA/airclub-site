import type { MetadataRoute } from "next";
import { getAllEventSlugs } from "@/lib/events";
import { SITE_URL } from "@/lib/seo";

// Solo rutas públicas que responden 200: /proximamente y lo que redirige ahí (/plataformas, /proyectos) no van.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const eventSlugs = await getAllEventSlugs();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/eventos", "/talks", "/equipo", "/contacto"].map((path) => ({
    url: new URL(path || "/", SITE_URL).toString(),
    lastModified: new Date(),
  }));

  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map((slug) => ({
    url: new URL(`/eventos/${slug}`, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...eventRoutes];
}
