import {
  asyncWorkshops as seedAsyncWorkshops,
  pastWorkshops as seedPastWorkshops,
  tracks as seedTracks,
  JAR_SITE_URL,
  JAR_WORKSHOPS_REPO,
  type SeedAsyncWorkshop,
  type WorkshopTrackKey,
} from "../../prisma/seed-data/workshops";
import { getPastEvents, getUpcomingEvents, type EventItem } from "@/lib/events";

export type { WorkshopLevel, WorkshopTrackKey } from "../../prisma/seed-data/workshops";
export { JAR_SITE_URL, JAR_WORKSHOPS_REPO };

/**
 * Clave de un workshop en la URL. "otros" no está en el seed: junta los talleres-evento que no tienen `track`, para que
 * igual tengan caja y página.
 */
export type TrackKey = WorkshopTrackKey | "otros";
const OTHERS = {
  key: "otros" as const,
  title: "Otros talleres",
  summary: "Talleres presenciales sueltos, que no son parte de un workshop más largo.",
};

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
  track: TrackKey;
  title: string;
  summary: string;
  /** ISO; sin fecha, la tarjeta dice "Taller presencial". */
  startsAt?: string;
  dateLabel?: string;
  location?: string;
  instructor?: string;
  imageUrl?: string;
  url?: string;
  urlLabel?: string;
};

/** Un workshop con sus talleres: la caja de /workshops y la página /workshops/<key>. */
export type WorkshopTrack = {
  key: TrackKey;
  title: string;
  label?: string;
  summary: string;
  /** Guías asincrónicas, en orden. */
  guides: AsyncWorkshop[];
  /** Talleres presenciales que ya pasaron, el más reciente primero. */
  past: PastWorkshop[];
  /** Talleres presenciales que vienen, el más cercano primero. */
  upcoming: InPersonWorkshop[];
};

/** Lo que muestra /workshops/<workshop>/<taller>: una guía (con sus vecinas) o un taller presencial pasado. */
export type WorkshopDetail =
  | {
      kind: "guide";
      track: WorkshopTrack;
      guide: AsyncWorkshop;
      /** Las guías del mismo workshop que hay que tener hechas antes (de `requires`). */
      requires: AsyncWorkshop[];
      prev?: AsyncWorkshop;
      next?: AsyncWorkshop;
    }
  | { kind: "past"; track: WorkshopTrack; workshop: PastWorkshop };

/** Página de un workshop (la caja). */
export const trackHref = (key: TrackKey) => `/workshops/${key}`;
/** Página de un taller: va adentro de su workshop. */
export const workshopHref = (w: { slug: string; track: TrackKey }) => `${trackHref(w.track)}/${w.slug}`;

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

const knownTrack = (key?: string): TrackKey => (seedTracks.some((t) => t.key === key) ? (key as WorkshopTrackKey) : "otros");

function fromEvent(e: EventItem): PastWorkshop {
  return {
    slug: e.slug,
    track: knownTrack(e.track),
    title: e.title,
    summary: e.description,
    startsAt: e.startsAt.toISOString(),
    dateLabel: e.dateLabel,
    location: e.location,
    instructor: e.instructor,
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

/** Talleres presenciales que ya pasaron: los eventos de categoría "workshop" y los del seed que todavía no tienen fecha. */
async function getPastWorkshops(): Promise<PastWorkshop[]> {
  const events = (await getPastEvents()).filter((e) => e.category === "workshop").map(fromEvent);
  const seed = seedPastWorkshops.map((w) => ({
    slug: w.slug,
    track: w.track,
    title: w.title,
    summary: w.summary,
    startsAt: w.startsAt?.toISOString(),
    imageUrl: w.imageUrl,
  }));
  return [...events, ...seed].sort(byDateDesc);
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
 * Los workshops con sus talleres, en el orden de `tracks` (el de las cajas), solo los que tienen algo. "Otros talleres"
 * va al final y solo si hay talleres-evento sin `track`.
 */
export async function getWorkshopTracks(): Promise<WorkshopTrack[]> {
  const [guides, past, upcoming] = await Promise.all([getAsyncWorkshops(), getPastWorkshops(), getUpcomingWorkshops()]);

  return [...seedTracks, OTHERS]
    .map((t) => ({
      ...t,
      guides: guides.filter((g) => g.track === t.key),
      past: past.filter((w) => w.track === t.key),
      upcoming: upcoming.filter((e) => knownTrack(e.track) === t.key),
    }))
    .filter((t) => t.guides.length + t.past.length + t.upcoming.length > 0);
}

export async function getWorkshopTrack(key: string): Promise<WorkshopTrack | null> {
  return (await getWorkshopTracks()).find((t) => t.key === key) ?? null;
}

/** Talleres con página propia y que se pueden marcar como hechos: las guías y los presenciales que ya pasaron. */
export async function getWorkshopItems(): Promise<{ slug: string; track: TrackKey }[]> {
  const [guides, past] = await Promise.all([getAsyncWorkshops(), getPastWorkshops()]);
  return [...guides, ...past].map(({ slug, track }) => ({ slug, track }));
}

export async function getWorkshopDetail(trackKey: string, slug: string): Promise<WorkshopDetail | null> {
  const track = await getWorkshopTrack(trackKey);
  if (!track) return null;

  const guide = track.guides.find((g) => g.slug === slug);
  if (guide) {
    const i = track.guides.indexOf(guide);
    const requires = guide.requires.flatMap((week) => track.guides.filter((g) => g.week === week));
    return { kind: "guide", track, guide, requires, prev: track.guides[i - 1], next: track.guides[i + 1] };
  }

  const workshop = track.past.find((w) => w.slug === slug);
  return workshop ? { kind: "past", track, workshop } : null;
}
