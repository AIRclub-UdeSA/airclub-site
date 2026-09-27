import { prisma } from "./prisma";
import { isUpcoming } from "@/lib/dates";

export type TalkMedia = { type: "image"; src: string } | { type: "video"; src: string; poster: string };

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
};

export type TalkItem = {
  slug: string;
  title: string;
  subtitle: string;
  details: string;
  abstract: string;
  speaker?: TalkSpeaker;
  startsAt?: Date;
  endsAt?: Date;
  dateLabel?: string;
  placeholder?: string;
  location?: string;
  topic?: string;
  /** Grabacion completa de la charla, si existe: siempre un link externo (YouTube), nunca un archivo en Storage. */
  recordingUrl?: string;
  media: TalkMedia[];
  slides?: TalkSlide[];
  links?: { label: string; url: string }[];
  cta?: { label: string; url: string };
};

type TalkRow = Awaited<ReturnType<typeof fetchTalkRows>>[number];

function fetchTalkRows() {
  return prisma.talk.findMany({
    orderBy: { order: "asc" },
    include: {
      media: { orderBy: { order: "asc" } },
      slides: { orderBy: { order: "asc" } },
      links: { orderBy: { order: "asc" } },
    },
  });
}

function toTalkItem(row: TalkRow): TalkItem {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    details: row.details,
    abstract: row.abstract,
    speaker: row.speakerName
      ? {
          name: row.speakerName,
          role: row.speakerRole ?? "",
          affiliation: row.speakerAffiliation ?? undefined,
          avatar: row.speakerAvatar ?? undefined,
          linkedin: row.speakerLinkedin ?? undefined,
        }
      : undefined,
    startsAt: row.startsAt ?? undefined,
    endsAt: row.endsAt ?? undefined,
    dateLabel: row.dateLabel ?? undefined,
    placeholder: row.placeholder ?? undefined,
    location: row.location ?? undefined,
    topic: row.topic ?? undefined,
    recordingUrl: row.recordingUrl ?? undefined,
    media: row.media.map((m) =>
      m.type === "VIDEO" ? { type: "video" as const, src: m.src, poster: m.poster ?? "" } : { type: "image" as const, src: m.src },
    ),
    slides: row.slides.length ? row.slides.map(({ title, embedUrl, openUrl }) => ({ title, embedUrl, openUrl })) : undefined,
    links: row.links.length ? row.links.map(({ label, url }) => ({ label, url })) : undefined,
    cta: row.ctaUrl ? { label: row.ctaLabel ?? "", url: row.ctaUrl } : undefined,
  };
}

// Igual que events.ts/team.ts: la firma no cambia al conectar Postgres.
export async function getAllTalks(): Promise<TalkItem[]> {
  const rows = await fetchTalkRows();
  const items = rows.map(toTalkItem);
  // Las charlas con fecha van en orden cronológico; las que no tienen (Call for Speakers) siempre al final.
  const time = (t: TalkItem) => t.startsAt?.getTime() ?? Infinity;
  return items.sort((a, b) => time(a) - time(b));
}

/** Todas las charlas en orden cronológico, más el slug de la próxima (si hay) y la última realizada. */
export async function getTalksTimeline(): Promise<{
  talks: TalkItem[];
  nextSlug: string | null;
  latestPastSlug: string | null;
}> {
  const talks = await getAllTalks();
  const next = talks.find((t) => t.startsAt && isUpcoming(t.startsAt, t.endsAt));

  // La última charla pasada es la que tiene fecha y no es upcoming, ordenada de más reciente a más antigua
  const pastTalks = talks.filter((t) => t.startsAt && !isUpcoming(t.startsAt, t.endsAt));
  const latestPast = pastTalks.length > 0 ? pastTalks[pastTalks.length - 1] : null;

  return {
    talks,
    nextSlug: next?.slug ?? null,
    latestPastSlug: latestPast?.slug ?? null,
  };
}
