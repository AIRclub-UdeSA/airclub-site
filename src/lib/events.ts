import { events as seedEvents, type SeedEvent } from "../../prisma/seed-data/events";
import { isUpcoming } from "@/lib/dates";

export type EventItem = SeedEvent;

// Fase 1: lee del array tipado en prisma/seed-data. En la Fase 2 esta funcion pasa a
// consultar Prisma, pero la firma no cambia — las paginas nunca llaman a la fuente
// de datos directamente.
async function getAllEvents(): Promise<EventItem[]> {
  return [...seedEvents];
}

export async function getUpcomingEvents(opts?: { take?: number }): Promise<EventItem[]> {
  const all = await getAllEvents();
  const upcoming = all
    .filter((e) => isUpcoming(e.startsAt, e.endsAt))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return opts?.take ? upcoming.slice(0, opts.take) : upcoming;
}

export async function getPastEvents(): Promise<EventItem[]> {
  const all = await getAllEvents();
  return all
    .filter((e) => !isUpcoming(e.startsAt, e.endsAt))
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
}

export async function getFeaturedCountdownEvent(): Promise<EventItem | undefined> {
  const upcoming = await getUpcomingEvents();
  return upcoming.find((e) => e.featuredForCountdown);
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  const all = await getAllEvents();
  return all.find((e) => e.slug === slug);
}

export async function getAllEventSlugs(): Promise<string[]> {
  const all = await getAllEvents();
  return all.map((e) => e.slug);
}
