"use client";

import { useRef, useState } from "react";
import type { Ref } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Un dígito de tablero mecánico (split-flap): al cambiar, la mitad de arriba del número viejo cae como una solapa y deja
 * ver el nuevo. Son tres capas: la mitad de arriba ya con el número nuevo, la de abajo todavía con el viejo, y la solapa
 * que gira 180° con el viejo-arriba por delante y el nuevo-abajo por detrás.
 *
 * Hereda tipografía y color del contenedor, así que va dentro del mismo `font-logo` de la cuenta regresiva. Cada mitad
 * es opaca, con el fondo de la celda (`--flap-seam`), como las placas de un cartel de verdad: la de adelante tapa a la
 * de atrás y nunca se ven dos números a la vez. La línea del medio (la bisagra) es de ese mismo color. Con movimiento
 * reducido el número cambia de golpe.
 */

const SEAM = "var(--flap-seam, #0e0407)";
const TOP = "inset(0 0 50% 0)";
const BOTTOM = "inset(50% 0 0 0)";

function Face({ ch, clip, style, shade }: { ch: string; clip: string; style?: React.CSSProperties; shade?: Ref<HTMLSpanElement> }) {
  return (
    // En Anton las cifras miden ~0,88em de alto y la caja 0,85em: la placa sobresale un poco arriba y abajo para cubrir
    // todo el trazo (del mismo color que la celda, no se nota). A lo ancho entran (~0,47em de 0,5em).
    <span
      className="absolute inset-x-0 -inset-y-[8%] flex items-center justify-center"
      style={{ clipPath: clip, background: SEAM, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", ...style }}
    >
      {ch}
      {/* sombra: una capa del color de la celda que apaga la cifra (no oscurece la placa, así no se ve un recuadro) */}
      {shade && <span ref={shade} aria-hidden="true" className="absolute inset-0" style={{ background: SEAM, opacity: 0 }} />}
    </span>
  );
}

export function FlapDigit({ ch }: { ch: string }) {
  // `from` es el número que se está yendo; mientras no hay giro es igual a `ch`
  const [from, setFrom] = useState(ch);
  const prev = useRef(ch);
  const flap = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  // Sombras: la mitad nueva de arriba (está detrás de la solapa, a oscuras), y las dos caras de la solapa
  const topShade = useRef<HTMLSpanElement>(null);
  const frontShade = useRef<HTMLSpanElement>(null);
  const backShade = useRef<HTMLSpanElement>(null);
  // El giro en curso: si llega otro número antes de que termine (al volver a una pestaña que estuvo en segundo plano,
  // el reloj sigue y las animaciones no), se corta para que no terminen dos a la vez sobre la misma solapa
  const turn = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const old = prev.current;
      prev.current = ch;
      turn.current?.kill();
      turn.current = null;
      const el = flap.current;
      // Sin giro la primera vez (de "-" a la cifra), con movimiento reducido o sin cambio
      if (!el || old === ch || old === "-" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setFrom(ch);
        return;
      }
      setFrom(old);
      gsap.set(el, { rotateX: 0, visibility: "visible" });
      // Las sombras siguen al ángulo de la solapa, como la luz real: se oscurece al ponerse de canto y la mitad nueva
      // de arriba (detrás de la solapa) recién se aclara a medida que queda destapada. Sin esto su trazo de arriba
      // aparece de golpe, a pleno brillo, como una barra arriba del número viejo.
      const shade = () => {
        const deg = -Number(gsap.getProperty(el, "rotateX")); // 0 → 180
        const tilt = Math.abs(Math.cos((deg * Math.PI) / 180)); // 1 de frente, 0 de canto
        gsap.set(topShade.current, { opacity: deg < 90 ? tilt : 0 });
        gsap.set(deg < 90 ? frontShade.current : backShade.current, { opacity: 0.65 * (1 - tilt) });
      };
      shade();
      turn.current = gsap
        .timeline({
          onUpdate: shade,
          onComplete: () => {
            // La mitad de abajo pasa al número nuevo en el mismo cuadro en que se esconde la solapa: quieta, la cifra
            // queda nítida (la solapa en 3D se dibuja más blanda) y no hay un cuadro con el número viejo
            flushSync(() => setFrom(ch));
            gsap.set(el, { visibility: "hidden" });
            turn.current = null;
          },
        })
        // cae: arranca despacio y se acelera, como algo con peso
        .to(el, { rotateX: -90, duration: 0.3, ease: "power2.in" })
        // se apoya frenando de a poco
        .to(el, { rotateX: -180, duration: 0.32, ease: "power2.out" });
    },
    { dependencies: [ch], scope: box },
  );

  return (
    <span ref={box} className="relative inline-block h-[0.85em] w-[0.5em]" style={{ perspective: "4em" }}>
      {/* mitad de arriba: ya con el número nuevo (queda tapada por la solapa mientras cae) */}
      <Face ch={ch} clip={TOP} shade={topShade} />
      {/* mitad de abajo: con el número viejo hasta que la solapa aterriza */}
      <Face ch={from} clip={BOTTOM} />
      {/* solapa: pivota sobre la bisagra del medio */}
      <span
        ref={flap}
        className="absolute inset-0"
        // will-change: la solapa es siempre una capa propia, dibujada de frente y nítida, y no cambia de calidad al arrancar
        style={{ transformOrigin: "50% 50%", transformStyle: "preserve-3d", visibility: "hidden", willChange: "transform" }}
      >
        <Face ch={from} clip={TOP} shade={frontShade} />
        <Face ch={ch} clip={BOTTOM} style={{ transform: "rotateX(180deg)" }} shade={backShade} />
      </span>
      {/* bisagra */}
      <span aria-hidden="true" className="absolute inset-x-[-4%] top-1/2 h-px -translate-y-1/2" style={{ background: SEAM }} />
    </span>
  );
}
