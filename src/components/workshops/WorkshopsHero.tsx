import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Título de /workshops (Anton, centrado, misma altura de letra que /talks y /equipo, a dos tonos como "EVENTOS") y un
 * párrafo corto: qué es un workshop del club y cómo se entra (presencial o asincrónico). Las cajas van justo abajo.
 */
export function WorkshopsHero({
  trackCount,
  itemCount,
  firstTrackHref,
}: {
  trackCount: number;
  itemCount: number;
  firstTrackHref?: string;
}) {
  return (
    <header className="pb-16 pt-24 md:pb-24">
      <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
        Work<span className="text-crimson-text">shops</span>
      </h1>

      <div
        className="talk-rise mx-auto mt-12 grid max-w-[1440px] grid-cols-1 gap-8 px-4 sm:px-8 md:mt-16 md:px-12 lg:grid-cols-12 lg:gap-4"
        style={{ "--d": "120ms" } as React.CSSProperties}
      >
        <p className="max-w-[46ch] text-[clamp(1.2rem,2vw,1.5rem)] leading-[1.55] text-text lg:col-span-7">
          Talleres presenciales en el Campus Victoria y guías para hacer a tu ritmo. Cada workshop es un recorrido en orden:
          elegí uno y arrancá por el primer taller.
        </p>

        <div className="min-w-0 lg:col-span-4 lg:col-start-9 lg:pt-2">
          <p className=" font-mono text-[.74rem] font-semibold uppercase tracking-[.16em] text-mauve">
            {String(trackCount).padStart(2, "0")} workshops · {String(itemCount).padStart(2, "0")} talleres
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            {firstTrackHref && (
              <Link
                href={firstTrackHref}
                className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
              >
                <span>Empezar por el 01</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            )}
            <a
              href="#proximos"
              className="font-mono text-[.78rem] uppercase tracking-[.12em] text-text underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text hover:decoration-crimson-text"
            >
              Talleres presenciales
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
