import Link from "next/link";
import { getUpcomingEvents } from "@/lib/events";
import { EventCard } from "@/components/shared/EventCard";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { TiltCard } from "@/components/shared/TiltCard";
import { SectionLabel } from "@/components/shared/SectionLabel";

export async function EventsTeaser() {
  const upcoming = await getUpcomingEvents({ take: 2 });

  return (
    <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
      <RevealOnScroll>
        <SectionLabel>Actividades</SectionLabel>
        <h2 className="mb-4 font-display text-[clamp(1.8rem,3vw,2.8rem)] font-extrabold leading-[1.05] tracking-tight text-text">
          Próximos eventos
        </h2>
        <p className="mb-11 max-w-[600px] text-[.95rem] leading-[1.75] text-text2">
          Cada evento del club tiene su propia documentación, repositorios y reglas. Entrá a un evento para ver
          todos los detalles.
        </p>
      </RevealOnScroll>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
        {upcoming.map((event) => (
          <RevealOnScroll key={event.slug} delay={1}>
            <EventCard event={event} />
          </RevealOnScroll>
        ))}
        <RevealOnScroll delay={2}>
          <TiltCard className="h-full rounded-lg">
            <Link href="/eventos" className="block h-full">
              <div className="group flex h-full flex-col overflow-hidden rounded-lg border-[1.5px] border-border bg-white transition-all duration-450 ease-club hover:border-crimson/30 hover:shadow-[0_20px_50px_rgba(164,12,76,0.1)] dark:bg-[#1a0810]">
                <div className="px-7 pb-4 pt-7">
                  <span className="mb-3 inline-block rounded-full bg-[rgba(143,82,97,0.08)] px-3.5 py-1.5 font-mono text-[.6rem] uppercase tracking-[.1em] text-mauve">
                    Agenda
                  </span>
                  <h3 className="mb-1 font-display text-[1.25rem] font-bold text-text">Todos los eventos</h3>
                  <p className="font-mono text-[.68rem] text-text3">Charlas · Cursos · Competencias</p>
                </div>
                <div className="px-7 pb-7">
                  <p className="mb-4.5 text-[.86rem] leading-[1.65] text-text2">
                    Mirá la agenda completa del club: lo que viene y lo que estamos preparando.
                  </p>
                  <div className="flex items-center gap-2 text-[.84rem] font-semibold text-crimson-text transition-[gap] duration-300 group-hover:gap-3.5">
                    Ir a Eventos
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </TiltCard>
        </RevealOnScroll>
      </div>
    </section>
  );
}
