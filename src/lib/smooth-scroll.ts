import type Lenis from "lenis";

// Instancia única de Lenis (la crea SmoothScrollProvider). Con movimiento reducido no hay instancia y se cae al scroll nativo.
let instance: Lenis | null = null;

export function setSmoothScroll(lenis: Lenis | null) {
  instance = lenis;
}

/** Lleva la página a un selector (`#contenido`) o a una posición, con Lenis si está activo y con scroll nativo si no. */
export function scrollToTarget(target: string | number, duration = 1.2) {
  if (instance) {
    instance.scrollTo(target, { duration });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}
