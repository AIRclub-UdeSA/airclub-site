import type { Metadata } from "next";
import { getTalksTimeline } from "@/lib/talks";
import { formatDaysUntil, isUpcoming } from "@/lib/dates";
import type { TimelineTalk } from "@/components/talks/TalksTimeline";
import { TalksHub } from "@/components/talks/TalksHub";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AIR Talks, AIR Club UdeSA",
  description:
    "Divulgación y discusión técnica: tesistas, estudiantes e investigadores invitados hablan de IA y robótica. Archivo histórico, slides interactivas y próxima charla.",
  path: "/talks",
});

// ISR: se pre-renderiza como página estática para navegación instantánea y se revalida
// cada 60s en segundo plano, o al instante ante cambios desde /admin vía revalidatePath("/talks").
export const revalidate = 60;

export default async function TalksPage() {
  const { talks, nextSlug, latestPastSlug } = await getTalksTimeline();
  const serializable: TimelineTalk[] = talks.map((t) => ({
    ...t,
    startsAt: t.startsAt?.toISOString(),
    endsAt: t.endsAt?.toISOString(),
    isUpcoming: Boolean(t.startsAt && isUpcoming(t.startsAt, t.endsAt)),
  }));

  // El "hoy" y los días que faltan se calculan acá, en el servidor, para que el cliente
  // renderice exactamente lo mismo al hidratar.
  const next = talks.find((t) => t.slug === nextSlug);
  const daysUntilNext = next?.startsAt ? (formatDaysUntil(next.startsAt) ?? "En curso") : null;

  return (
    <TalksHub
      talks={serializable}
      nextSlug={nextSlug}
      latestPastSlug={latestPastSlug}
      todayIso={new Date().toISOString()}
      daysUntilNext={daysUntilNext}
    />
  );
}
