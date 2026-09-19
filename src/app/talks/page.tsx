import type { Metadata } from "next";
import { getTalksTimeline } from "@/lib/talks";
import { TalksTimeline, type TimelineTalk } from "@/components/talks/TalksTimeline";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AIR Talks, AIR Club UdeSA",
  description:
    "Divulgación y discusión técnica: tesistas, estudiantes e investigadores invitados hablan de IA y robótica. Archivo histórico y próxima charla.",
  path: "/talks",
});

// Recalcula cada hora qué charlas son pasadas y cuál es la próxima (si no, quedaría fijo al último deploy).
export const revalidate = 3600;

export default async function TalksPage() {
  const { talks, nextSlug } = await getTalksTimeline();
  const serializable: TimelineTalk[] = talks.map((t) => ({
    ...t,
    startsAt: t.startsAt?.toISOString(),
    endsAt: undefined,
  }));

  return (
    <>
      <header className="mx-auto max-w-7xl px-6 pb-8 pt-32 sm:px-8 md:px-12 md:pb-10 md:pt-36">
        <h1 className="border-b border-border/80 pb-6 font-display text-[clamp(3rem,8vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight text-text">
          AIR <span className="text-crimson">Talks</span>
        </h1>
        <p className="mt-5 max-w-[78ch] text-[1.02rem] leading-[1.8] text-text2">
          El espacio abierto donde tesistas muestran avances, estudiantes comparten proyectos, investigadores invitados
          debaten sobre sus avances y empresas cuentan cómo aplican la IA y la robótica en la industria.
        </p>
      </header>
      <section className="overflow-hidden pb-22.5 max-md:pb-15">
        <TalksTimeline talks={serializable} nextSlug={nextSlug} />
      </section>
    </>
  );
}
