import { ArrowUpRight } from "lucide-react";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/**
 * Título de /workshops (Anton, centrado, misma altura de letra que /talks y /equipo) y el manifiesto: qué es un
 * workshop del club y las dos formas de entrar (presencial o el recorrido asincrónico).
 */
export function WorkshopsHero({
  guideCount,
  totalHours,
  firstGuideUrl,
}: {
  guideCount: number;
  totalHours: string;
  firstGuideUrl?: string;
}) {
  return (
    <header className="pb-16 pt-24 md:pb-24">
      <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-crimson-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
        Workshops
      </h1>

      <div
        className="talk-rise mx-auto mt-12 grid max-w-[1440px] grid-cols-1 gap-8 px-4 sm:px-8 md:mt-16 md:px-12 lg:grid-cols-12 lg:gap-4"
        style={{ "--d": "120ms" } as React.CSSProperties}
      >
        <p className="text-balance font-display text-[clamp(1.9rem,4.4vw,4rem)] font-bold leading-[1.04] tracking-tight text-text lg:col-span-7">
          Cables, código, motores y simuladores. <span className="text-crimson-text">Sin requisitos previos.</span>
        </p>

        <div className="min-w-0 lg:col-span-4 lg:col-start-9 lg:pt-2">
          <p className="max-w-[60ch] text-[1.05rem] leading-[1.7] text-text2">
            Acá se aprende metiendo mano: se arma, se prueba, se rompe y se vuelve a armar. Hay talleres presenciales en
            el Campus Victoria y un recorrido asincrónico para hacer a tu ritmo con el simulador, desde tu primer nodo de
            ROS 2 hasta navegar un laberinto con Nav2.
          </p>
          <p className="mt-5 font-mono text-[.74rem] font-semibold uppercase tracking-[.16em] text-mauve">
            {String(guideCount).padStart(2, "0")} guías · {totalHours} de práctica
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            {firstGuideUrl && (
              <a
                href={firstGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
              >
                <span>Empezar la 01</span>
                <ArrowUpRight size={15} aria-hidden="true" />
                {NEW_TAB_HINT}
              </a>
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
