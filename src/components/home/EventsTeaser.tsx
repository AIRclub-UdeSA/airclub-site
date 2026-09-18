import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { getUpcomingEvents } from "@/lib/events";
import { formatEventDate } from "@/lib/dates";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export async function EventsTeaser() {
  const upcoming = await getUpcomingEvents({ take: 3 });

  return (
    <section id="actividades" className="px-6 sm:px-8 md:px-12 py-24 sm:py-36 max-w-7xl mx-auto">
      <RevealOnScroll>
        <div className="mb-16 sm:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/80 pb-12">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[.74rem] uppercase tracking-[.25em] text-mauve font-semibold">
                &#123; Agenda // 04 · Convocatorias &amp; Desafíos &#125;
              </span>
            </div>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight text-text uppercase">
              Próximas <span className="text-crimson">actividades.</span>
            </h2>
          </div>
          <p className="max-w-md font-body text-[1rem] leading-[1.75] text-text2">
            Cada evento cuenta con documentación técnica, workshops preparatorios y fechas límite. Entrá para sumarte a los equipos.
          </p>
        </div>
      </RevealOnScroll>

      {/* Agenda Ledger: Lista abierta sin tarjetas redondeadas */}
      <div className="divide-y divide-border/80 border-b border-border/80">
        {upcoming.map((event, i) => (
          <RevealOnScroll key={event.slug} delay={(i + 1) as 1 | 2 | 3}>
            <Link
              href={event.externalUrl || `/eventos/${event.slug}`}
              target={event.externalUrl ? "_blank" : undefined}
              rel={event.externalUrl ? "noopener noreferrer" : undefined}
              className="group py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-baseline transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.015] px-2 sm:px-4"
            >
              {/* Fecha y lugar */}
              <div className="md:col-span-3">
                <span className="font-mono text-[.76rem] font-semibold text-crimson block tracking-wider uppercase mb-1">
                  {formatEventDate(event.startsAt, event.endsAt)}
                </span>
                {event.location && (
                  <span className="font-mono text-[.68rem] uppercase tracking-widest text-text3 block">
                    {event.location}
                  </span>
                )}
              </div>

              {/* Título */}
              <div className="md:col-span-4">
                <h3 className="font-display text-[1.4rem] sm:text-[1.65rem] font-bold text-text leading-snug group-hover:text-crimson transition-colors">
                  {event.title}
                </h3>
                {event.tagline && (
                  <span className="font-mono text-[.72rem] text-text3 mt-1 block">
                    {event.tagline}
                  </span>
                )}
              </div>

              {/* Descripción */}
              <div className="md:col-span-4">
                <p className="font-body text-[.92rem] leading-[1.7] text-text2">
                  {event.description}
                </p>
              </div>

              {/* Acción / Flecha */}
              <div className="md:col-span-1 flex justify-end">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-text group-hover:bg-crimson group-hover:text-white group-hover:border-crimson transition-all">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          </RevealOnScroll>
        ))}
      </div>

      {/* Footer de la agenda: Enlace a calendario completo */}
      <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <span className="font-mono text-[.76rem] uppercase tracking-widest text-text3">
          ¿Querés proponer un workshop o charla técnica?
        </span>
        <Link
          href="/eventos"
          className="group inline-flex items-center gap-2 font-mono text-[.8rem] uppercase tracking-[.12em] font-semibold text-text hover:text-crimson transition-colors"
        >
          <span>Explorar agenda completa del club</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 text-crimson" />
        </Link>
      </div>
    </section>
  );
}
