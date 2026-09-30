import { ArrowUpRight } from "lucide-react";
import type { ContactReason } from "@/lib/contact";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/**
 * Cierre de /equipo: banda oscura a todo el ancho (igual en claro y oscuro, como la de /talks). Los dos caminos son
 * pasos en orden: primero la comunidad (carmesí macizo, la entrada) y después el equipo principal. El texto viene de los
 * motivos de contacto ("comunidad" y "equipo"), así no se duplica la copy de /contacto.
 */
export function JoinSection({ community, team }: { community: ContactReason; team: ContactReason }) {
  return (
    <section id="sumarte" className="scroll-mt-24 bg-[#0e0407] text-[#f5e8ec]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 md:px-12 md:py-24">
        <h2 className="font-logo text-[clamp(3.2rem,7.4vw,7rem)] uppercase leading-[0.92] tracking-tight">
          Cómo <span className="text-[#f0357f]">sumarte</span>
        </h2>

        <div className="mt-10 grid gap-3 lg:grid-cols-[1.15fr_1fr]">
          <Step n="01" label="Primero" reason={community} primary />
          <Step n="02" label="Después" reason={team} />
        </div>
      </div>
    </section>
  );
}

function Step({ n, label, reason, primary = false }: { n: string; label: string; reason: ContactReason; primary?: boolean }) {
  return (
    <article
      className={`flex min-h-[22rem] min-w-0 flex-col justify-between gap-10 border p-6 sm:p-8 lg:p-10 ${
        primary ? "border-crimson bg-crimson text-white" : "border-[#f5e8ec]/35"
      }`}
    >
      <div className="flex items-end justify-between gap-4">
        <span className="font-logo text-[clamp(4.5rem,8vw,8rem)] leading-[0.8]" aria-hidden="true">
          {n}
        </span>
        <span className="pb-1 font-mono text-[.78rem] uppercase tracking-[.16em] text-current/80">{label}</span>
      </div>

      <div>
        <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold leading-[1.1] tracking-tight">{reason.title}</h3>
        <p className="mt-3 max-w-[46ch] text-[.98rem] leading-[1.65] text-current/85">{reason.desc}</p>
        <a
          href={reason.href}
          target={reason.external ? "_blank" : undefined}
          rel={reason.external ? "noopener noreferrer" : undefined}
          className={`mt-7 inline-flex max-w-full items-center gap-2 rounded-full px-6 py-3.5 leading-tight font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] transition-colors ${
            primary
              ? "bg-white text-crimson hover:bg-[#f5e8ec]"
              : "border border-[#f5e8ec] text-[#f5e8ec] hover:bg-[#f5e8ec] hover:text-[#0e0407]"
          }`}
        >
          <span>{reason.action}</span>
          <ArrowUpRight size={15} aria-hidden="true" />
          {reason.external && NEW_TAB_HINT}
        </a>
      </div>
    </article>
  );
}
