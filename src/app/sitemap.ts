import type { MetadataRoute } from "next";
import { getAllEventSlugs } from "@/lib/events";
import { getRobots } from "@/lib/robots";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [eventSlugs, robots] = await Promise.all([getAllEventSlugs(), getRobots()]);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/eventos", "/plataformas", "/equipo", "/contacto"].map((path) => ({
    url: new URL(path || "/", SITE_URL).toString(),
    lastModified: new Date(),
  }));

  const eventRoutes: MetadataRoute.Sitemap = eventSlugs.map((slug) => ({
    url: new URL(`/eventos/${slug}`, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  const robotRoutes: MetadataRoute.Sitemap = robots.map((robot) => ({
    url: new URL(`/plataformas/${robot.slug}`, SITE_URL).toString(),
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...eventRoutes, ...robotRoutes];
}
