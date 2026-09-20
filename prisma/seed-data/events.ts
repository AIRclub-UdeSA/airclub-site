export type SeedEvent = {
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  location?: string;
  startsAt: Date;
  endsAt?: Date;
  externalUrl?: string;
  rsvpEnabled: boolean;
  capacity?: number;
  featuredForCountdown: boolean;
  imageUrl?: string;
};

export const events: SeedEvent[] = [
  {
    slug: "primer-encuentro",
    title: "1er encuentro del club",
    description:
      "Vení a conocer el club, la propuesta y hacia dónde vamos. Invitado especial: Tadeo Casiraghi, profesor de la carrera e investigador del LINAR, que nos va a contar sobre su tesis doctoral enfocada en prótesis para humanos.",
    location: "Aula M112",
    startsAt: new Date("2026-09-03T14:40:00-03:00"),
    externalUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSc5_7uycnrBCQNjeoTHO4uiQCJvujc5n1Kbbc0VdVOdL1yQWQ/viewform?usp=header",
    rsvpEnabled: false,
    featuredForCountdown: false,
  },
  {
    slug: "jar-2026",
    title: "Challenge JAR 2026, Rosario",
    tagline: "Jornadas Argentinas de Robótica",
    description: "El AIR Club UdeSA organiza un challenge interuniversitario de robótica móvil autónoma.",
    location: "Rosario",
    startsAt: new Date("2026-11-03T09:00:00-03:00"),
    endsAt: new Date("2026-11-06T18:00:00-03:00"),
    externalUrl: "https://airclub-udesa.github.io/jar_site/",
    rsvpEnabled: false,
    featuredForCountdown: true,
  },
  {
    slug: "taller-ros2-gazebo",
    title: "Workshop: Simulación con ROS 2 y Gazebo",
    tagline: "Hands-on Workshop",
    description:
      "Aprender metiendo mano en entornos de simulación física, control de robots móviles por topics e integración de sensores LIDAR.",
    location: "Laboratorio M112",
    startsAt: new Date("2026-10-08T16:00:00-03:00"),
    endsAt: new Date("2026-10-08T18:30:00-03:00"),
    rsvpEnabled: false,
    featuredForCountdown: false,
  },
  {
    slug: "air-talks-02",
    title: "AIR Talks #2: Navegación Autónoma y Percepción",
    tagline: "Charla abierta & demo",
    description:
      "Discusión técnica con tesistas e investigadores invitados sobre algoritmos de SLAM y percepción visual en robots móviles reales.",
    location: "Aula Magna",
    startsAt: new Date("2026-10-22T17:00:00-03:00"),
    endsAt: new Date("2026-10-22T18:30:00-03:00"),
    rsvpEnabled: false,
    featuredForCountdown: false,
  },
];
