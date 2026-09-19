export type TalkMedia = { type: "image"; src: string } | { type: "video"; src: string; poster: string };

export type SeedTalk = {
  slug: string;
  title: string;
  subtitle: string;
  /** Tercera línea: invitado/a y afiliación, o aclaración. */
  details: string;
  abstract: string;
  /**
   * Ordena la línea de tiempo y define si la charla es pasada o próxima.
   * Sin `startsAt` la tarjeta queda siempre al final, sin importar las fechas (ej.: Call for Speakers).
   */
  startsAt?: Date;
  /** Fin de un rango (ej.: la semana completa); la charla sigue "próxima" hasta que termine. */
  endsAt?: Date;
  /** Reemplaza a la fecha exacta cuando aún no hay día confirmado (ej.: "Semana del 12 al 16 de octubre"). */
  dateLabel?: string;
  /** Texto grande del placeholder cuando no hay fotos (ej.: "?"). */
  placeholder?: string;
  /** Fotos y videos, en orden de aparición. El primero es la portada de la tarjeta. */
  media: TalkMedia[];
  links?: { label: string; url: string }[];
  /** Botón principal (ej.: anotarse o proponer una charla). */
  cta?: { label: string; url: string };
};

export const talks: SeedTalk[] = [
  {
    slug: "primer-encuentro-air-club",
    title: "Presentación del club y Tadeo Casiraghi",
    subtitle: "Primer AIR Talk",
    details: "Tadeo Casiraghi, profesor de la carrera e investigador del LINAR, UdeSA",
    abstract:
      'Primer encuentro abierto del club. Contamos cómo nació AIR Club, hacia dónde vamos, los beneficios de sumarse, las AIR Talks y el Challenge JAR 2026. Además, Tadeo Casiraghi nos contó sobre su tesis doctoral, que está realizando en el LINAR: "Cómo reemplazar un tobillo: entrando al mundo de las prótesis motorizadas".',
    startsAt: new Date("2026-09-03T14:40:00-03:00"),
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
    details: "Tema e invitado a confirmar",
    abstract:
      "Estamos coordinando el tema y el invitado de esta charla. Lo vamos a anunciar por acá y en nuestras redes.",
    startsAt: new Date("2026-10-12T00:00:00-03:00"),
    endsAt: new Date("2026-10-16T23:59:59-03:00"),
    dateLabel: "Semana del 12 al 16 de octubre",
    placeholder: "?",
    media: [],
  },
  {
    slug: "tercer-air-talk",
    title: "Charla a confirmar",
    subtitle: "Tercer AIR Talk",
    details: "Tema e invitado a confirmar",
    abstract:
      "Estamos coordinando el tema y el invitado de esta charla. Lo vamos a anunciar por acá y en nuestras redes.",
    startsAt: new Date("2026-10-26T00:00:00-03:00"),
    endsAt: new Date("2026-10-30T23:59:59-03:00"),
    dateLabel: "Semana del 26 al 30 de octubre",
    placeholder: "?",
    media: [],
  },
  {
    slug: "call-for-speakers",
    title: "¿Querés dar una charla?",
    subtitle: "Call for Speakers",
    details: "Estudiantes, tesistas, investigadores y empresas",
    abstract:
      "Las AIR Talks son un espacio abierto. Si estás haciendo una tesis o un proyecto propio, investigás o trabajás en IA y robótica, te invitamos a contarlo. Escribinos con tu tema y un abstract de un par de líneas, o el link a un borrador de tus slides.",
    dateLabel: "Convocatoria abierta",
    placeholder: "+",
    media: [],
    // PROVISORIO: hoy propone por mail al club. Más adelante se reemplaza por un formulario propio
    // (nombre, contacto, tema y abstract de 2 líneas o link a un borrador de slides).
    cta: {
      label: "Proponer una talk",
      url: "mailto:airclub@udesa.edu.ar?subject=Propuesta de AIR Talk",
    },
  },
];
