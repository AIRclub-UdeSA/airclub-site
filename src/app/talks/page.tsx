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

// Se renderiza en cada request (no estática): el contenido sale de la base y puede cambiar en
// cualquier momento, y ademas next build no tiene acceso a una base real (usa credenciales
// dummy en CI para no exponer secretos).
export const dynamic = "force-dynamic";

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
