import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CONTAINER = "mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12";

const TONES = {
  crimson: {
    band: "bg-crimson text-white",
    number: "text-white/[.13]",
    rule: "border-white/25",
    soft: "text-white/80 hover:text-white",
    kicker: "text-white/80",
    text: "text-white/90",
    meta: "text-white/75",
  },
  dark: {
    band: "border-b border-[#f5e8ec]/10 bg-[#0e0407] text-[#f5e8ec]",
    number: "text-[#f0357f]/[.16]",
    rule: "border-[#f5e8ec]/20",
    soft: "text-[#f5e8ec]/70 hover:text-[#f5e8ec]",
    kicker: "text-[#f5e8ec]/70",
    text: "text-[#f5e8ec]/85",
    meta: "text-[#f5e8ec]/65",
  },
} as const;

/**
 * El encabezado de las páginas de adentro de /workshops (un workshop, una guía, un taller presencial): banda carmesí a todo
 * el ancho con el título en Anton blanco y el número de orden, enorme y cortado por el borde, de fondo. Abajo, el texto
 * (resumen o fecha) y, a la derecha, una acción opcional (`children`). Igual en todas, para que cualquier workshop se lea igual.
 */
export function DetailHero({
  number,
  srLabel,
  title,
  text,
  meta,
  back,
  kicker,
  tone = "crimson",
  children,
}: {
  number: string;
  /** Lo que lee un lector de pantalla antes del título: "Workshop 02: ", "Semana 05: ". */
  srLabel: string;
  title: string;
  text?: string;
  meta?: string;
  back: { href: string; label: string };
  /** Dónde está parado: "Workshop 02 de 05". Va a la derecha de "volver", en mono. */
  kicker?: string;
  /** Carmesí para la página de un workshop; oscuro fijo (el de la banda que cierra el sitio) para lo que hay adentro: una guía o un taller. */
  tone?: "crimson" | "dark";
  children?: React.ReactNode;
}) {
  const T = TONES[tone];
  return (
    <header className={`relative overflow-hidden ${T.band}`}>
      <span
        className={`pointer-events-none absolute -bottom-[.12em] -right-[.04em] select-none font-logo text-[clamp(14rem,44vw,40rem)] leading-[0.75] ${T.number}`}
        aria-hidden="true"
      >
        {number}
      </span>
      <div className={`${CONTAINER} relative pb-10 pt-24 md:pb-14 md:pt-28`}>
        <div className={`flex items-center justify-between gap-6 border-b pb-4 ${T.rule}`}>
          <Link
            href={back.href}
            className={`inline-flex items-center gap-2 font-mono text-[.74rem] uppercase tracking-[.14em] transition-colors ${T.soft}`}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {back.label}
          </Link>
          {kicker && <p className={`font-mono text-[.74rem] uppercase tracking-[.14em] ${T.kicker}`}>{kicker}</p>}
        </div>

        <h1 className="mt-8 max-w-[18ch] font-logo text-[clamp(2.8rem,6.6vw,6.5rem)] uppercase leading-[0.9] tracking-tight [overflow-wrap:anywhere] md:mt-10">
          <span className="sr-only">{srLabel}</span>
          {title}
        </h1>

        {(text || meta || children) && (
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {text && <p className={`max-w-[48ch] text-[clamp(1.15rem,1.8vw,1.4rem)] leading-[1.55] ${T.text}`}>{text}</p>}
              {meta && <p className={`font-mono text-[.74rem] uppercase leading-[1.7] tracking-[.14em] ${T.meta} ${text ? "mt-5" : ""}`}>{meta}</p>}
            </div>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
