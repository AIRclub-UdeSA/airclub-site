import { StartButton } from "./StartButton";

// El nodo sube de vacío a macizo, como los niveles de la ruta: cada palabra es un escalón.
const NODE_TODO = "border-text bg-bg";
const NODE_SOLID = "border-crimson bg-crimson";

/**
 * Hero de /workshops: una sola pieza, sin el título centrado de las otras páginas. "WORK" y "SHOPS" en Anton, uno encima del
 * otro y escalonados (SHOPS un escalón más adentro), cada uno con su línea de 1px y su nodo cuadrado, como la ruta. La frase
 * va al lado de WORK y el botón al lado de SHOPS, en el hueco que deja la escalera. El botón baja a las cajas.
 */
export function WorkshopsHero() {
  return (
    <header className="flex min-h-svh flex-col justify-center px-4 py-20 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="talk-rise relative border-t border-text/25 pt-5 md:pt-6 lg:grid lg:grid-cols-12 lg:items-end lg:gap-6">
          <span className={`absolute -top-[.4375rem] left-0 block size-3.5 border ${NODE_TODO}`} aria-hidden="true" />
          <h1 className="sr-only">Workshops</h1>
          <span className="block font-logo text-[min(37vw,23rem)] lg:text-[min(27vw,23rem,40svh)] uppercase leading-[0.82] tracking-tight text-text lg:col-span-8" aria-hidden="true">
            Work
          </span>
          <p className="mt-5 max-w-[26ch] text-balance text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.45] text-text lg:col-span-4 lg:mt-0 lg:pb-3">
            Talleres y guías para aprender haciendo.
          </p>
        </div>

        <div
          className="talk-rise relative mt-6 border-t border-text/25 pt-5 md:pt-6 lg:ml-[12%] lg:grid lg:grid-cols-12 lg:items-end lg:gap-6"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          <span className={`absolute -top-[.4375rem] left-0 block size-3.5 border ${NODE_SOLID}`} aria-hidden="true" />
          <span className="block font-logo text-[min(37vw,23rem)] lg:text-[min(27vw,23rem,40svh)] uppercase leading-[0.82] tracking-tight text-crimson-text lg:col-span-9" aria-hidden="true">
            Shops
          </span>
          <div className="mt-6 lg:col-span-3 lg:mt-0 lg:pb-3">
            <StartButton target="#workshops">Empezar</StartButton>
          </div>
        </div>
      </div>
    </header>
  );
}
