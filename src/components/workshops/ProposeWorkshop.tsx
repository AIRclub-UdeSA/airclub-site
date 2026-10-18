import { ArrowUpRight } from "lucide-react";
import type { ContactReason } from "@/lib/contact";

/**
 * Cierre de /workshops: banda oscura a todo el ancho (igual en claro y oscuro, como las de /talks y /equipo) para
 * proponer un taller. El texto y el destino vienen del motivo "workshop" de /contacto, así no se duplica la copy.
 */
export function ProposeWorkshop({ reason }: { reason: ContactReason }) {
  return (
    <section id="proponer" className="scroll-mt-24 bg-[#0e0407] text-[#f5e8ec]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 sm:px-8 md:px-12 md:py-24 lg:grid-cols-12 lg:items-end lg:gap-4">
        <h2 className="font-logo text-[clamp(3.2rem,7.4vw,7rem)] uppercase leading-[1.04] tracking-tight lg:col-span-7">
          Proponé un <span className="text-crimson">workshop</span>
        </h2>

        <div className="min-w-0 border border-[#f5e8ec]/35 p-6 sm:p-8 lg:col-span-5">
          <p className="max-w-[46ch] text-[1.02rem] leading-[1.65] text-[#f5e8ec]/85">
            {reason.desc} Si sabés soldar, programar un microcontrolador o configurar un simulador, eso ya es un taller.
          </p>
          <a
            href={reason.href}
            target={reason.external ? "_blank" : undefined}
            rel={reason.external ? "noopener noreferrer" : undefined}
            className="mt-7 inline-flex max-w-full items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase leading-tight tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
          >
            <span>{reason.action}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
            {reason.external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
          </a>
          <p className="mt-4 font-mono text-[.72rem] leading-[1.6] text-[#f5e8ec]/60 [overflow-wrap:anywhere]">
            <span aria-hidden="true">→ </span>
            {reason.destination}
            {reason.kind === "mail" && reason.subject ? ` · Asunto: ${reason.subject}` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
