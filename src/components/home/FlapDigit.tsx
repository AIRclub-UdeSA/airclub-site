"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Un dígito de tablero mecánico (split-flap): al cambiar, la mitad de arriba del número viejo cae como una solapa y deja
 * ver el nuevo. Son tres capas: la mitad de arriba ya con el número nuevo, la de abajo todavía con el viejo, y la solapa
 * que gira 180° con el viejo-arriba por delante y el nuevo-abajo por detrás.
 *
 * Hereda tipografía y color del contenedor, así que va dentro del mismo `font-logo` de la cuenta regresiva. La línea del
 * medio (la bisagra) es del color del fondo (`--flap-seam`). Con movimiento reducido el número cambia de golpe.
 */

const SEAM = "var(--flap-seam, #0e0407)";
// Las mitades recortan con margen de sobra afuera de la caja para que no se corte el trazo de las cifras
const TOP = "inset(-30% -10% 50% -10%)";
const BOTTOM = "inset(50% -10% -30% -10%)";

function Face({ ch, clip, style }: { ch: string; clip: string; style?: React.CSSProperties }) {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center"
      style={{ clipPath: clip, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", ...style }}
    >
      {ch}
    </span>
  );
}

export function FlapDigit({ ch }: { ch: string }) {
  // `from` es el número que se está yendo; mientras no hay giro es igual a `ch`
  const [from, setFrom] = useState(ch);
  const prev = useRef(ch);
  const flap = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const old = prev.current;
      prev.current = ch;
      const el = flap.current;
      // Sin giro la primera vez (de "-" a la cifra), con movimiento reducido o sin cambio
      if (!el || old === ch || old === "-" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setFrom(ch);
        return;
      }
      setFrom(old);
      gsap.set(el, { rotateX: 0, visibility: "visible" });
      gsap
        .timeline({ onComplete: () => setFrom(ch) })
        // cae: arranca despacio y se acelera, como algo con peso
        .to(el, { rotateX: -90, duration: 0.13, ease: "power2.in" })
        // aterriza con un rebote corto
        .to(el, { rotateX: -180, duration: 0.2, ease: "bounce.out" })
        .set(el, { visibility: "hidden" });
    },
    { dependencies: [ch], scope: box },
  );

  return (
    <span ref={box} className="relative inline-block h-[0.85em] w-[0.5em]" style={{ perspective: "0.9em" }}>
      {/* mitad de arriba: ya con el número nuevo (queda tapada por la solapa mientras cae) */}
      <Face ch={ch} clip={TOP} />
      {/* mitad de abajo: con el número viejo hasta que la solapa aterriza */}
      <Face ch={from} clip={BOTTOM} />
      {/* solapa: pivota sobre la bisagra del medio */}
      <span
        ref={flap}
        className="absolute inset-0"
        style={{ transformOrigin: "50% 50%", transformStyle: "preserve-3d", visibility: "hidden" }}
      >
        <Face ch={from} clip={TOP} />
        <Face ch={ch} clip={BOTTOM} style={{ transform: "rotateX(180deg)" }} />
      </span>
      {/* bisagra */}
      <span aria-hidden="true" className="absolute inset-x-[-4%] top-1/2 h-px -translate-y-1/2" style={{ background: SEAM }} />
    </span>
  );
}
