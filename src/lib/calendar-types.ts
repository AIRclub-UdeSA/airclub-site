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
  dateLabel: string;
  timeLabel?: string;
  location?: string;
  description: string;
  abstract?: string;
  externalUrl?: string;
  ctaLabel?: string;
  cta?: { label: string; url: string };
  talkSlug?: string;
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
  description?: string;
  abstract?: string;
  location?: string;
}

/** Genera enlace web para agregar el evento a Google Calendar */
export function buildGoogleCalendarUrl(activity: SchedulableActivity): string {
  if (!activity.startsAt) return "#";

  const start = new Date(activity.startsAt);
  const end = activity.endsAt ? new Date(activity.endsAt) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatGCal = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const detailsText = activity.description || activity.abstract || "";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: activity.title,
    dates: `${formatGCal(start)}/${formatGCal(end)}`,
    details: `${detailsText}\n\nOrganiza: AIR Club UdeSA\nhttps://airclub.udesa.edu.ar`,
    location: activity.location || "Campus Victoria, Universidad de San Andrés",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Genera un data URI con formato iCalendar (.ics) estándar */
export function buildIcsDataUri(activity: SchedulableActivity): string {
  if (!activity.startsAt) return "";

  const start = new Date(activity.startsAt);
  const end = activity.endsAt ? new Date(activity.endsAt) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatIcs = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
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
    `DTSTART:${formatIcs(start)}`,
    `DTEND:${formatIcs(end)}`,
    `SUMMARY:${activity.title}`,
    `DESCRIPTION:${detailsText.replace(/\n/g, "\\n")}`,
    `LOCATION:${activity.location || "Campus Victoria, UdeSA"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsLines.join("\r\n"))}`;
}
