import type { MetadataRoute } from "next";
import { getAllEventSlugs } from "@/lib/events";
import { getWorkshopItems, getWorkshopTracks, trackHref, workshopHref } from "@/lib/workshops";
import { SITE_URL } from "@/lib/seo";

// Solo rutas públicas que responden 200: /proximamente y lo que redirige ahí (/plataformas, /proyectos) no van.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [eventSlugs, tracks, workshops] = await Promise.all([getAllEventSlugs(), getWorkshopTracks(), getWorkshopItems()]);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/eventos", "/talks", "/workshops", "/equipo", "/contacto", "/privacidad"].map((path) => ({
    url: new URL(path || "/", SITE_URL).toString(),
    lastModified: new Date(),
  }));

  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map((slug) => ({
    url: new URL(`/eventos/${slug}`, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  const workshopRoutes: MetadataRoute.Sitemap = [...tracks.map((t) => trackHref(t.key)), ...workshops.map(workshopHref)].map(
    (path) => ({ url: new URL(path, SITE_URL).toString(), lastModified: new Date() }),
  );

  return [...staticRoutes, ...eventRoutes, ...workshopRoutes];
}
