export type CalendarActivityCategory = "talk" | "workshop" | "competition" | "meetup";
export type CalendarActivityStatus = "past" | "today" | "upcoming";

export interface CalendarSpeaker {
  name: string;
  role: string;
  affiliation?: string;
  avatar?: string;
  linkedin?: string;
}

export type CalendarMedia =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster: string };

export interface CalendarSlide {
  title: string;
  embedUrl: string;
  openUrl: string;
}

export interface CalendarLink {
  label: string;
  url: string;
}

export interface CalendarActivity {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: CalendarActivityCategory;
  status: CalendarActivityStatus;
  startsAt?: string; // ISO
  endsAt?: string; // ISO
  /** Dura todo el día: sin horario (ver Event.allDay). */
  allDay?: boolean;
  dateLabel: string;
  timeLabel?: string;
  location?: string;
  description: string;
  abstract?: string;
  externalUrl?: string;
  ctaLabel?: string;
  cta?: { label: string; url: string };
  /** Solo charlas: inscripción propia en la página (#50), con el mismo botón y diálogo que /talks. Excluye `cta`. */
  registrationOpen?: boolean;
  registrationLabel?: string;
  talkSlug?: string;
  /** Solo eventos del panel (/admin/eventos): su inscripción propia es de este tipo (ver src/lib/event-registration.ts). */
  eventSlug?: string;
  registrationType?: "INDIVIDUAL" | "TEAM";
  /** Solo registrationType TEAM: integrantes mínimo y máximo, capitán incluido; sin definir = sin límite de ese lado. */
  teamMinSize?: number;
  teamMaxSize?: number;
  instructorOrSpeaker?: string;
  speaker?: CalendarSpeaker;
  speakers?: CalendarSpeaker[];
  topic?: string;
  prerequisites?: string;
  capacity?: number;
  isUpcoming: boolean;
  confirmed?: boolean;
  media?: CalendarMedia[];
  slides?: CalendarSlide[];
  links?: CalendarLink[];
  recordingUrl?: string;
}

export interface SchedulableActivity {
  title: string;
  slug?: string;
  startsAt?: string;
  endsAt?: string;
  /** Dura todo el día: va a la agenda como un evento de día entero. */
  allDay?: boolean;
  description?: string;
  abstract?: string;
  location?: string;
}

const AR_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

/** "20261212": el día de `d` en hora de Buenos Aires (más `plusDays`), como lo piden los eventos de día entero de las agendas. */
export function compactArDay(d: Date, plusDays = 0): string {
  const [y, m, day] = AR_DAY.format(d).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day + plusDays)).toISOString().slice(0, 10).replaceAll("-", "");
}

/** Un evento de día entero en una agenda: del primer día al siguiente al último (el fin no es inclusivo). */
function allDayRange(start: Date, last: Date | undefined): { from: string; to: string } {
  return { from: compactArDay(start), to: compactArDay(last ?? start, 1) };
}

/** Genera enlace web para agregar el evento a Google Calendar */
export function buildGoogleCalendarUrl(activity: SchedulableActivity): string {
  if (!activity.startsAt) return "#";

  const start = new Date(activity.startsAt);
  const end = activity.endsAt ? new Date(activity.endsAt) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatGCal = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  // Día entero: fechas sin hora, y el fin es el día siguiente al último (no inclusivo).
  const range = allDayRange(start, activity.endsAt ? end : undefined);
  const dates = activity.allDay ? `${range.from}/${range.to}` : `${formatGCal(start)}/${formatGCal(end)}`;

  const detailsText = activity.description || activity.abstract || "";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: activity.title,
    dates,
    details: `${detailsText}\n\nOrganiza: AIR Club UdeSA\nhttps://airclub.udesa.edu.ar`,
    location: activity.location || "Campus Victoria, Universidad de San Andrés",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldIcsLine(line: string, maxBytes = 75): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= maxBytes) return line;

  const chunks: string[] = [];
  let curStr = "";
  let curLen = 0;
  let isFirst = true;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    const maxAllowed = isFirst ? maxBytes : maxBytes - 1;

    if (curLen + charBytes > maxAllowed) {
      chunks.push(curStr);
      curStr = char;
      curLen = charBytes;
      isFirst = false;
    } else {
      curStr += char;
      curLen += charBytes;
    }
  }
  if (curStr) chunks.push(curStr);

  return chunks.join("\r\n ");
}

/** Genera un data URI con formato iCalendar (.ics) estándar compatible con RFC 5545 */
export function buildIcsDataUri(activity: SchedulableActivity): string {
  if (!activity.startsAt) return "";

  const start = new Date(activity.startsAt);
  const end = activity.endsAt ? new Date(activity.endsAt) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatIcs = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const range = allDayRange(start, activity.endsAt ? end : undefined);
  const detailsText = activity.description || activity.abstract || "";

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AIR Club UdeSA//Calendario//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:air-${activity.slug || "event"}-${start.getTime()}@airclub.udesa.edu.ar`,
    `DTSTAMP:${formatIcs(new Date())}`,
    ...(activity.allDay
      ? [`DTSTART;VALUE=DATE:${range.from}`, `DTEND;VALUE=DATE:${range.to}`]
      : [`DTSTART:${formatIcs(start)}`, `DTEND:${formatIcs(end)}`]),
    `SUMMARY:${escapeIcsText(activity.title)}`,
    `DESCRIPTION:${escapeIcsText(detailsText)}`,
    `LOCATION:${escapeIcsText(activity.location || "Campus Victoria, UdeSA")}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsLines.map((line) => foldIcsLine(line)).join("\r\n"))}`;
}
