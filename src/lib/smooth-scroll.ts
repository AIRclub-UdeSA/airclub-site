import type Lenis from "lenis";

// Instancia única de Lenis (la crea SmoothScrollProvider). Con movimiento reducido no hay instancia y se cae al scroll nativo.
let instance: Lenis | null = null;

export function setSmoothScroll(lenis: Lenis | null) {
  instance = lenis;
}

export function getSmoothScroll(): Lenis | null {
  return instance;
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

/** Cuánto rinde cada giro de la rueda (1 = normal). Las escenas del robot lo bajan mientras están a la vista para que se alcancen a ver. No afecta al táctil (Lenis no lo intercepta). */
export function setWheelSpeed(multiplier: number) {
  if (instance) instance.options.wheelMultiplier = multiplier;
}
