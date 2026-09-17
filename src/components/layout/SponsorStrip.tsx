import { ArrowUpRight } from "lucide-react";

export function SponsorStrip() {
  return (
    <section className="border-t border-border/80 bg-surface/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 py-16 sm:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-crimson" />
            <span className="font-mono text-[.7rem] uppercase tracking-[.22em] text-mauve font-semibold">
              Alianzas &amp; Vinculación Tecnológica
            </span>
          </div>
          <h3 className="mb-3 font-display text-[1.4rem] sm:text-[1.75rem] font-bold text-text leading-tight">
            ¿Tu empresa u organización quiere impulsar la robótica en Argentina?
          </h3>
          <p className="font-body text-[.95rem] leading-[1.7] text-text2">
            Buscamos aliados para financiar adquisición de sensores, placas de cómputo para competencias como el Challenge JAR 2026 y divulgación técnica abierta.
          </p>
        </div>
        <div className="shrink-0">
          <a
            href="mailto:airclub@udesa.edu.ar?subject=Sponsorship AIR Club UdeSA"
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-text bg-text px-7 py-3 font-mono text-[.8rem] font-semibold uppercase tracking-[.1em] text-bg transition-all hover:bg-crimson hover:border-crimson"
          >
            <span>Contactar al club</span>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
