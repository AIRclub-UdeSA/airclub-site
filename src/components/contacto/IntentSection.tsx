import type { CSSProperties } from "react";

/**
 * El fondo no cambia (lienzo, o `bg-bg2` alternado como en /equipo y /talks): el color va en los paneles de arriba.
 * Las intenciones siguen un camino continuo y sutil a lo largo de la escala monocromática (sin saltos bruscos):
 * - "Quiero sumarme" (`crimson`): `#a40c4c` (Posición 4, carmesí principal institucional, L=35%)
 * - "Quiero aportar" (`rose`):    `#8c0a41` (Posición 3, paso sutil en la línea de tono, L=30%)
 * - "Tengo una duda" (`mauve`):   `#740936` (Posición 2, paso sutil en la línea de tono, L=25%)
 * La tinta siempre es blanca `#ffffff` con ratios de contraste AAA (7.7:1 a 11.4:1).
 */
const TONES = {
  crimson: { ink: "#ffffff", paper: "#a40c4c" },
  rose: { ink: "#ffffff", paper: "#8c0a41" },
  mauve: { ink: "#ffffff", paper: "#740936" },
} as const;

export type Tone = keyof typeof TONES;

export function IntentSection({
  tone,
  lead,
  accent,
  alt = false,
  children,
}: {
  tone: Tone;
  /** Primera parte del título. */
  lead: string;
  /** Última palabra del título, en carmesí. */
  accent: string;
  /** Fondo secundario (`bg-bg2`), para alternar bandas. */
  alt?: boolean;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <section className={`py-16 md:py-24 ${alt ? "bg-bg2" : ""}`}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
        <h2 className="font-logo text-[clamp(3rem,7.4vw,7rem)] uppercase leading-[0.92] tracking-tight text-text">
          {lead} <span className="text-crimson-text">{accent}</span>
        </h2>
        <div style={{ "--ink": t.ink, "--paper": t.paper } as CSSProperties}>{children}</div>
      </div>
    </section>
  );
}
