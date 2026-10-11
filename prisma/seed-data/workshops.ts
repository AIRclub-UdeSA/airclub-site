// Workshops asincrónicos del Challenge JAR 2026. La guía completa de cada uno vive en el sitio del JAR
// (https://airclub-udesa.github.io/jar_site/workshops/) y el código en el repo jar_workshops; acá solo va lo que
// necesita /workshops para presentarlos. Título, resultado, duración, nivel y prerequisitos salen del frontmatter de
// cada guía (src/content/docs/workshops/semana-NN-*.md en jar_site): si cambian allá, actualizarlos acá.

export type WorkshopLevel = "inicial" | "intermedio" | "avanzado";

/** Línea de workshops: agrupa los talleres por tema en /workshops. Para sumar una línea, agregarla a `tracks`. */
export type WorkshopTrackKey = "ros2" | "linux";

export type SeedWorkshopTrack = {
  key: WorkshopTrackKey;
  title: string;
  /** Nota mono a la derecha del título ("Challenge JAR 2026"). */
  label?: string;
  /** Qué se aprende en esta línea. Opcional: la de ROS 2 ya se presenta con la intro de su recorrido. */
  summary?: string;
};

export const tracks: SeedWorkshopTrack[] = [
  { key: "ros2", title: "ROS 2 y robótica", label: "Challenge JAR 2026" },
  {
    key: "linux",
    title: "Linux",
    summary: "Para trabajar con ROS 2 y con los robots del club hace falta Linux en la computadora: lo instalamos juntos.",
  },
];

/**
 * Taller presencial que ya se hizo y no está cargado como evento (por ejemplo, porque todavía falta la fecha o las
 * fotos). Los que tienen fecha pueden ir en prisma/seed-data/events.ts con `category: "workshop"` y su `track`.
 */
export type SeedPastWorkshop = {
  slug: string;
  track: WorkshopTrackKey;
  title: string;
  summary: string;
  startsAt?: Date;
  /** Foto del taller (en public/ o en el bucket de Supabase). */
  imageUrl?: string;
};

export const pastWorkshops: SeedPastWorkshop[] = [
  {
    slug: "instalacion-linux",
    track: "linux",
    title: "Instalación de Linux",
    summary: "Instalamos Linux en las laptops de quienes vinieron, para dejarlas listas para trabajar con el club.",
  },
];

export type SeedAsyncWorkshop = {
  track: WorkshopTrackKey;
  /** Número de semana, "01" a "09". Es el numeral grande de la página. */
  week: string;
  /** Carpeta en jar_workshops y ruta de la guía en jar_site ("semana-01-talkers-listeners"). */
  slug: string;
  title: string;
  /** Qué te llevás al terminar, sin el "Al terminar," del frontmatter. */
  outcome: string;
  /** Duración estimada en minutos (rango). */
  minutes: [number, number];
  level: WorkshopLevel;
  /** Paquete ROS 2 que se compila esa semana. */
  ros2Package: string;
  /** Semanas que hay que tener hechas antes (además del setup del simulador, que vale para todas). */
  requires: string[];
};

export const JAR_SITE_URL = "https://airclub-udesa.github.io/jar_site";
export const JAR_WORKSHOPS_REPO = "https://github.com/AIRclub-UdeSA/jar_workshops";

export const asyncWorkshops: SeedAsyncWorkshop[] = [
  {
    track: "ros2",
    week: "01",
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
    slug: "semana-09-nav2",
    title: "Nav2",
    outcome: "Corrés el stack real de Nav2 sobre el mismo laberinto y ves qué gana y qué pierde cada módulo manual.",
    minutes: [90, 120],
    level: "avanzado",
    ros2Package: "nav2_bringup",
    requires: ["06"],
  },
];
