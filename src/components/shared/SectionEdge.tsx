"use client";

import { useEffect, useRef } from "react";

const W = 1440;
const H = 100; // alto del viewBox; el alto real lo da --edge-h

/**
 * Curva suave que une una sección con la anterior, en lugar de un corte recto: es la "colina" de la sección que
 * viene, pintada de su color, que sube sobre el final de la de arriba. Con el scroll la cima se desliza de lado y
 * se aplana un poco, pero nunca llega a ser una recta. Cada borde recibe su propia forma (`peak`, `amp`) para que no
 * se repita el mismo arco en toda la página.
 *
 * Se coloca ENTRE dos secciones. Las de arriba necesitan al menos `--edge-h` de padding inferior (globals.css).
 */
export function SectionEdge({
  color,
  peak = [0.22, 0.7],
  amp = [1, 0.6],
  transition,
}: {
  /** Color de la sección que sigue (cualquier valor de `fill` CSS, por ejemplo `var(--bg2)`). */
  color: string;
  /** Posición horizontal de la cima (0 a 1) al entrar y al llegar arriba. Invertirlos espeja el movimiento. */
  peak?: [number, number];
  /** Altura relativa de la colina (0 a 1) al entrar y al llegar arriba. */
  amp?: [number, number];
  /** Duración (ms) de la transición de color, para las secciones que cambian de color (el carrusel). */
  transition?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      raf = 0;
      // p = 0 cuando el borde asoma por abajo de la ventana, 1 cuando llega al tope.
      const vh = window.innerHeight;
      const p = reduced ? 0.5 : Math.min(1, Math.max(0, 1 - wrap.getBoundingClientRect().top / vh));
      path.setAttribute("d", edgePath(lerp(amp[0], amp[1], p), lerp(peak[0], peak[1], p)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    if (reduced) return;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [peak, amp]);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none relative z-20 h-0">
      <svg
        viewBox={`0 0 ${W} ${H + 1}`}
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-px block w-full"
        style={{ height: "calc(var(--edge-h) + 1px)" }}
      >
        <path
          ref={pathRef}
          d={edgePath(amp[0], peak[0])}
          style={{ fill: color, transition: transition ? `fill ${transition}ms ease-in-out` : undefined }}
        />
      </svg>
    </div>
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Colina asimétrica: sube suave por la izquierda de la cima y baja un poco más rápido por la derecha. */
function edgePath(a: number, peak: number) {
  const top = H * (1 - a);
  const x = W * peak;
  return (
    `M0 ${H + 1} L0 ${H} ` +
    `C ${x - W * 0.3} ${H}, ${x - W * 0.17} ${top}, ${x} ${top} ` +
    `S ${x + W * 0.3} ${H}, ${W} ${H} ` +
    `L${W} ${H + 1} Z`
  );
}
