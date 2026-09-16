import type { Metadata } from "next";
import { getPastEvents, getUpcomingEvents } from "@/lib/events";
import { PageHero } from "@/components/shared/PageHero";
import { EventCard } from "@/components/shared/EventCard";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Eventos, AIR Club UdeSA",
  description: "Competencias, charlas y cursos organizados por el AIR Club UdeSA. Cada evento tiene su propia página con toda la información.",
  path: "/eventos",
});

export default async function EventosPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <>
      <PageHero
        label="Actividades"
        title="Eventos"
        description="Competencias, charlas y cursos organizados por el club. Cada evento tiene su propia página con toda la información técnica."
      />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
            {upcoming.map((event) => (
              <RevealOnScroll key={event.slug}>
                <EventCard event={event} />
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <RevealOnScroll>
            <div className="rounded-lg border-[1.5px] border-dashed border-border-h p-11 text-center">
              <h4 className="mb-1.5 font-display text-[1rem] font-bold text-text2">No hay eventos programados</h4>
              <p className="mx-auto max-w-[420px] text-[.84rem] text-text3">
                Estamos preparando los próximos. Si tenés una idea,{" "}
                <a href="/contacto" className="font-semibold text-crimson-text">
                  escribinos
                </a>
                .
              </p>
            </div>
          </RevealOnScroll>
        )}
      </section>

      {past.length > 0 && (
        <>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          <section className="px-15 py-22.5 max-md:px-5.5 max-md:py-15">
            <RevealOnScroll>
              <SectionLabel>Ya pasaron</SectionLabel>
              <h2 className="mb-11 font-display text-[clamp(1.5rem,2.5vw,2.2rem)] font-extrabold tracking-tight text-text">
                Eventos anteriores
              </h2>
            </RevealOnScroll>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
              {past.map((event) => (
                <RevealOnScroll key={event.slug}>
                  <EventCard event={event} />
                </RevealOnScroll>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
