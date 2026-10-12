"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const W = 1440;
const H = 100; // alto del viewBox; el alto real lo da --edge-h

type Shape = {
  /** Posición horizontal de la cima (0 a 1) al entrar y al llegar arriba. Invertirlos espeja el movimiento. */
  peak?: [number, number];
  /** Altura relativa de la colina (0 a 1) al entrar y al llegar arriba. */
  amp?: [number, number];
};

/**
 * Curva suave que une una sección con la anterior, en lugar de un corte recto: es la "colina" de la sección que
 * viene, pintada de su color, que sube sobre el final de la de arriba. Con el scroll la cima se desliza de lado y
 * se aplana un poco, pero nunca llega a ser una recta. Cada borde recibe su propia forma (`peak`, `amp`) para que no
 * se repita el mismo arco en toda la página.
 *
 * Se coloca ENTRE dos secciones. Las de arriba necesitan al menos `--edge-h` de padding inferior (globals.css).
 * Si la sección que sigue cambia de color (el carrusel), usar `useEdgeClip` en lugar de este componente: una colina
 * aparte y la sección harían dos transiciones de color que no van exactamente juntas y se vería la unión.
 */
export function SectionEdge({ color, peak = [0.22, 0.7], amp = [1, 0.6] }: Shape & {
  /** Color de la sección que sigue (cualquier valor de `fill` CSS, por ejemplo `var(--bg2)`). */
  color: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [p0, p1] = peak;
  const [a0, a1] = amp;

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;
    return onEdgeScroll(wrap, (p) => path.setAttribute("d", edgePath(lerp(a0, a1, p), lerp(p0, p1, p)))).stop;
  }, [p0, p1, a0, a1]);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none relative z-20 h-0">
      <svg
        viewBox={`0 0 ${W} ${H + 1}`}
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-px block w-full"
        style={{ height: "calc(var(--edge-h) + 1px)" }}
      >
        <path ref={pathRef} d={edgePath(a0, p0)} style={{ fill: color }} />
      </svg>
    </div>
  );
}

/**
 * La misma colina que `SectionEdge`, pero recortando la propia sección (`clip-path`) en lugar de dibujar una pieza
 * aparte: fondo, transición de color y resplandores son de un solo elemento, así que la colina nunca queda de otro
 * color. La sección se encarga de subir sobre la de arriba: `margin-top: calc(-1 * var(--edge-h))` y
 * `padding-top: var(--edge-h)`. El alto de la colina se lee de ese `padding-top`.
 */
export function useEdgeClip(ref: RefObject<HTMLElement | null>, { peak = [0.22, 0.7], amp = [1, 0.6] }: Shape = {}) {
  const [p0, p1] = peak;
  const [a0, a1] = amp;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let edgeH = 0;
    const measure = () => (edgeH = parseFloat(getComputedStyle(el).paddingTop) || 0);
    measure();
    // Igual que con SectionEdge, el avance se mide en la base de la colina (donde empieza el contenido)
    const { stop, schedule } = onEdgeScroll(
      el,
      (p) => {
        const { width, height } = el.getBoundingClientRect();
        // El SVG de SectionEdge mide `--edge-h + 1px` y se estira con preserveAspectRatio="none": se escala igual
        el.style.clipPath = `path("${edgePath(lerp(a0, a1, p), lerp(p0, p1, p), width, edgeH + 1, height)}")`;
      },
      () => edgeH,
    );
    // El ancho y el alto de la sección pueden cambiar sin scroll (fuentes, rotación del teléfono)
    const ro = new ResizeObserver(() => {
      measure();
      schedule();
    });
    ro.observe(el);
    return () => {
      stop();
      ro.disconnect();
      el.style.clipPath = "";
    };
  }, [ref, p0, p1, a0, a1]);
}

/**
 * Llama a `draw(p)` con el avance de la unión: p = 0 cuando la base de la colina asoma por abajo de la ventana, 1
 * cuando llega al tope. Con movimiento reducido queda quieta en p = 0,5. Devuelve `schedule` para pedir un redibujo y
 * `stop` para dejar de escuchar.
 */
function onEdgeScroll(el: HTMLElement, draw: (p: number) => void, offset: () => number = () => 0) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;

  const update = () => {
    raf = 0;
    const vh = window.innerHeight;
    const top = el.getBoundingClientRect().top + offset();
    draw(reduced ? 0.5 : Math.min(1, Math.max(0, 1 - top / vh)));
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return {
    schedule,
    stop: () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    },
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Colina asimétrica: sube suave por la izquierda de la cima y baja un poco más rápido por la derecha. Se dibuja en
 * el viewBox de 1440 × 101 y se escala a `w` × `h`; `bottom` es dónde se cierra la figura (el alto del SVG o, en el
 * recorte, el de toda la sección).
 */
function edgePath(a: number, peak: number, w = W, h = H + 1, bottom = h) {
  const sx = w / W;
  const sy = h / (H + 1);
  const X = (v: number) => r2(v * sx);
  const Y = (v: number) => r2(v * sy);
  const top = H * (1 - a);
  const x = W * peak;
  return (
    `M0 ${r2(bottom)} L0 ${Y(H)} ` +
    `C ${X(x - W * 0.3)} ${Y(H)}, ${X(x - W * 0.17)} ${Y(top)}, ${X(x)} ${Y(top)} ` +
    `S ${X(x + W * 0.3)} ${Y(H)}, ${X(W)} ${Y(H)} ` +
    `L${X(W)} ${r2(bottom)} Z`
  );
}
