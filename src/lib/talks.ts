import {
  talks as seedTalks,
  type SeedTalk,
  type TalkMedia,
  type TalkSlide,
  type TalkSpeaker,
} from "../../prisma/seed-data/talks";
import { isUpcoming } from "@/lib/dates";

export type TalkItem = SeedTalk;
export type { TalkMedia, TalkSlide, TalkSpeaker };

// Igual que events.ts: hoy lee del array tipado; la firma no cambia al conectar Postgres.
export async function getAllTalks(): Promise<TalkItem[]> {
  // Las charlas con fecha van en orden cronológico; las que no tienen (Call for Speakers) siempre al final.
  const time = (t: TalkItem) => t.startsAt?.getTime() ?? Infinity;
  return [...seedTalks].sort((a, b) => time(a) - time(b));
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
