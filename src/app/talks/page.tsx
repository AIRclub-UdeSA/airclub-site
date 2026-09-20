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
      <header className="mx-auto max-w-7xl px-6 pb-4 pt-32 sm:px-8 md:px-12 md:pb-6 md:pt-36">
        <h1 className="border-b border-border/80 pb-6 font-display text-[clamp(3rem,8vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight text-text">
          AIR <span className="text-crimson">Talks</span>
        </h1>
        <p className="mt-5 max-w-[78ch] text-[1.05rem] leading-[1.8] text-text2">
          El espacio abierto de divulgación técnica del club: tesistas presentan avances, estudiantes comparten proyectos,
          investigadores invitados debaten el estado del arte y empresas muestran cómo aplican la IA y la robótica en la industria.
        </p>
      </header>

      <TalksHub
        talks={serializable}
        nextSlug={nextSlug}
        latestPastSlug={latestPastSlug}
      />
    </>
  );
}
