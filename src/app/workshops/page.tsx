import type { Metadata } from "next";
import { getUpcomingWorkshops, getWorkshopTracks, totalHoursLabel, trackHref, type WorkshopTrack } from "@/lib/workshops";
import { getContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";
import { WorkshopsHero } from "@/components/workshops/WorkshopsHero";
import { TrackBoxes, type TrackBox } from "@/components/workshops/TrackBoxes";
import { UpcomingWorkshops } from "@/components/workshops/UpcomingWorkshops";
import { ProposeWorkshop } from "@/components/workshops/ProposeWorkshop";
import { WorkshopProgressProvider } from "@/components/workshops/WorkshopProgress";

export const metadata: Metadata = buildMetadata({
  title: "Workshops, AIR Club UdeSA",
  description:
    "Formación práctica sin requisitos previos: workshops en orden, con talleres presenciales en el Campus Victoria y guías para hacer a tu ritmo.",
  path: "/workshops",
});

// ISR: el estado próximo/pasado de cada taller sale de su fecha, así que la página se revalida sola cada hora.
export const revalidate = 3600;

const pad = (n: number) => String(n).padStart(2, "0");

/** Lo que dice cada caja en mono: cuántos talleres tiene, de qué tipo y cuánto lleva el recorrido. */
function factsOf(t: WorkshopTrack): string[] {
  return [
    t.guides.length > 0 && `${pad(t.guides.length)} ${t.guides.length === 1 ? "guía asincrónica" : "guías asincrónicas"}`,
    t.guides.length > 0 && `${totalHoursLabel(t.guides)} de práctica`,
    t.past.length > 0 && `${pad(t.past.length)} ${t.past.length === 1 ? "taller presencial" : "talleres presenciales"}`,
    t.upcoming.length > 0 && `${pad(t.upcoming.length)} ${t.upcoming.length === 1 ? "fecha próxima" : "fechas próximas"}`,
  ].filter((f): f is string => Boolean(f));
}

/**
 * Página general de workshops: el hero, los próximos talleres presenciales de todos los workshops (lo que tiene fecha y
 * botón para inscribirse, bien a la vista) y debajo una caja por workshop, en orden (Linux, después ROS 2…). Cada caja
 * abre la página del workshop, que tiene adentro sus talleres.
 */
export default async function WorkshopsPage() {
  const [tracks, upcoming, propose] = await Promise.all([
    getWorkshopTracks(),
    getUpcomingWorkshops(),
    getContactReason("workshop"),
  ]);

  const boxes: TrackBox[] = tracks.map((t) => ({
    key: t.key,
    href: trackHref(t.key),
    title: t.title,
    label: t.label,
    summary: t.summary,
    facts: factsOf(t),
    slugs: [...t.guides.map((g) => g.slug), ...t.past.map((w) => w.slug)],
  }));
  const itemCount = tracks.reduce((n, t) => n + t.guides.length + t.past.length, 0);

  return (
    <WorkshopProgressProvider>
      <WorkshopsHero trackCount={tracks.length} itemCount={itemCount} firstTrackHref={boxes[0]?.href} />

      {/* Primero lo que tiene fecha (y el botón para inscribirse), después el mosaico de workshops. */}
      <div className="bg-bg2 pt-16 md:pt-24">
        <UpcomingWorkshops workshops={upcoming} />
      </div>

      <section id="workshops" aria-label="Workshops" className="scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <TrackBoxes tracks={boxes} />
        </div>
      </section>

      <ProposeWorkshop reason={propose} />
    </WorkshopProgressProvider>
  );
}
