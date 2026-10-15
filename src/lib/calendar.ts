import { getAllTalks, type TalkItem } from "./talks";
import { getUpcomingEvents, getPastEvents, type EventItem } from "./events";
import { isUpcoming } from "./dates";
import { getWorkshopTracks, workshopHref, type InPersonWorkshop, type PastWorkshop } from "./workshops";
import type { CalendarActivity, CalendarActivityStatus } from "./calendar-types";

export * from "./calendar-types";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function formatDateLabel(start: Date, end?: Date): string {
  const day = new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, day: "numeric" }).format(start);
  const month = new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, month: "long" }).format(start);
  const year = new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, year: "numeric" }).format(start);
  
  if (end) {
    const startKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(start);
    const endKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(end);
    if (startKey !== endKey) {
      const endDay = new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, day: "numeric" }).format(end);
      const endMonth = new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, month: "long" }).format(end);
      if (month === endMonth) {
        return `${day} al ${endDay} de ${month} de ${year}`;
      }
      return `${day} de ${month} al ${endDay} de ${endMonth} de ${year}`;
    }
  }

  return `${day} de ${month} de ${year}`;
}

function calculateStatus(startsAt?: Date, endsAt?: Date, now = new Date()): CalendarActivityStatus {
  if (!startsAt) return "upcoming";

  const startDay = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(startsAt);
  const todayDay = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);

  if (startDay === todayDay) return "today";
  if (isUpcoming(startsAt, endsAt)) return "upcoming";
  return "past";
}

function fromTalk(talk: TalkItem, now: Date): CalendarActivity {
  const startsAt = talk.startsAt;
  const endsAt = talk.endsAt;
  const status = calculateStatus(startsAt, endsAt, now);
  const isUp = startsAt ? isUpcoming(startsAt, endsAt) : true;

  let timeLabel: string | undefined;
  if (startsAt) {
    const startStr = formatTime(startsAt);
    timeLabel = endsAt ? `${startStr} - ${formatTime(endsAt)} hs` : `${startStr} hs`;
  }

  return {
    id: `talk-${talk.slug}`,
    slug: talk.slug,
    title: talk.title,
    subtitle: talk.subtitle || "AIR Talk",
    category: "talk",
    status,
    startsAt: startsAt?.toISOString(),
    endsAt: endsAt?.toISOString(),
    dateLabel: talk.dateLabel || (startsAt ? formatDateLabel(startsAt, endsAt) : "A confirmar"),
    timeLabel,
    location: talk.location || "Campus Victoria, UdeSA",
    description: talk.abstract,
    abstract: talk.abstract,
    // Con inscripción propia, el link abre directo el diálogo de esa charla en /talks.
    externalUrl:
      talk.cta?.url || (isUp && talk.registrationOpen ? `/talks?inscribir=${encodeURIComponent(talk.slug)}` : `/talks`),
    ctaLabel: isUp
      ? talk.cta?.label || (talk.registrationOpen ? talk.registrationLabel || "Inscribirme" : "Confirmar asistencia")
      : "Ver detalles",
    cta: talk.cta,
    talkSlug: talk.slug,
    instructorOrSpeaker: talk.speaker ? `${talk.speaker.name} (${talk.speaker.role})` : undefined,
    speaker: talk.speaker,
    speakers: talk.speakers || (talk.speaker ? [talk.speaker] : undefined),
    topic: talk.topic,
    confirmed: talk.confirmed,
    media: talk.media,
    slides: talk.slides,
    links: talk.links,
    recordingUrl: talk.recordingUrl,
    isUpcoming: isUp,
  };
}

function fromEvent(event: EventItem, now: Date): CalendarActivity {
  const startsAt = event.startsAt;
  const endsAt = event.endsAt;
  const status = calculateStatus(startsAt, endsAt, now);
  const isUp = isUpcoming(startsAt, endsAt);

  let timeLabel: string | undefined;
  if (startsAt) {
    const startStr = formatTime(startsAt);
    timeLabel = endsAt ? `${startStr} - ${formatTime(endsAt)} hs` : `${startStr} hs`;
  }

  const speaker = event.instructor
    ? {
        name: event.instructor,
        role:
          event.category === "workshop"
            ? "Instructor de Taller"
            : event.category === "competition"
            ? "Líder de Competencia"
            : "Organizador",
        affiliation: "AIR Club UdeSA",
      }
    : undefined;

  const media = event.imageUrl
    ? [{ type: "image" as const, src: event.imageUrl }]
    : [];

  return {
    id: `event-${event.slug}`,
    slug: event.slug,
    title: event.title,
    subtitle: event.tagline,
    category: event.category || "meetup",
    status,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt?.toISOString(),
    dateLabel: event.dateLabel || formatDateLabel(startsAt, endsAt),
    timeLabel,
    location: event.location || "Campus Victoria, UdeSA",
    description: event.description,
    abstract: event.description,
    externalUrl: event.externalUrl,
    ctaLabel: event.ctaLabel || (isUp ? "Inscribirme" : "Ver detalles"),
    cta: event.externalUrl ? { label: event.ctaLabel || (isUp ? "Inscribirme" : "Ver detalles"), url: event.externalUrl } : undefined,
    instructorOrSpeaker: event.instructor,
    speaker,
    speakers: event.speakers || (speaker ? [speaker] : undefined),
    topic: event.tagline,
    confirmed: true,
    media,
    prerequisites: event.prerequisites,
    capacity: event.capacity,
    isUpcoming: isUp,
  };
}

/**
 * Un taller presencial del panel (#70). Los que vienen llevan a inscribirse en /workshops (o a su lista de próximos, si
 * no tienen inscripción abierta); los que ya pasaron, a su página. Los eventos de categoría "workshop" ya entran por
 * fromEvent: acá van solo los del panel.
 */
function fromWorkshop(w: { upcoming: InPersonWorkshop } | { past: PastWorkshop }, now: Date): CalendarActivity {
  const up = "upcoming" in w;
  const startsAt = up ? w.upcoming.startsAt : new Date(w.past.startsAt!);
  const endsAt = up ? w.upcoming.endsAt : w.past.endsAt ? new Date(w.past.endsAt) : undefined;
  const base = up ? w.upcoming : w.past;
  const description = up ? w.upcoming.description : (w.past.description ?? w.past.summary);

  const url = up
    ? w.upcoming.registration?.open
      ? `/workshops?inscribir=${encodeURIComponent(base.slug)}`
      : "/workshops#proximos"
    : workshopHref(w.past);
  const label = up && w.upcoming.registration?.open ? "Inscribirme" : "Ver taller";

  return {
    id: `workshop-${base.slug}`,
    slug: base.slug,
    title: base.title,
    subtitle: "Taller presencial",
    category: "workshop",
    status: calculateStatus(startsAt, endsAt, now),
    startsAt: startsAt.toISOString(),
    endsAt: endsAt?.toISOString(),
    dateLabel: base.dateLabel || formatDateLabel(startsAt, endsAt),
    // Cargado solo con el día (el panel lo guarda de 00:00 a 23:59): sin horario, no "00:00 - 23:59 hs".
    timeLabel:
      formatTime(startsAt) === "00:00" && (!endsAt || formatTime(endsAt) === "23:59")
        ? undefined
        : endsAt
          ? `${formatTime(startsAt)} - ${formatTime(endsAt)} hs`
          : `${formatTime(startsAt)} hs`,
    location: base.location || "Campus Victoria, UdeSA",
    description,
    abstract: description,
    externalUrl: url,
    ctaLabel: label,
    cta: { label, url },
    instructorOrSpeaker: base.instructor,
    confirmed: true,
    media: up ? [] : w.past.media,
    slides: up ? undefined : w.past.slides,
    links: up ? undefined : w.past.links,
    recordingUrl: up ? undefined : w.past.recordingUrl,
    capacity: base.capacity,
    isUpcoming: up,
  };
}

export async function getUnifiedCalendarActivities(): Promise<{
  activities: CalendarActivity[];
  nextActivity: CalendarActivity | null;
}> {
  const now = new Date();
  const [talks, upcomingEvents, pastEvents, tracks] = await Promise.all([
    getAllTalks(),
    getUpcomingEvents(),
    getPastEvents(),
    getWorkshopTracks(),
  ]);

  const allEvents = [...upcomingEvents, ...pastEvents];

  const mappedTalks = talks.map((t) => fromTalk(t, now));
  const mappedEvents = allEvents.map((e) => fromEvent(e, now));
  // Talleres del panel con fecha (#70): los que vienen y los que ya pasaron. Los eventos-taller ya están en mappedEvents.
  const mappedWorkshops = tracks.flatMap((t) => [
    ...t.upcoming.filter((w) => w.source === "panel").map((w) => fromWorkshop({ upcoming: w }, now)),
    ...t.past.filter((w) => w.source === "panel" && w.startsAt).map((w) => fromWorkshop({ past: w }, now)),
  ]);

  // Orden cronológico: eventos con fecha por startsAt asc; eventos sin fecha al final
  const all = [...mappedTalks, ...mappedEvents, ...mappedWorkshops].sort((a, b) => {
    const timeA = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  });

  // Próxima actividad más cercana (hoy o futuro)
  const nextActivity = all.find((a) => a.isUpcoming || a.status === "today") || null;

  return {
    activities: all,
    nextActivity,
  };
}
