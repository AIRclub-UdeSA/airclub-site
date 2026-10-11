import type { Metadata } from "next";
import { getAsyncWorkshops, getPastWorkshops, getUpcomingWorkshops, totalHoursLabel } from "@/lib/workshops";
import { getContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";
import { WorkshopsHero } from "@/components/workshops/WorkshopsHero";
import { UpcomingWorkshops } from "@/components/workshops/UpcomingWorkshops";
import { AsyncRoute } from "@/components/workshops/AsyncRoute";
import { WorkshopArchive } from "@/components/workshops/WorkshopArchive";
import { ProposeWorkshop } from "@/components/workshops/ProposeWorkshop";

export const metadata: Metadata = buildMetadata({
  title: "Workshops, AIR Club UdeSA",
  description:
    "Formación práctica sin requisitos previos: talleres presenciales en el Campus Victoria y un recorrido asincrónico de ROS 2 con el simulador del Challenge JAR 2026.",
  path: "/workshops",
});

// ISR: el estado próximo/pasado de cada taller sale de su fecha, así que la página se revalida sola cada hora.
export const revalidate = 3600;

export default async function WorkshopsPage() {
  const [asyncWorkshops, upcoming, past, propose] = await Promise.all([
    getAsyncWorkshops(),
    getUpcomingWorkshops(),
    getPastWorkshops(),
    getContactReason("workshop"),
  ]);
  const totalHours = totalHoursLabel(asyncWorkshops);

  return (
    <>
      <WorkshopsHero guideCount={asyncWorkshops.length} totalHours={totalHours} firstGuideUrl={asyncWorkshops[0]?.guideUrl} />
      <UpcomingWorkshops workshops={upcoming} />
      <AsyncRoute workshops={asyncWorkshops} totalHours={totalHours} />
      <WorkshopArchive workshops={past} />
      <ProposeWorkshop reason={propose} />
    </>
  );
}
