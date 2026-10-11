"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { setSmoothScroll } from "@/lib/smooth-scroll";

/** Scroll suave con inercia (Lenis). Se desactiva con `prefers-reduced-motion` y en `/perfil`. */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  // El formulario de /perfil cambia de alto seguido (grupos de carreras, campos que aparecen segun el rol)
  // y con la inercia se pierde el cambio mientras se scrollea.
  const off = usePathname().startsWith("/perfil");

  useEffect(() => {
    if (off || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      // El modal de /talks y los paneles de /admin tienen su propio scroll interno: sin esto Lenis los traba.
      allowNestedScroll: true,
      autoRaf: true,
    });
    setSmoothScroll(lenis);

    return () => {
      setSmoothScroll(null);
      lenis.destroy();
    };
  }, [off]);

  return <>{children}</>;
}
