import type { Metadata } from "next";
import { getAsyncWorkshops, getUpcomingWorkshops, getWorkshopTracks, totalHoursLabel } from "@/lib/workshops";
import { getContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";
import { WorkshopsHero } from "@/components/workshops/WorkshopsHero";
import { UpcomingWorkshops } from "@/components/workshops/UpcomingWorkshops";
import { WorkshopTrackSection } from "@/components/workshops/WorkshopTrackSection";
import { UntrackedArchive } from "@/components/workshops/PastWorkshops";
import { ProposeWorkshop } from "@/components/workshops/ProposeWorkshop";

export const metadata: Metadata = buildMetadata({
  title: "Workshops, AIR Club UdeSA",
  description:
    "Formación práctica sin requisitos previos: talleres presenciales en el Campus Victoria y un recorrido asincrónico de ROS 2 con el simulador del Challenge JAR 2026.",
  path: "/workshops",
});

// ISR: el estado próximo/pasado de cada taller sale de su fecha, así que la página se revalida sola cada hora.
export const revalidate = 3600;

// Las bandas alternan lienzo y bg2 después de "Próximos talleres", que va sobre el lienzo.
const band = (i: number) => (i % 2 === 0 ? "bg-bg2" : "");

export default async function WorkshopsPage() {
  const [guides, upcoming, { tracks, untracked }, propose] = await Promise.all([
    getAsyncWorkshops(),
    getUpcomingWorkshops(),
    getWorkshopTracks(),
    getContactReason("workshop"),
  ]);
  const visibleTracks = tracks.filter((t) => t.guides.length + t.past.length > 0);

  return (
    <>
      <WorkshopsHero
        tracks={visibleTracks.map(({ key, title }) => ({ key, title }))}
        guideCount={guides.length}
        totalHours={totalHoursLabel(guides)}
        firstGuideUrl={guides[0]?.guideUrl}
      />
      <UpcomingWorkshops workshops={upcoming} />
      {visibleTracks.map((track, i) => (
        <WorkshopTrackSection key={track.key} track={track} className={band(i)} />
      ))}
      <UntrackedArchive workshops={untracked} className={band(visibleTracks.length)} />
      <ProposeWorkshop reason={propose} />
    </>
  );
}
