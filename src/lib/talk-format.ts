import type { TalkMedia } from "@/lib/talks";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

const MONTHS_SHORT = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export type TalkDateParts = {
  /** "03" para un día, "12-16" para un rango. Es el numeral grande de la pieza gráfica. */
  day: string;
  /** "SEP" o "SEP-OCT" si el rango cruza de mes. */
  monthShort: string;
  /** "septiembre" (o "septiembre-octubre"). */
  monthLong: string;
  year: string;
  isRange: boolean;
};

function partsOf(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { day: get("day"), month: get("month") - 1, year: get("year") };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Descompone una fecha (o rango) en las piezas que usa el diseño. Siempre en hora de Buenos Aires. */
export function talkDateParts(startsAt?: string, endsAt?: string): TalkDateParts | null {
  if (!startsAt) return null;
  const start = partsOf(startsAt);
  const end = endsAt ? partsOf(endsAt) : null;
  const isRange = Boolean(end && (end.day !== start.day || end.month !== start.month));

  if (!isRange || !end) {
    return {
      day: pad(start.day),
      monthShort: MONTHS_SHORT[start.month],
      monthLong: MONTHS_LONG[start.month],
      year: String(start.year),
      isRange: false,
    };
  }

  const sameMonth = end.month === start.month;
  return {
    day: `${pad(start.day)}-${pad(end.day)}`,
    monthShort: sameMonth ? MONTHS_SHORT[start.month] : `${MONTHS_SHORT[start.month]}-${MONTHS_SHORT[end.month]}`,
    monthLong: sameMonth ? MONTHS_LONG[start.month] : `${MONTHS_LONG[start.month]}-${MONTHS_LONG[end.month]}`,
    year: String(end.year),
    isRange: true,
  };
}

/** "3 de septiembre de 2026", o el texto manual de la charla si lo hay ("Semana del 12 al 16 de octubre"). */
export function talkDateText(startsAt?: string, dateLabel?: string) {
  if (dateLabel) return dateLabel;
  if (!startsAt) return "Fecha a confirmar";
  const p = partsOf(startsAt);
  return `${p.day} de ${MONTHS_LONG[p.month]} de ${p.year}`;
}

/** "30 SEP", para el marcador HOY. */
export function shortDayLabel(iso: string) {
  const p = partsOf(iso);
  return `${pad(p.day)} ${MONTHS_SHORT[p.month]}`;
}

/** Foto de portada: la primera imagen, o el póster del primer video si no hay imágenes. */
export function talkCover(media: TalkMedia[]): string | null {
  const image = media.find((m) => m.type === "image");
  if (image) return image.src;
  const video = media.find((m) => m.type === "video" && m.poster);
  return video && video.type === "video" ? video.poster : null;
}
