import type { CSSProperties } from "react";

/**
 * El fondo no cambia (lienzo, o `bg-bg2` alternado como en /equipo y /talks): el color va en los paneles de arriba.
 * Cada intención tiene su color, de la paleta de la marca: carmesí = sumarte, rosa = aportar, malva = preguntar.
 * Cada tono fija la "tinta" (texto sobre el panel) y el "papel" (relleno del panel) que los paneles toman por variable.
 * Son fijos en claro y oscuro: la tinta siempre contrasta con su papel.
 */
const TONES = {
  crimson: { ink: "#ffffff", paper: "#a40c4c" },
  rose: { ink: "#0d0407", paper: "#ddaabc" },
  mauve: { ink: "#ffffff", paper: "#8f5261" },
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
