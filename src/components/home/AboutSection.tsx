import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export function AboutSection() {
  return (
    <section id="nosotros" className="px-6 sm:px-10 md:px-16 min-h-[calc(100vh-4.5rem)] flex items-center justify-center max-w-[1400px] mx-auto py-12 w-full">
      <RevealOnScroll className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center w-full">
          {/* Lado izquierdo: Declaración tipográfica monumental posicionada con amplio respiro */}
          <div className="lg:col-span-6 xl:col-span-5 text-left">
            <h2 className="font-display text-[clamp(2.4rem,4.4vw,4.3rem)] font-black leading-[0.94] tracking-tight text-text uppercase text-left">
              Construir.
              <br />
              <span className="text-crimson">Competir.</span>
              <br />
              En
              <br />
              comunidad.
            </h2>
          </div>

          {/* Lado derecho: Párrafo editorial separado con gutter arquitectónico */}
          <div className="lg:col-span-6 xl:col-span-5 lg:col-start-7 xl:col-start-8 flex flex-col justify-center text-left">
            <p className="font-body text-[1.05rem] sm:text-[1.14rem] leading-[1.85] text-text2 mb-8 max-w-lg">
              Somos estudiantes de la Universidad de San Andrés que nos juntamos a construir cosas con inteligencia artificial y robótica. Creemos que se aprende mejor entre pares: compartimos lo que sabemos, nos potenciamos entre nosotros y encaramos proyectos que ninguno podría hacer solo, desde robots autónomos hasta IA aplicada.
            </p>

            <div>
              <Link
                href="/equipo"
                className="group inline-flex items-center gap-2 font-mono text-[.84rem] uppercase tracking-[.12em] font-semibold text-text hover:text-crimson transition-colors"
              >
                <span>Conocé al equipo del club</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-crimson" />
              </Link>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
