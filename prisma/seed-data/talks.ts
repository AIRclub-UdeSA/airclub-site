import { CONTACT_EMAIL } from "./contact";

export type TalkMedia = { type: "image"; src: string } | { type: "video"; src: string; poster: string };

export type TalkSlide = {
  title: string;
  embedUrl: string;
  openUrl: string;
};

export type TalkSpeaker = {
  name: string;
  role: string;
  affiliation?: string;
  avatar?: string;
  linkedin?: string;
};

export type SeedTalk = {
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  speaker?: TalkSpeaker;
  /**
   * Ordena la línea de tiempo y define si la charla es pasada o próxima.
   * Sin `startsAt` la tarjeta queda siempre al final, sin importar las fechas.
   */
  startsAt?: Date;
  /** Fin de un rango (ej.: la semana completa); la charla sigue "próxima" hasta que termine. */
  endsAt?: Date;
  /** Reemplaza a la fecha exacta cuando aún no hay día confirmado (ej.: "Semana del 12 al 16 de octubre"). */
  dateLabel?: string;
  /** Ubicación o sala donde se realizó o realizará la charla. */
  location?: string;
  /** Frase o cita temática destacada de la charla. */
  topic?: string;
  /** Grabación completa, opcional: siempre un link externo de YouTube, nunca Storage. */
  recordingUrl?: string;
  /** true = título/orador/resumen ya están definidos, no son placeholder de "a confirmar". */
  confirmed?: boolean;
  /** Fotos y videos, en orden de aparición. El primero es la portada de la tarjeta. */
  media: TalkMedia[];
  /** Diapositivas interactivas para visualizar directamente en la ventana flotante. */
  slides?: TalkSlide[];
  links?: { label: string; url: string }[];
  /** Botón principal (ej.: anotarse o proponer una charla). */
  cta?: { label: string; url: string };
};

export const talks: SeedTalk[] = [
  {
    slug: "primer-encuentro-air-club",
    title: "Presentación del club y Tadeo Casiraghi",
    subtitle: "Primer AIR Talk",
    confirmed: true,
    location: "Aula Magna · Campus Victoria, UdeSA",
    topic: "Cómo reemplazar un tobillo: entrando al mundo de las prótesis motorizadas",
    speaker: {
      name: "Tadeo Casiraghi",
      role: "Investigador LINAR y Docente UdeSA",
      affiliation: "Laboratorio de Inteligencia Artificial y Robótica (LINAR)",
      avatar: "/talks/primer-encuentro/tadeo-portrait.png",
      linkedin: "https://www.linkedin.com/in/tadeo-casiraghi/",
    },
    abstract:
      'Primer encuentro abierto del club. Contamos cómo nació AIR Club, hacia dónde vamos, los beneficios de sumarse, las AIR Talks y el Challenge JAR 2026. Además, Tadeo Casiraghi nos contó sobre su tesis doctoral, que está realizando en el LINAR: "Cómo reemplazar un tobillo: entrando al mundo de las prótesis motorizadas".',
    startsAt: new Date("2026-09-03T14:40:00-03:00"),
    dateLabel: "3 de Septiembre de 2026",
    media: [
      { type: "image", src: "/talks/primer-encuentro/presentacion.jpg" },
      {
        type: "video",
        src: "/talks/primer-encuentro/video-presentacion.mp4",
        poster: "/talks/primer-encuentro/poster-presentacion.jpg",
      },
      { type: "image", src: "/talks/primer-encuentro/tadeo.jpg" },
      {
        type: "video",
        src: "/talks/primer-encuentro/video-tadeo.mp4",
        poster: "/talks/primer-encuentro/poster-tadeo.jpg",
      },
      { type: "image", src: "/talks/primer-encuentro/final.jpg" },
    ],
    slides: [
      {
        title: "Presentación de AIR Club",
        embedUrl:
          "https://docs.google.com/presentation/d/1Syo5FU7iVK24ydYnyWQvaRk0Qdk5f-zitcf3m7jfdJE/embed?start=false&loop=false&delayms=3000",
        openUrl:
          "https://docs.google.com/presentation/d/1Syo5FU7iVK24ydYnyWQvaRk0Qdk5f-zitcf3m7jfdJE/edit?slide=id.p2#slide=id.p2",
      },
      {
        title: "Cómo reemplazar un tobillo (Tadeo Casiraghi)",
        embedUrl:
          "https://docs.google.com/presentation/d/1HWIki3VXMi0qbJxlIPEmfoeptJl_mYO3ItqrH30lV9o/embed?start=false&loop=false&delayms=3000",
        openUrl:
          "https://docs.google.com/presentation/d/1HWIki3VXMi0qbJxlIPEmfoeptJl_mYO3ItqrH30lV9o/edit?slide=id.p#slide=id.p",
      },
    ],
    links: [
      {
        label: "Presentación del club",
        url: "https://docs.google.com/presentation/d/1Syo5FU7iVK24ydYnyWQvaRk0Qdk5f-zitcf3m7jfdJE/edit?slide=id.p2#slide=id.p2",
      },
      {
        label: "Slides de Tadeo",
        url: "https://docs.google.com/presentation/d/1HWIki3VXMi0qbJxlIPEmfoeptJl_mYO3ItqrH30lV9o/edit?slide=id.p#slide=id.p",
      },
      { label: "LinkedIn de Tadeo", url: "https://www.linkedin.com/in/tadeo-casiraghi/" },
    ],
  },
  {
    slug: "segundo-air-talk",
    title: "Charla a confirmar",
    subtitle: "Segundo AIR Talk",
    abstract:
      "Estamos coordinando el tema y el orador invitado de este segundo encuentro. Próximamente habilitaremos el registro y la reserva de lugar.",
    startsAt: new Date("2026-10-12T00:00:00-03:00"),
    endsAt: new Date("2026-10-16T23:59:59-03:00"),
    dateLabel: "Semana del 12 al 16 de octubre",
    media: [],
    cta: {
      label: "Reservar lugar (Próximamente)",
      url: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Consulta RSVP - Segundo AIR Talk")}`,
    },
  },
  {
    slug: "tercer-air-talk",
    title: "Charla a confirmar",
    subtitle: "Tercer AIR Talk",
    abstract:
      "Estamos coordinando el tema y el invitado de esta charla. Lo vamos a anunciar por acá y en nuestras redes.",
    startsAt: new Date("2026-10-29T00:00:00-03:00"),
    endsAt: new Date("2026-10-29T23:59:59-03:00"),
    dateLabel: "29 de Octubre de 2026",
    media: [],
  },
];
