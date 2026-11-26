import { prisma } from "./prisma";
import { events as seedEvents, type SeedEvent } from "../../prisma/seed-data/events";
import { isUpcoming } from "@/lib/dates";
import type { Audience } from "@/lib/udesa";
import type { RegistrationType } from "@/lib/event-registration";

export type EventCategory = SeedEvent["category"];

export type EventItem = Omit<SeedEvent, "registrationType"> & {
  /** Cómo se inscribe la gente (ver src/lib/event-registration.ts). Sin definir = sin inscripción. */
  registrationType?: RegistrationType;
  /** Dura todo el día: no se muestra horario (ver Event.allDay en schema.prisma). */
  allDay?: boolean;
  /** INDIVIDUAL y TEAM: si se está inscribiendo ahora, desde el panel. */
  registrationOpen?: boolean;
  /** INDIVIDUAL y TEAM: pasada esta fecha ya no se inscribe ni se edita. Sin definir = hasta que el evento termina. */
  registrationDeadline?: Date;
  /** Quién puede inscribirse (INDIVIDUAL y TEAM). Sin definir = cualquiera. */
  audience?: Audience;
  /** TEAM: integrantes mínimos y máximos, capitán incluido. */
  teamMinSize?: number;
  teamMaxSize?: number;
  /** En desuso: lo reemplaza `registrationType`. Solo lo arma `toUpcoming` de src/lib/workshops.ts. */
  rsvpEnabled?: boolean;
};

type EventRow = Awaited<ReturnType<typeof fetchEventRows>>[number];

/** Los eventos publicados (o todos, para el panel). El borrador y el cancelado no se ven en el sitio. */
export function fetchEventRows({ includeDrafts = false } = {}) {
  return prisma.event.findMany({
    where: includeDrafts ? undefined : { status: "PUBLISHED" },
    orderBy: { startsAt: "asc" },
  });
}

export function toEventItem(row: EventRow): EventItem {
  return {
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? undefined,
    description: row.description,
    category: row.category.toLowerCase() as EventCategory,
    location: row.location ?? undefined,
    startsAt: row.startsAt,
    endsAt: row.endsAt ?? undefined,
    allDay: row.allDay,
    dateLabel: row.dateLabel ?? undefined,
    externalUrl: row.externalUrl ?? undefined,
    ctaLabel: row.ctaLabel ?? undefined,
    registrationType: row.registrationType,
    registrationOpen: row.registrationOpen,
    registrationDeadline: row.registrationDeadline ?? undefined,
    audience: row.audience,
    capacity: row.capacity ?? undefined,
    teamMinSize: row.teamMinSize ?? undefined,
    teamMaxSize: row.teamMaxSize ?? undefined,
    featuredForCountdown: row.featuredForCountdown,
    imageUrl: row.imageUrl ?? undefined,
    instructor: row.instructor ?? undefined,
    prerequisites: row.prerequisites ?? undefined,
    track: row.track ?? undefined,
  };
}

// Lee de Prisma con fallback al array de seed-data si no hay conexión a la base (ej.: build en CI con credenciales
// falsas), igual que las charlas (src/lib/talks.ts).
async function getAllEvents(): Promise<EventItem[]> {
  try {
    return (await fetchEventRows()).map(toEventItem);
  } catch (err) {
    console.error("[events] Falló la consulta a base de datos, usando fallback al seed:", err);
    return [...seedEvents];
  }
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

/** Un evento por slug sea cual sea su estado (borrador incluido), para la vista previa del panel. No usa el respaldo del seed. */
export async function getEventPreviewBySlug(slug: string): Promise<{ event: EventItem; status: EventRow["status"] } | undefined> {
  const row = await prisma.event.findUnique({ where: { slug } });
  return row ? { event: toEventItem(row), status: row.status } : undefined;
}

export async function getAllEventSlugs(): Promise<string[]> {
  const all = await getAllEvents();
  return all.map((e) => e.slug);
}
