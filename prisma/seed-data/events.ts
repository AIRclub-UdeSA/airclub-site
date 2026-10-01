import type { TalkSpeaker } from "./talks";

export type EventCategory = "workshop" | "competition" | "meetup" | "talk";

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
  rsvpEnabled: boolean;
  capacity?: number;
  featuredForCountdown: boolean;
  imageUrl?: string;
  instructor?: string;
  speakers?: TalkSpeaker[];
  prerequisites?: string;
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
    rsvpEnabled: false,
    featuredForCountdown: true,
  },
];
