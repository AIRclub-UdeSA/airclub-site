import Link from "next/link";
import { ArrowUpRight, ArrowRight, MapPin } from "lucide-react";
import { getUpcomingEvents } from "@/lib/events";
import { formatEventDate, formatDaysUntil } from "@/lib/dates";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export async function EventsTeaser() {
  const upcoming = await getUpcomingEvents({ take: 3 });

  return (
    <section id="actividades" className="px-6 sm:px-8 md:px-12 py-20 sm:py-32 max-w-7xl mx-auto">
      {/* Encabezado minimalista sin micro-etiquetas ni textos sobrantes */}
      <div className="mb-10 sm:mb-14">
        <RevealOnScroll>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/80">
            <h2 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[0.95] tracking-tight text-text uppercase">
              Próximas <span className="text-crimson">actividades.</span>
            </h2>
            <Link
              href="/eventos"
              className="group inline-flex items-center gap-1.5 font-mono text-[.82rem] uppercase tracking-[.14em] font-semibold text-text hover:text-crimson transition-colors"
            >
              <span>Ver calendario completo</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-crimson" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>

      {/* Formato arquitectónico de eventos */}
      {upcoming.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-border/80 p-8">
          <p className="font-mono text-[.82rem] uppercase tracking-wider text-text3">
            No hay actividades programadas por el momento.
          </p>
        </div>
      ) : upcoming.length === 1 ? (
        /* Caso destacado: Evento principal en panel editorial split */
        <RevealOnScroll>
          {upcoming.map((event) => {
            const daysUntil = formatDaysUntil(event.startsAt);
            const targetHref = event.externalUrl || `/eventos/${event.slug}`;
            const isExternal = Boolean(event.externalUrl);

            return (
              <div
                key={event.slug}
                className="group relative border border-border/80 hover:border-crimson/80 bg-card/30 dark:bg-card/15 transition-colors p-8 sm:p-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                  {/* Lado izquierdo: Fecha monumental y estado */}
                  <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border/80 pb-6 lg:pb-0 lg:pr-8">
                    <div className="flex items-center gap-2 mb-4 font-mono text-[.74rem] uppercase tracking-[.18em] font-semibold text-crimson">
                      <span className="h-2 w-2 rounded-full bg-crimson animate-pulse" />
                      <span>{daysUntil || "Convocatoria Activa"}</span>
                    </div>

                    <div className="mb-4">
                      <span className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] font-black text-text leading-none tracking-tight block">
                        {event.startsAt.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).toUpperCase()}
                      </span>
                      <span className="font-mono text-[.78rem] uppercase tracking-[.18em] text-text3 mt-1.5 block">
                        {formatEventDate(event.startsAt, event.endsAt)}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1.5 font-mono text-[.76rem] uppercase tracking-[.14em] text-text2">
                        <MapPin className="h-3.5 w-3.5 text-crimson" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Lado derecho: Título, descripción y botón de acción */}
                  <div className="lg:col-span-8 flex flex-col justify-center">
                    {event.tagline && (
                      <span className="font-mono text-[.78rem] uppercase tracking-[.18em] text-mauve font-semibold mb-2 block">
                        {event.tagline}
                      </span>
                    )}

                    <h3 className="font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-bold text-text group-hover:text-crimson transition-colors leading-[1.08] tracking-tight uppercase mb-4">
                      {event.title}
                    </h3>

                    <p className="font-body text-[1rem] sm:text-[1.08rem] leading-relaxed text-text2 mb-8 max-w-2xl">
                      {event.description}
                    </p>

                    <div>
                      {isExternal ? (
                        <a
                          href={targetHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-text px-7 py-3 font-mono text-[.82rem] uppercase tracking-[.12em] font-semibold text-text hover:bg-text hover:text-bg transition-all"
                        >
                          <span>Acceder al evento</span>
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 text-crimson" />
                        </a>
                      ) : (
                        <Link
                          href={targetHref}
                          className="group/btn inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-text px-7 py-3 font-mono text-[.82rem] uppercase tracking-[.12em] font-semibold text-text hover:bg-text hover:text-bg transition-all"
                        >
                          <span>Acceder al evento</span>
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 text-crimson" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </RevealOnScroll>
      ) : (
        /* Caso múltiple: Bento asimétrico (1 principal dominante + secundarios apilados en columna) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Tarjeta principal / destacada */}
          {(() => {
            const primary = upcoming[0];
            const daysUntil = formatDaysUntil(primary.startsAt);
            const targetHref = primary.externalUrl || `/eventos/${primary.slug}`;
            const isExternal = Boolean(primary.externalUrl);

            return (
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
                <RevealOnScroll className="h-full">
                  <div className="group h-full border border-border/80 hover:border-crimson/80 bg-card/40 dark:bg-card/20 p-8 sm:p-10 flex flex-col justify-between transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-6">
                        <div className="flex items-center gap-2 font-mono text-[.74rem] uppercase tracking-[.18em] font-semibold text-crimson">
                          <span className="h-2 w-2 rounded-full bg-crimson animate-pulse" />
                          <span>{daysUntil || "Convocatoria Activa"}</span>
                        </div>
                        {primary.location && (
                          <div className="flex items-center gap-1.5 font-mono text-[.74rem] uppercase tracking-[.14em] text-text3">
                            <MapPin className="h-3.5 w-3.5 text-crimson" />
                            <span>{primary.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-5">
                        <span className="font-display text-[clamp(2.2rem,4vw,3.2rem)] font-black text-text leading-none tracking-tight block mb-1.5">
                          {primary.startsAt.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).toUpperCase()}
                        </span>
                        <span className="font-mono text-[.78rem] uppercase tracking-[.18em] text-text3 block">
                          {formatEventDate(primary.startsAt, primary.endsAt)}
                        </span>
                      </div>

                      {primary.tagline && (
                        <span className="font-mono text-[.76rem] uppercase tracking-[.16em] text-mauve font-semibold mb-2 block">
                          {primary.tagline}
                        </span>
                      )}

                      <h3 className="font-display text-[clamp(1.6rem,2.8vw,2.2rem)] font-bold text-text group-hover:text-crimson transition-colors leading-[1.1] uppercase mb-4">
                        {primary.title}
                      </h3>

                      <p className="font-body text-[1rem] sm:text-[1.05rem] leading-relaxed text-text2 mb-8 max-w-xl">
                        {primary.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border/80">
                      {isExternal ? (
                        <a
                          href={targetHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-text px-7 py-3 font-mono text-[.82rem] uppercase tracking-[.12em] font-semibold text-text hover:bg-text hover:text-bg transition-all"
                        >
                          <span>Acceder al evento</span>
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 text-crimson" />
                        </a>
                      ) : (
                        <Link
                          href={targetHref}
                          className="group/btn inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-text px-7 py-3 font-mono text-[.82rem] uppercase tracking-[.12em] font-semibold text-text hover:bg-text hover:text-bg transition-all"
                        >
                          <span>Acceder al evento</span>
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 text-crimson" />
                        </Link>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            );
          })()}

          {/* Tarjetas secundarias apiladas en columna lateral */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            {upcoming.slice(1).map((event, idx) => {
              const daysUntil = formatDaysUntil(event.startsAt);
              const targetHref = event.externalUrl || `/eventos/${event.slug}`;
              const isExternal = Boolean(event.externalUrl);

              return (
                <RevealOnScroll key={event.slug} delay={(idx + 1) as 1 | 2 | 3} className="h-full">
                  <div className="group h-full border border-border/80 hover:border-crimson/80 bg-card/30 dark:bg-card/15 p-6 sm:p-7 flex flex-col justify-between transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="font-mono text-[.7rem] uppercase tracking-[.18em] font-semibold text-crimson flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-pulse" />
                          {daysUntil || "Próximamente"}
                        </span>
                        {event.location && (
                          <span className="font-mono text-[.68rem] uppercase tracking-[.12em] text-text3">
                            {event.location}
                          </span>
                        )}
                      </div>

                      {event.tagline && (
                        <span className="font-mono text-[.72rem] uppercase tracking-[.16em] text-mauve font-semibold mb-1 block">
                          {event.tagline}
                        </span>
                      )}

                      <h3 className="font-display text-[1.25rem] font-bold text-text group-hover:text-crimson transition-colors leading-snug uppercase mb-2">
                        {event.title}
                      </h3>

                      <p className="font-body text-[.88rem] leading-relaxed text-text2 line-clamp-3 mb-4">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/80 flex items-center justify-between">
                      <span className="font-mono text-[.72rem] uppercase tracking-wider text-text3">
                        {formatEventDate(event.startsAt, event.endsAt)}
                      </span>

                      {isExternal ? (
                        <a
                          href={targetHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 group-hover:border-crimson group-hover:bg-crimson group-hover:text-white transition-all text-text"
                          aria-label={`Ver evento: ${event.title}`}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <Link
                          href={targetHref}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 group-hover:border-crimson group-hover:bg-crimson group-hover:text-white transition-all text-text"
                          aria-label={`Ver evento: ${event.title}`}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer de la sección: Proponer evento */}
      <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border/80">
        <span className="font-mono text-[.76rem] uppercase tracking-[.16em] text-text3">
          ¿Querés proponer un workshop o charla técnica?
        </span>
        <Link
          href="/contacto"
          className="group inline-flex items-center gap-1.5 font-mono text-[.82rem] uppercase tracking-[.12em] font-semibold text-text hover:text-crimson transition-colors"
        >
          <span>Proponer actividad</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 text-crimson" />
        </Link>
      </div>
    </section>
  );
}
