import type { NextConfig } from "next";
import { storagePublicPrefix } from "./src/lib/storage-url";

// Solo nuestro proyecto de Supabase y solo el bucket público, no `*.supabase.co`: un comodín
// dejaría que cualquiera use nuestro optimizador de imágenes (y su cuota) con imágenes de otros proyectos.
const storagePrefix = storagePublicPrefix(process.env.SUPABASE_URL);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      ...(storagePrefix ? [new URL(`${storagePrefix}**`)] : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
