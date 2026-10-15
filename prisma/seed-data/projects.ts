export const AREAS = ["Robótica", "Software", "Inteligencia Artificial"];
export type Area = (typeof AREAS)[number];

/** Gama monocromática de bordós para los papeles de proyectos (de oscuro a claro). */
export const PAPER_SHADES = ["#5d072b", "#740936", "#8c0a41", "#a40c4c", "#bc0e57", "#d40f62"];

/** Cómo está pegado el papel al corcho. */
export type Fastener = "tape" | "pin-white" | "pin-pink";

export type ProjectStatus = "EN DESARROLLO" | "BUSCANDO EQUIPO" | "FASE DE PRUEBAS";
export type MilestoneState = "done" | "wip" | "todo";

export type SeedProject = {
  id: string;
  title: string;
  line: string;
  desc: string;
  areas: Area[];
  status: ProjectStatus;
  /** Tono del papel: índice en PAPER_SHADES, o "paper" para un papel blanco. */
  shade: number | "paper";
  fastener: Fastener;
  /** Posición en el corcho (% del área útil) y rotación en grados. */
  x: number;
  y: number;
  rot: number;
  /** Portada del detalle: una imagen o una ilustración hecha en CSS, con un efecto opcional encima. */
  cover: { src?: string; kind: "photo" | "sticker" | "art"; fx?: "lidar" | "detect" | "grid" | "chat" | "hockey" };
  roles: string[];
  tech: string[];
  reqs: string[];
  links: { label: string; kind: string; href: string }[];
  // Lo que sigue es opcional: las secciones vacías no se muestran.
  members?: { name: string; lead?: boolean }[];
  milestones?: { label: string; state: MilestoneState }[];
  notes?: { who: string; text: string }[];
};

/** Papeles de relleno: proyectos que todavía se están armando y la invitación a proponer uno. */
export type SeedTeaser = {
  id: string;
  kind: "wip" | "idea";
  title: string;
  line: string;
  x: number;
  y: number;
  rot: number;
  fastener?: Fastener;
};

export const projects: SeedProject[] = [
  {
    id: "llm",
    title: "LLM + ROSMaster",
    line: "Conectar un modelo de lenguaje al robot para darle órdenes en lenguaje natural.",
    desc: "Queremos poder hablarle al ROSMaster X3 como a una persona: que un modelo de lenguaje interprete el pedido, lo traduzca a acciones de ROS 2 y el robot las ejecute.",
    areas: ["Inteligencia Artificial", "Robótica", "Software"],
    status: "EN DESARROLLO",
    shade: 3,
    fastener: "tape",
    x: 9,
    y: 10,
    rot: -2.6,
    cover: { src: "/stickers/sticker3.png", kind: "sticker", fx: "chat" },
    roles: ["Python", "ROS 2", "LLMs / prompting"],
    tech: ["ROS 2", "Python", "LLMs", "ROSMaster X3"],
    reqs: ["Python básico", "Curiosidad por los modelos de lenguaje", "Ganas de probar cosas en el robot real"],
    links: [{ label: "yahboom_rosmaster", kind: "GitHub", href: "https://github.com/AIRclub-UdeSA/yahboom_rosmaster" }],
  },
  {
    id: "hockey",
    title: "Air Hockey",
    line: "Mesa de tejo de aire robótica para control óptimo y aprendizaje por refuerzo.",
    desc: "Una plataforma open source, educativa y de investigación, para control óptimo, reinforcement learning e imitation learning. Los algoritmos se desarrollan en un simulador con un motor físico custom de alta fidelidad y se prueban en una mesa robótica real, una versión mejorada de un proyecto open source de JJRobots.",
    areas: ["Robótica", "Inteligencia Artificial"],
    status: "EN DESARROLLO",
    shade: 5,
    fastener: "pin-white",
    x: 44,
    y: 1,
    rot: 1.8,
    cover: { kind: "art", fx: "hockey" },
    roles: ["Control", "Reinforcement learning", "Simulación"],
    tech: ["Control óptimo", "Reinforcement learning", "Imitation learning", "Simulador custom", "JJRobots"],
    reqs: ["Algo de programación", "Interés en control o aprendizaje automático", "Venir al lab a probar en la mesa"],
    links: [],
  },
  {
    id: "robotis",
    title: "Robotis",
    line: "Aprender robótica de forma autodidacta con plataformas open source.",
    desc: "Un espacio para aprender robótica por cuenta propia, en grupo, usando las plataformas y el material open source de ROBOTIS. Ideal para arrancar desde cero.",
    areas: ["Robótica"],
    status: "BUSCANDO EQUIPO",
    shade: "paper",
    fastener: "tape",
    x: 27,
    y: 35,
    rot: 2.2,
    cover: { src: "/stickers/sticker2.png", kind: "sticker" },
    roles: ["Ganas de aprender", "Electrónica", "Programación"],
    tech: ["ROBOTIS", "Open source", "ROS 2"],
    reqs: [
      "No hace falta experiencia previa",
      "Constancia para avanzar por tu cuenta",
      "Compartir lo que aprendés con el grupo",
    ],
    links: [],
  },
  {
    id: "juego",
    title: "Un jueguito para la web",
    line: "Software extra: un minijuego para la página del club.",
    desc: "Un proyecto de software más liviano y divertido: diseñar y programar un minijuego que viva en la página del club. Buen lugar para meterse con desarrollo web e interacción.",
    areas: ["Software"],
    status: "BUSCANDO EQUIPO",
    shade: 4,
    fastener: "pin-pink",
    x: 61,
    y: 30,
    rot: -2.4,
    cover: { src: "/stickers/sticker4.png", kind: "sticker" },
    roles: ["JavaScript / TypeScript", "Diseño de juegos", "Pixel art"],
    tech: ["Next.js", "React", "TypeScript", "Canvas"],
    reqs: ["Algo de JavaScript", "Ideas para el juego", "Trabajo mayormente remoto"],
    links: [{ label: "AIRclub-UdeSA", kind: "GitHub", href: "https://github.com/AIRclub-UdeSA" }],
  },
];

export const teasers: SeedTeaser[] = [
  {
    id: "wip-1",
    kind: "wip",
    title: "Algo se está cocinando",
    line: "Proyecto en proceso. Pronto más info.",
    x: 6,
    y: 62,
    rot: -3.2,
    fastener: "pin-pink",
  },
  {
    id: "wip-2",
    kind: "wip",
    title: "Top secret",
    line: "Proyecto en proceso. Pronto más info.",
    x: 46,
    y: 63,
    rot: 2.6,
    fastener: "tape",
  },
  {
    id: "idea",
    kind: "idea",
    title: "¿Tu proyecto acá?",
    line: "Traé tu idea al club y la armamos juntos.",
    x: 78,
    y: 57,
    rot: 3.4,
  },
];

/** Stickers decorativos del corcho; se pueden arrastrar. Posición en %, tamaño relativo a un papel. */
export type BoardSticker = {
  id: string;
  src: string;
  alt: string;
  x: number;
  y: number;
  /** Ancho relativo a un papel. */
  size: number;
  rot: number;
};

export const boardStickers: BoardSticker[] = [
  { id: "logo", src: "/stickers/sticker1.png", alt: "Logo AIR", x: 80, y: 3, size: 0.62, rot: -6 },
  { id: "tools", src: "/stickers/sticker5.png", alt: "Herramientas", x: 33, y: 6, size: 0.5, rot: -8 },
  { id: "arm", src: "/stickers/sticker2.png", alt: "Brazo robótico", x: 3, y: 38, size: 0.42, rot: 12 },
  { id: "atom", src: "/stickers/sticker6.png", alt: "Átomo", x: 85, y: 33, size: 0.44, rot: 14 },
  { id: "pc", src: "/stickers/sticker4.png", alt: "Computadora", x: 66, y: 72, size: 0.5, rot: 4 },
  { id: "robot", src: "/stickers/sticker3.png", alt: "ROSMaster X3", x: 28, y: 72, size: 0.5, rot: -3 },
] as const;
