import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Lo privado no se rastrea. /admin además lleva noindex (src/app/admin/layout.tsx): un disallow solo frena el
    // rastreo, y una URL enlazada desde afuera podría indexarse igual (#63).
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/perfil", "/bienvenida"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
