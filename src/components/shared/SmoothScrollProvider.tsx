"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setSmoothScroll } from "@/lib/smooth-scroll";

/** Scroll suave con inercia (Lenis). Se desactiva con `prefers-reduced-motion`. */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
  }, []);

  return <>{children}</>;
}
