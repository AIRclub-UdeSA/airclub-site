"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { getSmoothScroll, setSmoothScroll } from "@/lib/smooth-scroll";

// Mismas opciones que SmoothScrollProvider.tsx, para recrear la instancia igual al salir de esta pagina.
const LENIS_OPTIONS = {
  duration: 1.15,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
  allowNestedScroll: true,
  autoRaf: true,
} as const;

/**
 * Esta pagina cambia de alto seguido (grupos de carreras, campos que aparecen o desaparecen
 * segun el rol): la inercia de Lenis hace dificil seguir el cambio mientras se scrollea.
 * `lenis.stop()` no sirve para esto (bloquea el scroll por completo, ver lenis.css
 * ".lenis-stopped { overflow: clip }"): hay que destruir la instancia para volver al scroll
 * nativo, y recrearla igual al desmontar para no afectar al resto del sitio.
 */
export function DisableSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    getSmoothScroll()?.destroy();
    setSmoothScroll(null);

    return () => {
      setSmoothScroll(new Lenis(LENIS_OPTIONS));
    };
  }, []);

  return null;
}
