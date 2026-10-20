import type { Metadata } from "next";
import { getUnifiedCalendarActivities } from "@/lib/calendar";
import { EventsHub } from "@/components/eventos/EventsHub";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Eventos & Calendario, AIR Club UdeSA",
  description:
    "Calendario integral de actividades del AIR Club UdeSA: workshops prácticos, AIR Talks, hitos del Challenge JAR 2026 y encuentros comunitarios.",
  path: "/eventos",
});

// ISR: se pre-renderiza como página estática para navegación instantánea y se revalida
// cada 60s en segundo plano.
export const revalidate = 60;

export default async function EventosPage() {
  const { activities, nextActivity } = await getUnifiedCalendarActivities();

  return <EventsHub initialActivities={activities} nextActivity={nextActivity} />;
}
