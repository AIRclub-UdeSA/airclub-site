import {
  asyncWorkshops as seedAsyncWorkshops,
  pastWorkshops as seedPastWorkshops,
  tracks as seedTracks,
  JAR_SITE_URL,
  JAR_WORKSHOPS_REPO,
  type SeedAsyncWorkshop,
  type SeedWorkshopTrack,
} from "../../prisma/seed-data/workshops";
import { getPastEvents, getUpcomingEvents, type EventItem } from "@/lib/events";

export type { WorkshopLevel, WorkshopTrackKey } from "../../prisma/seed-data/workshops";
export { JAR_SITE_URL, JAR_WORKSHOPS_REPO };

export type AsyncWorkshop = SeedAsyncWorkshop & {
  guideUrl: string;
  codeUrl: string;
  /** "60–90 min" o "2–3 h". */
  durationLabel: string;
};

/** Un taller presencial que viene es un evento de categoría "workshop": se carga en prisma/seed-data/events.ts. */
export type InPersonWorkshop = EventItem;

/** Taller presencial que ya pasó, venga de un evento o de `pastWorkshops` del seed (sin fecha ni foto todavía). */
export type PastWorkshop = {
  slug: string;
  title: string;
  summary: string;
  /** ISO; sin fecha, la tarjeta dice "Taller presencial". */
  startsAt?: string;
  dateLabel?: string;
  imageUrl?: string;
  url?: string;
  urlLabel?: string;
};

export type WorkshopTrack = SeedWorkshopTrack & {
  /** Guías asincrónicas de la línea, en orden. */
  guides: AsyncWorkshop[];
  /** Talleres presenciales que ya pasaron, el más reciente primero. */
  past: PastWorkshop[];
};

function formatMinutes([min, max]: [number, number]): string {
  if (max <= 90) return `${min}–${max} min`;
  const hours = (m: number) => String(Math.round((m / 60) * 2) / 2).replace(".", ",");
  return `${hours(min)}–${hours(max)} h`;
}

function toAsyncWorkshop(w: SeedAsyncWorkshop): AsyncWorkshop {
  return {
    ...w,
    guideUrl: `${JAR_SITE_URL}/workshops/${w.slug}/`,
    codeUrl: `${JAR_WORKSHOPS_REPO}/tree/main/${w.slug}`,
    durationLabel: formatMinutes(w.minutes),
  };
}

function fromEvent(e: EventItem): PastWorkshop {
  return {
    slug: e.slug,
    title: e.title,
    summary: e.description,
    startsAt: e.startsAt.toISOString(),
    dateLabel: e.dateLabel,
    imageUrl: e.imageUrl,
    url: e.externalUrl,
    urlLabel: e.ctaLabel,
  };
}

// Sin fecha va al final: es lo que todavía falta completar.
const byDateDesc = (a: PastWorkshop, b: PastWorkshop) =>
  (b.startsAt ? Date.parse(b.startsAt) : -Infinity) - (a.startsAt ? Date.parse(a.startsAt) : -Infinity);

// Fase 1: lee de los arrays tipados en prisma/seed-data, igual que events.ts.
export async function getAsyncWorkshops(): Promise<AsyncWorkshop[]> {
  return seedAsyncWorkshops.map(toAsyncWorkshop);
}

/** Horas totales de un recorrido, redondeadas: "15–21 h". */
export function totalHoursLabel(workshops: AsyncWorkshop[]): string {
  const [min, max] = workshops.reduce(([a, b], w) => [a + w.minutes[0], b + w.minutes[1]], [0, 0]);
  return `${Math.floor(min / 60)}–${Math.ceil(max / 60)} h`;
}

export async function getUpcomingWorkshops(): Promise<InPersonWorkshop[]> {
  return (await getUpcomingEvents()).filter((e) => e.category === "workshop");
}

/**
 * Las líneas de /workshops con lo suyo: guías asincrónicas y talleres pasados. Los talleres-evento sin `track` no entran
 * en ninguna línea: van en `untracked`, que la página muestra como archivo aparte.
 */
export async function getWorkshopTracks(): Promise<{ tracks: WorkshopTrack[]; untracked: PastWorkshop[] }> {
  const [guides, pastEvents] = await Promise.all([
    getAsyncWorkshops(),
    getPastEvents().then((all) => all.filter((e) => e.category === "workshop")),
  ]);

  const tracks = seedTracks.map((t) => ({
    ...t,
    guides: guides.filter((g) => g.track === t.key),
    past: [
      ...pastEvents.filter((e) => e.track === t.key).map(fromEvent),
      ...seedPastWorkshops
        .filter((w) => w.track === t.key)
        .map((w) => ({ slug: w.slug, title: w.title, summary: w.summary, startsAt: w.startsAt?.toISOString(), imageUrl: w.imageUrl })),
    ].sort(byDateDesc),
  }));

  const known = new Set(seedTracks.map((t) => t.key));
  const untracked = pastEvents.filter((e) => !e.track || !known.has(e.track)).map(fromEvent);

  return { tracks, untracked };
}
