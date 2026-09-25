export const CONTACT_EMAIL = "airclub@udesa.edu.ar";

export const COMMUNITY_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeJj7cS6SaCPaBr4a6dfJzeFF9W6BRWYxfLe0BEcGepSIvJBw/viewform";

export type SeedContactChannel = {
  key: "email" | "instagram" | "whatsapp";
  label: string;
  /** Lo que se muestra como texto del enlace. */
  value: string;
  /** mailto: o URL absoluta. */
  href: string;
  external?: boolean;
  note: string;
};

export type SeedContactReason = {
  key: "comunidad" | "equipo" | "charla" | "workshop" | "sponsors" | "consultas";
  title: string;
  desc: string;
  /** Texto del botón; el destino sale de `url` o, si no hay, del mail del club con `subject` y `body`. */
  action: string;
  url?: string;
  subject?: string;
  body?: string[];
};

export const channels: SeedContactChannel[] = [
  {
    key: "email",
    label: "Mail",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    note: "Para consultas generales, propuestas y sponsors.",
  },
  {
    key: "instagram",
    label: "Instagram",
    value: "@AIRClub_UdeSA",
    href: "https://www.instagram.com/AIRClub_UdeSA",
    external: true,
    note: "Novedades del día a día, fotos y anuncios.",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: "Comunidad WhatsApp",
    href: "https://chat.whatsapp.com/Dz7CNt3Zdt25u4hqPd2fLK?s=cl&p=i&mlu=4",
    external: true,
    note: "El grupo para el día a día del club y coordinar rápido.",
  },
];

export const reasons: SeedContactReason[] = [
  {
    key: "comunidad",
    title: "Sumarme a la comunidad",
    desc: "Sin requisitos ni experiencia previa. Te llegan las novedades, charlas, cursos y workshops.",
    action: "Completar el formulario",
    url: COMMUNITY_FORM_URL,
  },
  {
    key: "equipo",
    title: "Sumarme al equipo principal",
    desc: "El grupo que desarrolla los proyectos y organiza los eventos. Primero sumate a la comunidad y contanos qué te gustaría hacer.",
    action: "Escribinos",
    subject: "Quiero sumarme al equipo principal",
    body: ["Hola AIR Club, ya soy parte de la comunidad y me gustaría sumarme al equipo principal. Esto es lo que me gustaría hacer:"],
  },
  {
    key: "charla",
    title: "Proponer una charla",
    desc: "Tesis, proyectos en desarrollo o casos de la industria, para las AIR Talks.",
    action: "Proponer una charla",
    subject: "Propuesta de AIR Talk",
    body: [
      "Hola AIR Club, me gustaría proponer una charla sobre:",
      "- Tema:",
      "- Breve abstract o link a borrador de slides:",
      "- Nombre y afiliación:",
    ],
  },
  {
    key: "workshop",
    title: "Proponer un workshop",
    desc: "Contanos qué te gustaría enseñar o aprender.",
    action: "Proponer un workshop",
    subject: "Propuesta de workshop",
    body: [
      "Hola AIR Club, me gustaría proponer un workshop sobre:",
      "- Tema:",
      "- Qué se arma o se aprende (2 líneas):",
      "- ¿Lo darías vos o querés que lo dé otra persona?:",
      "- Materiales o requisitos previos (si hay):",
      "- Nombre y afiliación:",
    ],
  },
  {
    key: "sponsors",
    title: "Sponsors y empresas",
    desc: "Sensores, placas de cómputo para competencias como el Challenge JAR 2026 y divulgación técnica abierta.",
    action: "Escribir al club",
    subject: "Sponsorship AIR Club UdeSA",
  },
  {
    key: "consultas",
    title: "Consultas y prensa",
    desc: "Cualquier otra duda sobre el club, sus proyectos o cómo trabajamos.",
    action: "Escribir al club",
    subject: "Consulta",
  },
];
