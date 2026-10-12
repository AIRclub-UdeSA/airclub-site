"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// El sitio viejo (index.html en Netlify) navegaba con hashes: /#/equipo, /#/eventos... El servidor nunca ve el
// hash, así que esos enlaces (bios, mensajes, QR impresos) caen en la landing. Este componente los lleva a la
// página nueva. Solo mira hashes que empiezan con "#/": un ancla normal (#contenido) no se toca.
const LEGACY_ROUTES: Record<string, string> = {
  eventos: "/eventos",
  equipo: "/equipo",
  contacto: "/contacto",
  robots: "/plataformas",
};

export function LegacyHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirect = () => {
      const { hash } = window.location;
      if (!hash.startsWith("#/")) return;

      // "#/equipo/" y "#/equipo" son lo mismo. Un hash viejo desconocido (o "#/") queda en "/", sin el hash.
      const key = hash.slice(2).replace(/\/+$/, "").toLowerCase();
      router.replace(LEGACY_ROUTES[key] ?? "/", { scroll: false });
    };

    redirect();
    // Si ya se está en la landing, pegar /#/equipo en la barra solo cambia el hash: no vuelve a montar la página.
    window.addEventListener("hashchange", redirect);
    return () => window.removeEventListener("hashchange", redirect);
  }, [router]);

  return null;
}
