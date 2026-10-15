// Contenido inicial de /workshops. La fuente de verdad es la base: los workshops, sus guías y sus talleres presenciales se
// editan desde /admin/workshops. Esto solo sirve para poblar una base vacía (`npm run db:seed`, que crea lo que falta y no
// pisa nada) y como respaldo cuando no hay base (el build de CI con credenciales de mentira), igual que las charlas.
//
// Las guías son las del Challenge JAR 2026: la guía completa de cada una vive en el sitio del JAR
// (https://airclub-udesa.github.io/jar_site/workshops/) y el código en el repo jar_workshops. Título, resumen, resultado,
// duración, nivel y prerequisitos salen del frontmatter de cada guía (src/content/docs/workshops/semana-NN-*.md en jar_site).

import type { TalkMedia, TalkSlide } from "./talks";

export type WorkshopLevel = "inicial" | "intermedio" | "avanzado";

/** Workshop (o línea): cada uno es una caja en /workshops y tiene su página, /workshops/<key>, con sus talleres adentro. */
export type SeedWorkshopTrack = {
  /** Va en la URL (/workshops/<key>): no cambiarlo una vez publicado. */
  key: string;
  title: string;
  /** Nota mono en la caja ("Challenge JAR 2026"). */
  label?: string;
  /** De qué se trata, en una o dos frases: va en la caja y arriba de su página. */
  summary: string;
  /** Guía de instalación que piden sus guías asincrónicas. */
  setupUrl?: string;
  /** Repositorio que se clona antes de la primera guía. */
  repoUrl?: string;
};

export const JAR_SITE_URL = "https://airclub-udesa.github.io/jar_site";
export const JAR_WORKSHOPS_REPO = "https://github.com/AIRclub-UdeSA/jar_workshops";

export const tracks: SeedWorkshopTrack[] = [
  {
    key: "linux",
    title: "Linux",
    summary: "Para trabajar con ROS 2 y con los robots del club hace falta Linux en la computadora: lo instalamos juntos.",
  },
  {
    key: "ros2",
    title: "ROS 2 y robótica",
    label: "Challenge JAR 2026",
    summary:
      "Un recorrido asincrónico para hacer a tu ritmo con el simulador, desde tu primer nodo de ROS 2 hasta navegar un laberinto con Nav2.",
    setupUrl: `${JAR_SITE_URL}/setup/`,
    repoUrl: JAR_WORKSHOPS_REPO,
  },
];

/**
 * Taller presencial que ya se hizo, con el mismo material que una charla de /talks. Los que vienen (con fecha y botón para
 * inscribirse) son eventos de categoría "workshop" en prisma/seed-data/events.ts.
 */
export type SeedPastWorkshop = {
  /** Con esto se guarda quién lo hizo: no cambiarlo una vez publicado. */
  slug: string;
  track: string;
  title: string;
  /** Corto: va en su tarjeta, adentro del workshop. */
  summary: string;
  /** Lo que se vio, en la pestaña Resumen de su página. Sin ella, la página muestra `summary`. */
  description?: string;
  startsAt?: Date;
  endsAt?: Date;
  dateLabel?: string;
  location?: string;
  instructor?: string;
  /** Grabación completa, si existe: siempre un link externo de YouTube. */
  recordingUrl?: string;
  /** Fotos y videos, en orden. La primera foto es la de su tarjeta. */
  media?: TalkMedia[];
  slides?: TalkSlide[];
  links?: { label: string; url: string }[];
};

export const pastWorkshops: SeedPastWorkshop[] = [
  {
    slug: "instalacion-linux",
    track: "linux",
    title: "Instalación de Linux",
    // Sigue el orden de las diapositivas del taller (las de `slides`), sin agregar nada que no esté en ellas.
    summary:
      "Qué es Linux y por qué Ubuntu, la instalación paso a paso y los primeros pasos con el sistema ya instalado.",
    description:
      "Conceptos básicos: qué es Linux (el núcleo del sistema, código abierto y software libre), qué es una distribución (Linux, herramientas e interfaz) y por qué elegimos Ubuntu: amigable para empezar, mucha documentación, comunidad grande, buena compatibilidad y versión LTS (Long Term Support), con actualizaciones durante varios años.\n\n" +
      "La instalación, del pendrive a una versión booteable de Ubuntu: preparar Windows (desactivar BitLocker y el inicio rápido), hacer espacio para Ubuntu reduciendo la unidad C: desde Administración de discos, entrar a la BIOS/UEFI al reiniciar (con F12, Esc, F2 o F10) y elegir el tipo de instalación: junto a Windows (dual boot), solo Ubuntu o manual.\n\n" +
      "Postinstalación: probar Wi-Fi, Bluetooth, pantalla, audio y webcam, y abrir el disco de Windows desde Ubuntu; moverse por la consola y entender los permisos; instalar software con APT y Snap; monitorear recursos y controladores; escribir un primer script en Bash; compilar y ejecutar un programa en C, y configurar VS Code.",
    // Sin hora: es el día del taller (17/09), como una charla cargada sin horario.
    startsAt: new Date("2026-09-17T00:00:00-03:00"),
    endsAt: new Date("2026-09-17T23:59:00-03:00"),
    media: [{ type: "image", src: "/workshops/linux/taller.jpg" }],
    slides: [
      {
        title: "Taller de instalación de Linux",
        // Link de solo lectura de Canva: `?embed` es la versión que se puede incrustar.
        embedUrl: "https://www.canva.com/design/DAHVaHDVqqY/ArxZp2QEAciibps9eynt7w/view?embed",
        openUrl: "https://www.canva.com/design/DAHVaHDVqqY/ArxZp2QEAciibps9eynt7w/view",
      },
    ],
  },
];

export type SeedAsyncWorkshop = {
  track: string;
  /** Número de semana, "01" a "09". Es el numeral grande de la página. */
  week: string;
  /** Carpeta en jar_workshops y ruta de la guía en jar_site ("semana-01-talkers-listeners"). */
  slug: string;
  title: string;
  /** De qué se trata (el `description` del frontmatter). */
  summary: string;
  /** Qué te llevás al terminar, sin el "Al terminar," del frontmatter. */
  outcome: string;
  /** Duración estimada en minutos (rango). */
  minutes: [number, number];
  level: WorkshopLevel;
  /** Paquete ROS 2 que se compila esa semana. */
  ros2Package?: string;
  /** Semanas que hay que tener hechas antes (además del setup del simulador, que vale para todas). */
  requires: string[];
  /** La guía completa. */
  guideUrl: string;
  /** Su código. */
  codeUrl?: string;
};

// Las guías del JAR: la guía está en jar_site y el código en jar_workshops, las dos en una carpeta con el slug.
const jarUrls = (slug: string) => ({
  guideUrl: `${JAR_SITE_URL}/workshops/${slug}/`,
  codeUrl: `${JAR_WORKSHOPS_REPO}/tree/main/${slug}`,
});

export const asyncWorkshops: SeedAsyncWorkshop[] = (
  [
  {
    track: "ros2",
    week: "01",
    summary: "Completá un talker y un listener para entender cómo se comunican dos nodos de ROS 2.",
    slug: "semana-01-talkers-listeners",
    title: "Talkers y listeners",
    outcome: "Vas a poder publicar y suscribirte a un topic completando el código vos mismo.",
    minutes: [60, 90],
    level: "inicial",
    ros2Package: "talkers_listeners",
    requires: [],
  },
  {
    track: "ros2",
    week: "02",
    summary: "Combiná avance y desplazamiento lateral para programar una trayectoria mecanum.",
    slug: "semana-02-zigzag-mecanum",
    title: "Zigzag mecanum",
    outcome: "Vas a tener una trayectoria que combina avance y movimiento lateral.",
    minutes: [60, 90],
    level: "intermedio",
    ros2Package: "zigzag_mecanum",
    requires: ["01"],
  },
  {
    track: "ros2",
    week: "03",
    summary: "Armá una máquina de estados de 2 estados para esquivar obstáculos con el lidar.",
    slug: "semana-03-evasion-obstaculos",
    title: "Evasión de obstáculos",
    outcome: "Vas a tener a Donatello avanzando y esquivando obstáculos con el lidar.",
    minutes: [90, 120],
    level: "intermedio",
    ros2Package: "evasion_obstaculos",
    requires: ["01", "02"],
  },
  {
    track: "ros2",
    week: "04",
    summary: "Detectá un cuadrado rojo con la cámara y proyectalo sobre el lidar para saber a qué distancia está.",
    slug: "semana-04-deteccion-color",
    title: "Detección de color",
    outcome: "Vas a saber a qué distancia y ángulo está un objeto rojo combinando cámara y lidar.",
    minutes: [120, 180],
    level: "avanzado",
    ros2Package: "deteccion_color",
    requires: ["03"],
  },
  {
    track: "ros2",
    week: "05",
    summary: "Dejá de abrir cuatro terminales a mano: armá un launch file y guardá tu configuración de RViz.",
    slug: "semana-05-launch-rviz",
    title: "Launch files y RViz",
    outcome: "Vas a levantar simulador, nodos y RViz con un solo comando.",
    minutes: [60, 90],
    level: "intermedio",
    ros2Package: "launch_rviz",
    requires: ["03", "04"],
  },
  {
    track: "ros2",
    week: "06",
    summary: "Armá tu primer paquete ROS 2 desde cero y corregí el drift de la odometría contra el mapa con un filtro de partículas.",
    slug: "semana-06-localizacion",
    title: "Localización",
    outcome: "Tu robot corrige su pose contra el mapa con un filtro de partículas propio.",
    minutes: [150, 180],
    level: "avanzado",
    ros2Package: "localizacion",
    requires: ["03", "04", "05"],
  },
  {
    track: "ros2",
    week: "07",
    summary: "Compará el /scan contra el mapa conocido y reportá la coordenada en map de lo que no debería estar ahí.",
    slug: "semana-07-obstaculos-no-mapeados",
    title: "Obstáculos fuera del mapa",
    outcome: "Tu robot detecta lo que el mapa no tiene registrado y publica la coordenada de cada objeto en map.",
    minutes: [90, 120],
    level: "avanzado",
    ros2Package: "obstaculos_no_mapeados",
    requires: ["04", "06"],
  },
  {
    track: "ros2",
    week: "08",
    summary: "Hacé que el robot recorra todo el mapa por su cuenta: cobertura por trazado de rayos y planificación de caminos con A*.",
    slug: "semana-08-cobertura-mapa",
    title: "Cobertura del mapa",
    outcome: "Tu robot explora todo el mapa por su cuenta, planificando caminos con A* sobre un costmap inflado.",
    minutes: [180, 240],
    level: "avanzado",
    ros2Package: "cobertura_mapa",
    requires: ["06"],
  },
  {
    track: "ros2",
    week: "09",
    summary: "Reemplazá, checkpoint por checkpoint, cada módulo manual de las semanas anteriores por el stack real de navegación de ROS 2.",
    slug: "semana-09-nav2",
    title: "Nav2",
    outcome: "Corrés el stack real de Nav2 sobre el mismo laberinto y ves qué gana y qué pierde cada módulo manual.",
    minutes: [90, 120],
    level: "avanzado",
    ros2Package: "nav2_bringup",
    requires: ["06"],
  },
  {
    track: "ros2",
    week: "10",
    summary:
      "Corré tus nodos de las semanas 04, 06 y 07 contra un bag grabado con el robot real, descubrí qué deja de funcionar y ubicá en el mapa el centro de cada caja roja.",
    slug: "semana-10-sim-a-real",
    title: "Del simulador al robot real",
    outcome:
      "Tu launch localiza al robot real sobre el mapa de la arena vacía con la odometría corregida, junta las detecciones de rojo en una posición por caja y saca 200 de 200 en el evaluador.",
    minutes: [180, 240],
    level: "avanzado",
    // Esta semana compila dos paquetes (README de jar_workshops); colcon acepta los dos en --packages-select.
    ros2Package: "mapa_laberinto evaluador_victimas",
    requires: ["04", "05", "06", "07"],
  },
] satisfies Omit<SeedAsyncWorkshop, "guideUrl" | "codeUrl">[]
).map((w) => ({ ...w, ...jarUrls(w.slug) }));
