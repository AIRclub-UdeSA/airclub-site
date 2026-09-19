import { talks as seedTalks, type SeedTalk, type TalkMedia } from "../../prisma/seed-data/talks";
import { isUpcoming } from "@/lib/dates";

export type TalkItem = SeedTalk;
export type { TalkMedia };

// Igual que events.ts: hoy lee del array tipado; la firma no cambia al conectar Postgres.
async function getAllTalks(): Promise<TalkItem[]> {
  // Las charlas con fecha van en orden cronológico; las que no tienen (Call for Speakers) siempre al final.
  const time = (t: TalkItem) => t.startsAt?.getTime() ?? Infinity;
  return [...seedTalks].sort((a, b) => time(a) - time(b));
}

/** Todas las charlas en orden cronológico, más el slug de la próxima (si hay). */
export async function getTalksTimeline(): Promise<{ talks: TalkItem[]; nextSlug: string | null }> {
  const talks = await getAllTalks();
  const next = talks.find((t) => t.startsAt && isUpcoming(t.startsAt, t.endsAt));
  return { talks, nextSlug: next?.slug ?? null };
}
