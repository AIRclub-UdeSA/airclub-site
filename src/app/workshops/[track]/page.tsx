import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getWorkshopTracks, trackHref } from "@/lib/workshops";
import { getContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";
import { WorkshopProgressProvider } from "@/components/workshops/WorkshopProgress";
import { TrackBody } from "@/components/workshops/TrackBody";
import { UpcomingWorkshops } from "@/components/workshops/UpcomingWorkshops";
import { ProposeWorkshop } from "@/components/workshops/ProposeWorkshop";

const CONTAINER = "mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12";

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
      <article className="pt-28 md:pt-32">
        <div className={CONTAINER}>
          <Link
            href={`/workshops#workshop-${track.key}`}
            className="inline-flex items-center gap-2 font-mono text-[.74rem] uppercase tracking-[.14em] text-text2 transition-colors hover:text-crimson-text"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Todos los workshops
          </Link>
        </div>

        <header className={`${CONTAINER} mt-10 md:mt-14`}>
          <p className="font-mono text-[.78rem] font-semibold uppercase tracking-[.16em] text-mauve">
            Workshop {String(index + 1).padStart(2, "0")}
            {track.label && ` · ${track.label}`}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
            <span className="font-logo text-[clamp(6rem,16vw,14rem)] leading-[0.8] text-crimson-text" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h1 className="min-w-0 pb-2 font-display text-[clamp(1.6rem,5.4vw,4.4rem)] font-black uppercase leading-[0.98] tracking-tight text-text [overflow-wrap:anywhere]">
              {track.title}
            </h1>
          </div>
          <p className="mt-8 max-w-[62ch] text-[1.15rem] leading-[1.7] text-text2">{track.summary}</p>
        </header>

        <section className="mt-12 bg-bg2 py-16 md:mt-16 md:py-24">
          <div className={CONTAINER}>
            <TrackBody track={track} />
          </div>
        </section>

        {track.upcoming.length > 0 && (
          <div className="pt-16 md:pt-24">
            <UpcomingWorkshops workshops={track.upcoming} />
          </div>
        )}
      </article>

      <ProposeWorkshop reason={propose} />
    </WorkshopProgressProvider>
  );
}
