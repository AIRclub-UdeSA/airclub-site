export type ProjectPin = {
  who: string;
  text: string;
};

export type ProjectLink = {
  label: string;
  kind: string;
  href: string;
};

export type SeedProject = {
  id: string;
  title: string;
  areas: string[];
  status: "EN DESARROLLO" | "BUSCANDO EQUIPO" | "FASE DE PRUEBAS";
  line: string;
  x: number;
  y: number;
  rot: number;
  tone: number;
  desc: string;
  roles: string[];
  links: ProjectLink[];
  reqs: string[];
  leads: string;
  pins: ProjectPin[];
};

export type BoardSticker = {
  src: string;
  x: number;
  y: number;
  width: string;
  rot: number;
};

export const projects: SeedProject[] = [
  {
    id: "nav",
    title: "Navegación autónoma X3",
    areas: ["Robótica", "Inteligencia Artificial"],
    status: "EN DESARROLLO",
    line: "SLAM y planificación de trayectorias sobre el ROSMaster X3.",
    x: 7,
    y: 10,
    rot: -2.6,
    tone: 0,
    desc: "El corazón del challenge: que el X3 arme su mapa, se ubique y llegue a un objetivo esquivando obstáculos, todo a bordo de la Raspberry Pi 5.",
    roles: ["ROS 2", "Nav2 / SLAM", "C++ o Python"],
    links: [
      { label: "yahboom_rosmaster", kind: "GitHub", href: "https://github.com/AIRclub-UdeSA/yahboom_rosmaster" },
      { label: "Notas de navegación", kind: "Wiki", href: "#" },
    ],
    reqs: ["Manejo básico de Linux y terminal", "Ganas de romper y arreglar cosas", "2 a 4 horas por semana"],
    leads: "Juan Kaplan · Lucio Luque Materazzi",
    pins: [
      { who: "Lucio", text: "Ya corre el mapeo en el lab, falta afinar el costmap." },
      { who: "Juan", text: "Necesitamos a alguien que se meta con Nav2 en serio." },
      { who: "Camila", text: "Dejé los rosbags de la última prueba en el Drive." },
    ],
  },
  {
    id: "pinza",
    title: "Pinza adaptativa",
    areas: ["Robótica"],
    status: "BUSCANDO EQUIPO",
    line: "Manipulador impreso en 3D para montar sobre el X3.",
    x: 26,
    y: 33,
    rot: 2.2,
    tone: 1,
    desc: "Un brazo simple de 3 grados de libertad con pinza de dos dedos, para que el robot pueda levantar objetos durante las pruebas del challenge.",
    roles: ["CAD / impresión 3D", "Servos y electrónica", "Cinemática"],
    links: [
      { label: "Piezas y STL", kind: "Drive", href: "#" },
      { label: "Bitácora de diseño", kind: "Wiki", href: "#" },
    ],
    reqs: ["Fusion 360, Onshape o similar", "No hace falta experiencia previa en robótica", "Venir al lab una vez por semana"],
    leads: "Teo Kaucher",
    pins: [
      { who: "Teo", text: "Subí el primer boceto del chasis de la pinza al Drive." },
      { who: "Francesca", text: "La impresora del lab quedó calibrada, se puede usar." },
    ],
  },
  {
    id: "vision",
    title: "Visión RGB‑D",
    areas: ["Inteligencia Artificial"],
    status: "BUSCANDO EQUIPO",
    line: "Detección de objetos con la cámara de profundidad.",
    x: 4,
    y: 52,
    rot: 1.6,
    tone: 2,
    desc: "Detectar y ubicar en 3D los objetos de la pista usando la cámara RGB-D. Modelo liviano, corriendo en tiempo real sobre la Pi.",
    roles: ["Python", "Visión por computadora", "PyTorch / ONNX"],
    links: [
      { label: "vision_pipeline", kind: "GitHub", href: "#" },
      { label: "Dataset etiquetado", kind: "Drive", href: "#" },
    ],
    reqs: ["Python intermedio", "Algo de redes neuronales (o ganas de aprender)", "Notebook propia"],
    leads: "Zoe Velazquez",
    pins: [
      { who: "Zoe", text: "Necesitamos a alguien que sepa Python para la parte de inferencia." },
      { who: "Juan", text: "Ojo con la latencia: tiene que correr a 10 fps mínimo." },
    ],
  },
  {
    id: "sim",
    title: "Gemelo digital",
    areas: ["Software", "Robótica"],
    status: "FASE DE PRUEBAS",
    line: "Simulador en Gazebo del X3 para los equipos de la JAR.",
    x: 42,
    y: 8,
    rot: -1.8,
    tone: 1,
    desc: "El entorno público donde los equipos del challenge desarrollan y prueban su código sin tener el robot físico delante. Es nuestra carta de presentación técnica.",
    roles: ["Gazebo / URDF", "Docker", "Documentación"],
    links: [
      { label: "jar_simulator", kind: "GitHub", href: "https://github.com/AIRclub-UdeSA/yahboom_rosmaster" },
      { label: "Guía de instalación", kind: "Docs", href: "https://airclub-udesa.github.io/jar_site/" },
    ],
    reqs: ["Linux y Docker", "ROS 2 Humble", "Paciencia con los archivos de configuración"],
    leads: "Lucio Luque Materazzi",
    pins: [
      { who: "Lucio", text: "La física de las ruedas mecanum ya quedó estable." },
      { who: "Tomas", text: "Falta escribir el README para los equipos externos." },
    ],
  },
  {
    id: "web",
    title: "Web del club",
    areas: ["Software"],
    status: "EN DESARROLLO",
    line: "Sitio público y este tablero interactivo.",
    x: 55,
    y: 31,
    rot: 2.8,
    tone: 0,
    desc: "La cara pública del AIR: el sitio, el tablero de proyectos y las páginas de cada evento. Front puro, sin framework pesado.",
    roles: ["HTML / CSS", "JavaScript", "Diseño de interacción"],
    links: [
      { label: "airclub-udesa.github.io", kind: "GitHub", href: "https://github.com/AIRclub-UdeSA" },
      { label: "Sitio del JAR 2026", kind: "Live", href: "https://airclub-udesa.github.io/jar_site/" },
    ],
    reqs: ["CSS con soltura", "Gusto por el detalle y la animación", "Trabajo mayormente remoto"],
    leads: "Tomas Diaz",
    pins: [
      { who: "Tomas", text: "El tablero ya tiene el modo foco andando." },
      { who: "Camila", text: "Faltan las fotos nuevas del equipo." },
    ],
  },
];

export const boardStickers: BoardSticker[] = [
  { src: "/stickers/sticker1.png", x: 78, y: 4, width: "11cqw", rot: -6 },
  { src: "/stickers/sticker2.png", x: 2, y: 32, width: "7cqw", rot: 10 },
  { src: "/stickers/sticker3.png", x: 22, y: 68, width: "10cqw", rot: -3 },
  { src: "/stickers/sticker4.png", x: 55, y: 56, width: "9cqw", rot: 5 },
  { src: "/stickers/sticker5.png", x: 32, y: 12, width: "8cqw", rot: -10 },
  { src: "/stickers/sticker6.png", x: 74, y: 44, width: "7cqw", rot: 14 },
];
