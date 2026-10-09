"use client";

import { useEffect, useRef } from "react";

type Part = string | { text: string; className?: string };

const MIN_OPACITY = 0.16;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Titular que se "lee" con el scroll: cada palabra pasa de tenue a plena, de a una, mientras el título sube por la
 * ventana. El texto está siempre completo en el DOM (lectores de pantalla y buscadores lo ven entero); sin JS o con
 * movimiento reducido las palabras se ven plenas. Usar en pocos titulares: es un recurso, no el tratamiento de todos.
 *
 * `parts` admite fragmentos con su propia clase (el color de una palabra) y saltos de línea con "\n".
 */
export function ScrubText({
  as: Tag = "h2",
  className,
  parts,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  parts: Part[];
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      // p = 0 cuando el título asoma por abajo (90% de la altura), 1 cuando ya subió a poco menos de la mitad.
      const p = clamp((vh * 0.9 - root.getBoundingClientRect().top) / (vh * 0.45));
      words.forEach((w, i) => {
        const o = clamp((p - (i / words.length) * 0.7) / 0.3);
        w.style.opacity = String(MIN_OPACITY + (1 - MIN_OPACITY) * o);
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {parts.flatMap((part, pi) => {
        const { text, className: cls } = typeof part === "string" ? { text: part, className: undefined } : part;
        return text.split(/(\s+)/).map((token, ti) => {
          const key = `${pi}-${ti}`;
          if (token === "") return null;
          if (/^\s+$/.test(token)) return token.includes("\n") ? <br key={key} /> : " ";
          return (
            <span key={key} data-word className={`inline-block ${cls ?? ""}`}>
              {token}
            </span>
          );
        });
      })}
    </Tag>
  );
}
