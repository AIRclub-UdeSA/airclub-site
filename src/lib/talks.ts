import { prisma } from "./prisma";
import { formatDaysUntil, isUpcoming } from "@/lib/dates";
import type { TimelineTalk } from "@/components/talks/TalksTimeline";
import { talks as seedTalks, type SeedTalk } from "../../prisma/seed-data/talks";

export type TalkMedia =
  | {
      type: "image";
      src: string;
      lightBg?: boolean;
      objectFit?: "contain" | "cover";
    }
  | { type: "video"; src: string; poster: string };

export type TalkSlide = {
  title: string;
  embedUrl: string;
  openUrl: string;
};

export type TalkSpeaker = {
  name: string;
  role: string;
  affiliation?: string;
  avatar?: string;
  linkedin?: string;
  bio?: string;
};

export type TalkItem = {
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  speaker?: TalkSpeaker;
  speakers?: TalkSpeaker[];
  startsAt?: Date;
  endsAt?: Date;
  dateLabel?: string;
  location?: string;
  topic?: string;
  /** Grabacion completa de la charla, si existe: siempre un link externo (YouTube), nunca un archivo en Storage. */
  recordingUrl?: string;
  /** false = todavia "a confirmar" (titulo/orador/resumen son placeholder). */
  confirmed: boolean;
  media: TalkMedia[];
  slides?: TalkSlide[];
  links?: { label: string; url: string }[];
  cta?: { label: string; url: string };
  /** true = borrador: no aparece en /talks. Solo lo ve /admin/talks. */
  draft?: boolean;
};

type TalkRow = Awaited<ReturnType<typeof fetchTalkRows>>[number];

export function fetchTalkRows({ includeDrafts = false } = {}) {
  return prisma.talk.findMany({
    where: includeDrafts ? undefined : { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: {
      media: { orderBy: { order: "asc" } },
      slides: { orderBy: { order: "asc" } },
      links: { orderBy: { order: "asc" } },
    },
  });
}

export function toTalkItem(row: TalkRow): TalkItem {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    abstract: row.abstract,
    speaker: row.speakerName
      ? {
          name: row.speakerName,
          role: row.speakerRole ?? "",
          affiliation: row.speakerAffiliation ?? undefined,
          avatar: row.speakerAvatar ?? undefined,
          linkedin: row.speakerLinkedin ?? undefined,
          bio: row.speakerBio ?? undefined,
        }
      : undefined,
    speakers: row.speakerName
      ? [
          {
            name: row.speakerName,
            role: row.speakerRole ?? "",
            affiliation: row.speakerAffiliation ?? undefined,
            avatar: row.speakerAvatar ?? undefined,
            linkedin: row.speakerLinkedin ?? undefined,
            bio: row.speakerBio ?? undefined,
          },
        ]
      : undefined,
    startsAt: row.startsAt ?? undefined,
    endsAt: row.endsAt ?? undefined,
    dateLabel: row.dateLabel ?? undefined,
    location: row.location ?? undefined,
    topic: row.topic ?? undefined,
    recordingUrl: row.recordingUrl ?? undefined,
    confirmed: row.confirmed,
    media: row.media.map((m) =>
      m.type === "VIDEO"
        ? { type: "video" as const, src: m.src, poster: m.poster ?? "" }
        : {
            type: "image" as const,
            src: m.src,
            lightBg: m.lightBg,
            objectFit: (m.objectFit as "contain" | "cover" | null) ?? undefined,
          },
    ),
    slides: row.slides.length ? row.slides.map(({ title, embedUrl, openUrl }) => ({ title, embedUrl, openUrl })) : undefined,
    links: row.links.length ? row.links.map(({ label, url }) => ({ label, url })) : undefined,
    cta: row.ctaUrl ? { label: row.ctaLabel ?? "", url: row.ctaUrl } : undefined,
    draft: row.status === "DRAFT" || undefined,
  };
}

function fromSeed(t: SeedTalk): TalkItem {
  const speakers = t.speakers?.length ? t.speakers : t.speaker ? [t.speaker] : undefined;
  return {
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    abstract: t.abstract,
    speaker: t.speaker,
    speakers,
    startsAt: t.startsAt,
    endsAt: t.endsAt,
    dateLabel: t.dateLabel,
    location: t.location,
    topic: t.topic,
    recordingUrl: t.recordingUrl,
    confirmed: Boolean(t.confirmed),
    media: t.media ?? [],
    slides: t.slides?.length ? t.slides : undefined,
    links: t.links?.length ? t.links : undefined,
    cta: t.cta,
  };
}

// Las charlas con fecha van en orden cronológico; las que no tienen (Call for Speakers) siempre al final.
export function sortTalks<E extends { item: TalkItem; order: number }>(items: E[]): E[] {
  const time = (t: TalkItem) => t.startsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return [...items].sort((a, b) => time(a.item) - time(b.item) || a.order - b.order);
}

// Lee de Prisma con fallback a seed-data si no hay conexión a base (ej.: build en CI con credenciales dummy).
export async function getAllTalks(): Promise<TalkItem[]> {
  try {
    const rows = await fetchTalkRows();
    return sortTalks(rows.map((row) => ({ item: toTalkItem(row), order: row.order }))).map(({ item }) => item);
  } catch (err) {
    console.error("[talks] Falló la consulta a base de datos, usando fallback al seed:", err);
    return sortTalks(seedTalks.map((talk, idx) => ({ item: fromSeed(talk), order: idx }))).map(({ item }) => item);
  }
}

/**
 * Lo que necesita TalksHub, en orden cronológico: la próxima charla (si hay), la última realizada y los días
 * que faltan. Los borradores (solo en /admin/talks) quedan en la línea de tiempo pero no cuentan para la
 * próxima ni la última, así el panel muestra arriba lo mismo que ve el público.
 */
export function talksHubProps(talks: TalkItem[]) {
  const published = talks.filter((t) => !t.draft);
  const next = published.find((t) => t.startsAt && isUpcoming(t.startsAt, t.endsAt));
  const latestPast = published.filter((t) => t.startsAt && !isUpcoming(t.startsAt, t.endsAt)).at(-1);

  const timeline: TimelineTalk[] = talks.map((t) => ({
    ...t,
    startsAt: t.startsAt?.toISOString(),
    endsAt: t.endsAt?.toISOString(),
    isUpcoming: Boolean(t.startsAt && isUpcoming(t.startsAt, t.endsAt)),
  }));

  return {
    talks: timeline,
    nextSlug: next?.slug ?? null,
    latestPastSlug: latestPast?.slug ?? null,
    // El "hoy" y los días que faltan se calculan acá, en el servidor, para que el cliente
    // renderice exactamente lo mismo al hidratar.
    todayIso: new Date().toISOString(),
    daysUntilNext: next?.startsAt ? (formatDaysUntil(next.startsAt) ?? "En curso") : null,
  };
}
