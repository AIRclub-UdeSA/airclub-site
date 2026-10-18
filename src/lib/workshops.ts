import { prisma } from "./prisma";
import {
  asyncWorkshops as seedAsyncWorkshops,
  pastWorkshops as seedPastWorkshops,
  tracks as seedTracks,
  type WorkshopLevel,
} from "../../prisma/seed-data/workshops";
import { getPastEvents, getUpcomingEvents, type EventItem } from "@/lib/events";
import { talkCover } from "@/lib/talk-format";
import { trackHref, workshopHref } from "@/lib/workshop-href";
import type { TalkMedia, TalkSlide } from "@/lib/talks";

export type { WorkshopLevel } from "../../prisma/seed-data/workshops";

/**
 * Clave de un workshop en la URL. "otros" no es un workshop cargado: junta los talleres-evento que no tienen `track`, para
 * que igual tengan caja y página.
 */
export type TrackKey = string;
const OTHERS = {
  key: "otros",
  title: "Otros talleres",
  summary: "Talleres presenciales sueltos, que no son parte de un workshop más largo.",
};

export type AsyncWorkshop = {
  track: TrackKey;
  /** Número de semana, con dos cifras ("01", "02"…). Es el numeral grande de la página. */
  week: string;
  slug: string;
  title: string;
  summary: string;
  /** Qué te llevás al terminar. */
  outcome: string;
  /** Duración estimada en minutos (rango). */
  minutes: [number, number];
  level: WorkshopLevel;
  /** Paquete que se compila esa semana; sin él no se muestran los comandos. */
  ros2Package?: string;
  /** Semanas del mismo workshop que hay que tener hechas antes. */
  requires: string[];
  guideUrl: string;
  codeUrl?: string;
  /** "60–90 min" o "2–3 h". */
  durationLabel: string;
};

/** Un taller presencial que viene es un evento de categoría "workshop": se carga en prisma/seed-data/events.ts. */
export type InPersonWorkshop = EventItem;

/**
 * Taller presencial que ya pasó, con el material de una charla de /talks (fotos, diapositivas, grabación y links). Viene
 * de /admin/workshops o de un evento de categoría "workshop" que ya pasó.
 */
export type PastWorkshop = {
  slug: string;
  track: TrackKey;
  title: string;
  /** Corto: va en su tarjeta. */
  summary: string;
  /** Lo que se vio, en la pestaña Resumen de su página. Sin ella, la página muestra `summary`. */
  description?: string;
  /** ISO; sin fecha, la tarjeta dice "Taller presencial". */
  startsAt?: string;
  endsAt?: string;
  dateLabel?: string;
  location?: string;
  instructor?: string;
  /** Foto de su tarjeta: la primera de `media`. */
  imageUrl?: string;
  media: TalkMedia[];
  slides: TalkSlide[];
  recordingUrl?: string;
  links: { label: string; url: string }[];
  url?: string;
  urlLabel?: string;
};

/** Un workshop con sus talleres: la caja de /workshops y la página /workshops/<key>. */
export type WorkshopTrack = {
  key: TrackKey;
  title: string;
  label?: string;
  summary: string;
  /** Guía de instalación que piden sus guías asincrónicas. */
  setupUrl?: string;
  /** Repositorio que se clona antes de la primera guía. */
  repoUrl?: string;
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

export { trackHref, workshopHref };

/**
 * Adónde lleva la caja de un workshop. Si tiene un solo taller y no tiene ruta de guías, directo a ese taller: una página
 * intermedia con una sola tarjeta obliga a un segundo clic para nada.
 */
export function trackEntryHref(t: Pick<WorkshopTrack, "key" | "guides" | "past" | "upcoming">): string {
  const single = t.guides.length === 0 && t.upcoming.length === 0 && t.past.length === 1;
  return single ? workshopHref(t.past[0]) : trackHref(t.key);
}

function formatMinutes([min, max]: [number, number]): string {
  if (max <= 90) return `${min}–${max} min`;
  const hours = (m: number) => String(Math.round((m / 60) * 2) / 2).replace(".", ",");
  return `${hours(min)}–${hours(max)} h`;
}

/* ---------- Lectura: Prisma, con respaldo al seed ---------- */

/** Lo cargado, antes de sumarle los talleres-evento. Sale de la base o, sin base, del seed. */
type WorkshopContent = {
  tracks: Omit<WorkshopTrack, "guides" | "past" | "upcoming">[];
  guides: AsyncWorkshop[];
  past: PastWorkshop[];
};

const LEVELS = { INICIAL: "inicial", INTERMEDIO: "intermedio", AVANZADO: "avanzado" } as const;
const PUBLISHED = { status: "PUBLISHED" } as const;

/** Workshops con sus guías y talleres, en orden. Con `includeDrafts`, también los borradores (para /admin/workshops). */
export function fetchWorkshopRows({ includeDrafts = false } = {}) {
  const where = includeDrafts ? undefined : PUBLISHED;
  const byOrder = { order: "asc" } as const;
  return prisma.workshopTrack.findMany({
    where,
    orderBy: byOrder,
    include: {
      guides: { where, orderBy: byOrder },
      sessions: {
        where,
        orderBy: byOrder,
        include: { media: { orderBy: byOrder }, slides: { orderBy: byOrder }, links: { orderBy: byOrder } },
      },
    },
  });
}

type TrackRow = Awaited<ReturnType<typeof fetchWorkshopRows>>[number];
type SessionRow = TrackRow["sessions"][number];

export function toSessionMedia(media: SessionRow["media"]): TalkMedia[] {
  return media.map((m) =>
    m.type === "VIDEO"
      ? { type: "video" as const, src: m.src, poster: m.poster ?? "" }
      : {
          type: "image" as const,
          src: m.src,
          lightBg: m.lightBg,
          objectFit: (m.objectFit as "contain" | "cover" | null) ?? undefined,
        },
  );
}

function fromRows(rows: TrackRow[]): WorkshopContent {
  return {
    tracks: rows.map((t) => ({
      key: t.key,
      title: t.title,
      label: t.label ?? undefined,
      summary: t.summary,
      setupUrl: t.setupUrl ?? undefined,
      repoUrl: t.repoUrl ?? undefined,
    })),
    guides: rows.flatMap((t) =>
      t.guides.map((g) => ({
        track: t.key,
        week: g.week,
        slug: g.slug,
        title: g.title,
        summary: g.summary,
        outcome: g.outcome,
        minutes: [g.minutesMin, g.minutesMax] as [number, number],
        level: LEVELS[g.level],
        ros2Package: g.ros2Package ?? undefined,
        requires: g.requires,
        guideUrl: g.guideUrl,
        codeUrl: g.codeUrl ?? undefined,
        durationLabel: formatMinutes([g.minutesMin, g.minutesMax]),
      })),
    ),
    past: rows.flatMap((t) =>
      t.sessions.map((s) => {
        const media = toSessionMedia(s.media);
        return {
          slug: s.slug,
          track: t.key,
          title: s.title,
          summary: s.summary,
          description: s.description ?? undefined,
          startsAt: s.startsAt?.toISOString(),
          endsAt: s.endsAt?.toISOString(),
          dateLabel: s.dateLabel ?? undefined,
          location: s.location ?? undefined,
          instructor: s.instructor ?? undefined,
          imageUrl: talkCover(media) ?? undefined,
          media,
          slides: s.slides.map(({ title, embedUrl, openUrl }) => ({ title, embedUrl, openUrl })),
          recordingUrl: s.recordingUrl ?? undefined,
          links: s.links.map(({ label, url }) => ({ label, url })),
        };
      }),
    ),
  };
}

function fromSeed(): WorkshopContent {
  return {
    tracks: seedTracks,
    guides: seedAsyncWorkshops.map((w) => ({ ...w, durationLabel: formatMinutes(w.minutes) })),
    past: seedPastWorkshops.map((w) => {
      const media = w.media ?? [];
      return {
        ...w,
        startsAt: w.startsAt?.toISOString(),
        endsAt: w.endsAt?.toISOString(),
        imageUrl: talkCover(media) ?? undefined,
        media,
        slides: w.slides ?? [],
        links: w.links ?? [],
      };
    }),
  };
}

// Lee de Prisma con fallback a seed-data si no hay conexión a base (ej.: build en CI con credenciales dummy), como talks.ts.
async function getWorkshopContent(): Promise<WorkshopContent> {
  try {
    return fromRows(await fetchWorkshopRows());
  } catch (err) {
    console.error("[workshops] Falló la consulta a base de datos, usando fallback al seed:", err);
    return fromSeed();
  }
}

/* ---------- Armado ---------- */

function fromEvent(e: EventItem, track: TrackKey): PastWorkshop {
  return {
    slug: e.slug,
    track,
    title: e.title,
    summary: e.description,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt?.toISOString(),
    dateLabel: e.dateLabel,
    location: e.location,
    instructor: e.instructor,
    imageUrl: e.imageUrl,
    media: e.imageUrl ? [{ type: "image", src: e.imageUrl }] : [],
    slides: [],
    links: [],
    url: e.externalUrl,
    urlLabel: e.ctaLabel,
  };
}

// Sin fecha va al final: es lo que todavía falta completar.
const byDateDesc = (a: PastWorkshop, b: PastWorkshop) =>
  (b.startsAt ? Date.parse(b.startsAt) : -Infinity) - (a.startsAt ? Date.parse(a.startsAt) : -Infinity);

/** Horas totales de un recorrido, redondeadas: "15–21 h". */
export function totalHoursLabel(workshops: AsyncWorkshop[]): string {
  const [min, max] = workshops.reduce(([a, b], w) => [a + w.minutes[0], b + w.minutes[1]], [0, 0]);
  return `${Math.floor(min / 60)}–${Math.ceil(max / 60)} h`;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Lo que dice un workshop en mono, igual en su caja de /workshops y en su página: cuántos talleres tiene, de qué tipo y cuánto lleva. */
export function trackFacts(t: WorkshopTrack): string[] {
  return [
    t.guides.length > 0 && `${pad2(t.guides.length)} ${t.guides.length === 1 ? "guía asincrónica" : "guías asincrónicas"}`,
    t.guides.length > 0 && `${totalHoursLabel(t.guides)} de práctica`,
    t.past.length > 0 && `${pad2(t.past.length)} ${t.past.length === 1 ? "taller presencial" : "talleres presenciales"}`,
    t.upcoming.length > 0 && `${pad2(t.upcoming.length)} ${t.upcoming.length === 1 ? "fecha próxima" : "fechas próximas"}`,
  ].filter((f): f is string => Boolean(f));
}

export async function getUpcomingWorkshops(): Promise<InPersonWorkshop[]> {
  return (await getUpcomingEvents()).filter((e) => e.category === "workshop");
}

/**
 * Los workshops con sus talleres, en el orden de las cajas, solo los que tienen algo. Los talleres presenciales que ya
 * pasaron son los cargados en el workshop más los eventos de categoría "workshop" que ya pasaron. "Otros talleres" va al
 * final y solo si hay talleres-evento con un `track` que no es de ningún workshop.
 */
export async function getWorkshopTracks(): Promise<WorkshopTrack[]> {
  const [content, pastEvents, upcoming] = await Promise.all([getWorkshopContent(), getPastEvents(), getUpcomingWorkshops()]);
  const known = new Set(content.tracks.map((t) => t.key));
  const trackOf = (e: EventItem) => (e.track && known.has(e.track) ? e.track : OTHERS.key);

  const past = [
    ...pastEvents.filter((e) => e.category === "workshop").map((e) => fromEvent(e, trackOf(e))),
    ...content.past,
  ].sort(byDateDesc);

  return [...content.tracks, OTHERS]
    .map((t) => ({
      ...t,
      guides: content.guides.filter((g) => g.track === t.key),
      past: past.filter((w) => w.track === t.key),
      upcoming: upcoming.filter((e) => trackOf(e) === t.key),
    }))
    .filter((t) => t.guides.length + t.past.length + t.upcoming.length > 0);
}

export async function getWorkshopTrack(key: string): Promise<WorkshopTrack | null> {
  return (await getWorkshopTracks()).find((t) => t.key === key) ?? null;
}

/** Talleres con página propia y que se pueden marcar como hechos: las guías y los presenciales que ya pasaron. */
export async function getWorkshopItems(): Promise<{ slug: string; track: TrackKey }[]> {
  return (await getWorkshopTracks()).flatMap((t) => [...t.guides, ...t.past].map(({ slug, track }) => ({ slug, track })));
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
