import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

/**
 * "Tengo una idea, pero no sé por dónde empezar": banda a todo el ancho (alterna con el lienzo, como en /equipo y
 * /contacto), sin tarjeta redondeada ni grilla de puntos. La frase es el diseño: Anton monumental, la mitad en carmesí.
 */
export function IdeaCallout() {
  return (
    <section id="portal-ideas" className="bg-bg2 py-16 sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
        <RevealOnScroll>
          <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
            <h3 className="font-logo text-[clamp(3rem,7vw,6.5rem)] uppercase leading-[1.04] tracking-tight text-text lg:col-span-7">
              “Tengo una idea,{" "}
              <span className="text-crimson-text">pero no sé por dónde empezar”</span>
            </h3>

            <div className="lg:col-span-5">
              <p className="max-w-[46ch] font-body text-[1.08rem] leading-[1.75] text-text2 sm:text-[1.18rem]">
                Traela al club. Nosotros te ayudamos a evaluarla, pensar cómo llevarla adelante y encontrar personas que
                quieran sumarse. La propuesta es simple: conectar personas, intereses y proyectos reales.
              </p>
              <a
                href="https://forms.gle/2zkW6gwJQptUzbXn6"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex max-w-full items-center gap-3 rounded-full bg-crimson px-8 py-4 font-mono text-[.82rem] font-bold uppercase leading-tight tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
              >
                <span>Proponer un proyecto o idea</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
