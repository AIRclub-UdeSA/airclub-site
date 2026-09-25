"use client";

import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export function IdeaCallout() {
  return (
    <section id="portal-ideas" className="px-6 sm:px-8 md:px-12 py-16 sm:py-24 max-w-7xl mx-auto">
      <RevealOnScroll>
        <div className="relative rounded-card p-8 sm:p-14 md:p-18 overflow-hidden bg-card-muted/70 dark:bg-card-muted/30 border border-border/80 transition-colors">
          {/* Textura gráfica de puntos sutiles inspirada en el halftone de Caldera */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 dark:opacity-20 pointer-events-none hidden md:block"
            style={{
              backgroundImage: "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative z-10 max-w-3xl">
            {/* Título Monumental Caldera con contraste absoluto */}
            <h3 className="font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-black leading-[1.02] tracking-tight text-text mb-6">
              “Tengo una idea, pero no sé por dónde empezar”
            </h3>

            {/* Bajada clara y directa */}
            <p className="font-body text-[1.08rem] sm:text-[1.22rem] leading-[1.75] text-text2 mb-10 max-w-2xl">
              Traela al club. Nosotros te ayudamos a evaluarla, pensar cómo llevarla adelante y encontrar personas que quieran sumarse. La propuesta es simple: conectar personas, intereses y proyectos reales.
            </p>

            {/* Botón píldora 800px característico de Caldera */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://forms.gle/2zkW6gwJQptUzbXn6"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-crimson px-8 py-4 font-mono text-[.82rem] font-bold uppercase tracking-[.14em] text-white hover:bg-crimson-hover transition-all"
              >
                <span>Proponer un proyecto o idea</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
