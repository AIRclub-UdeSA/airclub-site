import {
  asyncWorkshops as seedAsyncWorkshops,
  JAR_SITE_URL,
  JAR_WORKSHOPS_REPO,
  type SeedAsyncWorkshop,
} from "../../prisma/seed-data/workshops";
import { getPastEvents, getUpcomingEvents, type EventItem } from "@/lib/events";

export type { WorkshopLevel } from "../../prisma/seed-data/workshops";
export { JAR_SITE_URL, JAR_WORKSHOPS_REPO };

export type AsyncWorkshop = SeedAsyncWorkshop & {
  guideUrl: string;
  codeUrl: string;
  /** "60–90 min" o "2–3 h". */
  durationLabel: string;
};

/** Un taller presencial es un evento de categoría "workshop": se carga en prisma/seed-data/events.ts como cualquier evento. */
export type InPersonWorkshop = EventItem;

function formatMinutes([min, max]: [number, number]): string {
  if (max <= 90) return `${min}–${max} min`;
  const hours = (m: number) => String(Math.round((m / 60) * 2) / 2).replace(".", ",");
  return `${hours(min)}–${hours(max)} h`;
}

// Fase 1: lee de los arrays tipados en prisma/seed-data, igual que events.ts.
export async function getAsyncWorkshops(): Promise<AsyncWorkshop[]> {
  return seedAsyncWorkshops.map((w) => ({
    ...w,
    guideUrl: `${JAR_SITE_URL}/workshops/${w.slug}/`,
    codeUrl: `${JAR_WORKSHOPS_REPO}/tree/main/${w.slug}`,
    durationLabel: formatMinutes(w.minutes),
  }));
}

/** Horas totales del recorrido completo, redondeadas: "15–21 h". */
export function totalHoursLabel(workshops: AsyncWorkshop[]): string {
  const [min, max] = workshops.reduce(([a, b], w) => [a + w.minutes[0], b + w.minutes[1]], [0, 0]);
  return `${Math.floor(min / 60)}–${Math.ceil(max / 60)} h`;
}

export async function getUpcomingWorkshops(): Promise<InPersonWorkshop[]> {
  return (await getUpcomingEvents()).filter((e) => e.category === "workshop");
}

export async function getPastWorkshops(): Promise<InPersonWorkshop[]> {
  return (await getPastEvents()).filter((e) => e.category === "workshop");
}
