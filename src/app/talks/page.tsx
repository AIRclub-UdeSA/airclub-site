import type { Metadata } from "next";
import { getTalksTimeline } from "@/lib/talks";
import type { TimelineTalk } from "@/components/talks/TalksTimeline";
import { TalksHub } from "@/components/talks/TalksHub";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AIR Talks, AIR Club UdeSA",
  description:
    "Divulgación y discusión técnica: tesistas, estudiantes e investigadores invitados hablan de IA y robótica. Archivo histórico, slides interactivas y próxima charla.",
  path: "/talks",
});

// Recalcula cada hora qué charlas son pasadas y cuál es la próxima (si no, quedaría fijo al último deploy).
export const revalidate = 3600;

export default async function TalksPage() {
  const { talks, nextSlug, latestPastSlug } = await getTalksTimeline();
  const serializable: TimelineTalk[] = talks.map((t) => ({
    ...t,
    startsAt: t.startsAt?.toISOString(),
    endsAt: undefined,
  }));

  return (
    <>
      <header className="relative w-full overflow-hidden pt-28 sm:pt-32 md:pt-34 pb-4 sm:pb-6">
        <div className="w-full px-4 sm:px-8 md:px-12">
          {/* Masthead monumental en Anton (font-logo) sin líneas de corte ni subtítulos redundantes */}
          <div className="overflow-hidden">
            <h1 className="font-logo uppercase tracking-tight text-text select-none text-[clamp(4.2rem,13.5vw,13.5rem)] leading-[0.84] whitespace-nowrap">
              AIR <span className="text-crimson">TALKS</span>
            </h1>
          </div>
        </div>
      </header>

      <TalksHub
        talks={serializable}
        nextSlug={nextSlug}
        latestPastSlug={latestPastSlug}
      />
    </>
  );
}
