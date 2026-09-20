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
      <header className="relative w-full overflow-hidden border-b border-border/80 pt-28 sm:pt-32 md:pt-36">
        <div className="w-full px-4 sm:px-8 md:px-12">
          {/* Masthead monumental desbordado */}
          <div className="overflow-hidden">
            <h1 className="font-display font-black uppercase tracking-tight text-text select-none text-[clamp(3.5rem,10.8vw,10.8rem)] leading-[0.88] whitespace-nowrap">
              AIR <span className="text-crimson">TALKS</span>
            </h1>
          </div>

          {/* Bajada concisa sin subtítulos de más */}
          <div className="mx-auto max-w-7xl px-2 py-5 sm:py-6">
            <p className="max-w-[68ch] text-[1.05rem] leading-[1.7] text-text2">
              Divulgación técnica y discusión abierta: avances de tesis, robótica autónoma e investigadores invitados.
            </p>
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
