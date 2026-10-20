export const CONTACT_EMAIL = "airclub@udesa.edu.ar";

/** Formulario para proponer un proyecto o una idea ("Tengo una idea" de la landing). No es el de inscripción al JAR. */
export const PROJECT_PROPOSAL_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe-lew786UN7sTBu1ZOLYjrVAzwFXKTMiSTKS7wUhQFpNhHqQ/viewform";

/** Organización del club en GitHub. La usan el carrusel de la landing y los datos estructurados (`sameAs`). */
export const GITHUB_ORG_URL = "https://github.com/airclub-udesa";

/** Canal de YouTube del club (charlas, workshops y lo que vamos haciendo). Es un canal de `/contacto` y lo enlaza el cronograma de `/talks`. */
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@AIRClubSanAndr%C3%A9s";

export type SeedContactChannel = {
  key: "email" | "instagram" | "whatsapp" | "linkedin" | "youtube";
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
  /** Solo "account": cómo se entra, que CommunityJoinAction muestra únicamente al visitante (con sesión ya no aplica). */
  steps?: string;
  /** Texto del botón; el destino sale de `url` o, si no hay, del mail del club con `subject` y `body`. */
  action: string;
  /** "account": no va a un formulario ni a un mail, es entrar con Google y completar el perfil del sitio (CommunityJoinAction). */
  kind?: "account";
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
  {
    key: "linkedin",
    label: "LinkedIn",
    value: "AIR Club UdeSA",
    href: "https://www.linkedin.com/company/air-club-udesa/",
    external: true,
    note: "Actividad del club y contacto profesional.",
  },
  {
    key: "youtube",
    label: "YouTube",
    value: "@AIRClubSanAndrés",
    href: YOUTUBE_CHANNEL_URL,
    external: true,
    note: "Charlas, workshops y lo que vamos haciendo en video.",
  },
];

export const reasons: SeedContactReason[] = [
  {
    key: "comunidad",
    title: "Sumarme a la comunidad",
    desc: "Sin requisitos ni experiencia previa.",
    steps: "Entrás con Google, completás tu perfil y ya sos parte.",
    action: "Sumarme con Google",
    kind: "account",
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
