import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkshopTracks, trackFacts, trackHref } from "@/lib/workshops";
import { getContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";
import { WorkshopProgressProvider } from "@/components/workshops/WorkshopProgress";
import { TrackBody, firstSectionId } from "@/components/workshops/TrackBody";
import { DetailHero } from "@/components/workshops/DetailHero";
import { StartButton } from "@/components/workshops/StartButton";
import { ProposeWorkshop } from "@/components/workshops/ProposeWorkshop";


// Estática (ISR, 1 h), como /workshops: el progreso de la persona se pide desde el cliente.
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getWorkshopTracks()).map((t) => ({ track: t.key }));
}

export async function generateMetadata({ params }: PageProps<"/workshops/[track]">): Promise<Metadata> {
  const { track: key } = await params;
  const track = (await getWorkshopTracks()).find((t) => t.key === key);
  if (!track) return buildMetadata({ title: "Workshop no encontrado", description: "", path: `/workshops/${key}` });
  return buildMetadata({ title: `${track.title}, Workshops AIR Club UdeSA`, description: track.summary, path: trackHref(track.key) });
}

/**
 * La página de un workshop (lo que abre su caja en /workshops): su número de orden en Anton, el título y, adentro, sus
 * talleres. "Todos los workshops" vuelve a su caja.
 */
export default async function TrackPage({ params }: PageProps<"/workshops/[track]">) {
  const { track: key } = await params;
  const tracks = await getWorkshopTracks();
  const index = tracks.findIndex((t) => t.key === key);
  if (index < 0) notFound();
  const track = tracks[index];
  const propose = await getContactReason("workshop");

  return (
    <WorkshopProgressProvider>
      <article>
        <DetailHero
          number={String(index + 1).padStart(2, "0")}
          srLabel={`Workshop ${String(index + 1).padStart(2, "0")}: `}
          title={track.title}
          text={track.summary}
          meta={trackFacts(track).join(" · ")}
          back={{ href: `/workshops#workshop-${track.key}`, label: "Todos los workshops" }}
          kicker={`Workshop ${String(index + 1).padStart(2, "0")} de ${String(tracks.length).padStart(2, "0")}`}
        >
          <StartButton target={`#${firstSectionId(track)}`} tone="light">
            Empezar
          </StartButton>
        </DetailHero>

        <TrackBody track={track} />
      </article>

      <ProposeWorkshop reason={propose} />
    </WorkshopProgressProvider>
  );
}
