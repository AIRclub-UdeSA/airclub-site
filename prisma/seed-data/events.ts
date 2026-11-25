export type EventCategory = "workshop" | "competition" | "meetup" | "talk";

// Igual que RegistrationType de src/lib/event-registration.ts (se repite para que el seed no importe de src/).
type SeedRegistrationType = "NONE" | "EXTERNAL_LINK" | "INDIVIDUAL" | "TEAM";

/**
 * Eventos de respaldo. La verdad vive en la base y se edita desde /admin/eventos: este array solo lo usa
 * src/lib/events.ts cuando no hay conexión a la base (ej.: el build del CI con credenciales falsas) y `db:seed`
 * lo carga si el evento no existe todavía, sin pisar nada ya editado.
 */
export type SeedEvent = {
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  category: EventCategory;
  location?: string;
  startsAt: Date;
  endsAt?: Date;
  dateLabel?: string;
  externalUrl?: string;
  ctaLabel?: string;
  registrationType: SeedRegistrationType;
  capacity?: number;
  featuredForCountdown: boolean;
  imageUrl?: string;
  instructor?: string;
  prerequisites?: string;
  /** Solo para `category: "workshop"`: la `key` del workshop de /workshops en el que va cuando ya pasó. */
  track?: string;
};

export const events: SeedEvent[] = [
  {
    slug: "jar-2026",
    title: "Challenge JAR 2026, Rosario",
    tagline: "Jornadas Argentinas de Robótica",
    category: "competition",
    description:
      "El AIR Club UdeSA organiza un challenge interuniversitario de robótica móvil autónoma con robots ROSMASTER X3 en pista física de competencia.",
    location: "Rosario, Santa Fe",
    startsAt: new Date("2026-11-03T09:00:00-03:00"),
    endsAt: new Date("2026-11-06T18:00:00-03:00"),
    dateLabel: "3 al 6 de Noviembre de 2026",
    externalUrl: "https://airclub-udesa.github.io/jar_site/",
    ctaLabel: "Web Oficial Challenge JAR 2026",
    registrationType: "EXTERNAL_LINK",
    featuredForCountdown: true,
  },
];
