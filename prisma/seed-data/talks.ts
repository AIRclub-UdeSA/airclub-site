
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
  bio?: string;
};

export type SeedTalk = {
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  speaker?: TalkSpeaker;
  speakers?: TalkSpeaker[];
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
    location: "Campus Victoria, UdeSA",
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
    title: "Desbloqueando la planificación de tratamientos en BNCT usando aprendizaje automático",
    subtitle: "Segundo AIR Talk • Bio & Bits",
    confirmed: true,
    location: "Campus Victoria, UdeSA (Aula a confirmar)",
    topic: "Planificación de tratamientos en Terapia por Captura Neutrónica en Boro (BNCT) con Deep Learning",
    speaker: {
      name: "Guillermo Marzik",
      role: "Investigador Doctoral CONICET en la CNEA",
      affiliation: "Comisión Nacional de Energía Atómica (CNEA) / CONICET",
      avatar: "/talks/bio-and-bits/guillermo-marzik.jpg",
      bio: "Ingeniero de sonido, docente universitario y actualmente realizando su investigación de doctorado en la Comisión Nacional de Energía Atómica gracias a una beca doctoral del CONICET.",
    },
    abstract:
      "En la Terapia por Captura Neutrónica en Boro (BNCT), una planificación precisa es particularmente desafiante debido a la interacción entre el campo de neutrones, la distribución de boro y la anatomía del paciente. A diferencia de la radioterapia convencional, la dosis depende de múltiples contribuciones asociadas a reacciones nucleares y de la distribución espacial del boro, lo que permite un efecto terapéutico altamente localizado, pero hace que el cálculo dosimétrico sea fuertemente dependiente del paciente y de la configuración de irradiación.\n\nPara planificar un tratamiento se simulan mediante métodos de Monte Carlo (MC) mapas de distribución de dosis a partir de la tomografía computada (CT), las concentraciones de boro estimadas y la configuración de la fuente de neutrones. Si bien estas simulaciones permiten obtener cálculos precisos, su elevado costo computacional limita la evaluación de múltiples configuraciones y, por lo tanto, la optimización del tratamiento.\n\nEn esta charla se presentarán distintas propuestas basadas en aprendizaje automático para reducir drásticamente estos tiempos de cálculo sin perder precisión. Se analizarán modelos para reducir el ruido estadístico de simulaciones MC no convergidas mediante redes U-Net 3D, aproximaciones de bajo rango de los mapas de dosis mediante familias de funciones aprendidas para su predicción multiescala y, finalmente, el problema inverso de encontrar configuraciones de fuentes de neutrones que satisfagan determinados criterios dosimétricos. En conjunto, estas estrategias buscan facilitar una planificación más rápida, exhaustiva y paciente-específica en BNCT.",
    startsAt: new Date("2026-10-14T16:20:00-03:00"),
    endsAt: new Date("2026-10-14T17:50:00-03:00"),
    dateLabel: "14 de Octubre de 2026",
    media: [
      { type: "image", src: "/talks/bio-and-bits/bnct-planificacion.jpg" },
    ],
    cta: {
      label: "Inscribirse a la charla",
      url: "https://forms.gle/bVFSh5vmzEBUC2KQ7",
    },
  },
  {
    slug: "tercer-air-talk",
    title: "¿Puede una red neuronal biológica controlar un robot? Caos, dopamina y atractores dinámicos para locomoción robótica",
    subtitle: "Tercer AIR Talk • Bio & Bits",
    confirmed: true,
    location: "Campus Victoria, UdeSA (Aula a confirmar)",
    topic: "Redes neuronales de spiking, dopamina y atractores dinámicos para locomoción en robots cuadrúpedos",
    speaker: {
      name: "Gabriel Torre",
      role: "Ingeniero de I+D en el LINAR y doctorando UBA",
      affiliation: "Laboratorio de Inteligencia Artificial y Robótica (LINAR) · UdeSA / UBA",
      avatar: "/talks/bio-and-bits/gabriel-torre.jpg",
      bio: "Ingeniero Mecánico por el Instituto Tecnológico de Buenos Aires (ITBA), donde se especializó en mecatrónica. Actualmente es ingeniero de I+D en el Laboratorio de Inteligencia Artificial y Robótica de la Universidad de San Andrés y doctorando en aprendizaje automático en la Universidad de Buenos Aires (UBA). Su investigación se centra en el aprendizaje automático, la transferencia de aprendizaje y el control robótico inspirado en neurociencia. Sus intereses incluyen las redes neuronales de spiking, el aprendizaje por refuerzo, la robótica cuadrúpeda y los vehículos autónomos.",
    },
    abstract:
      "Las redes neuronales de spiking ofrecen un modelo computacional inspirado en el cerebro, donde el comportamiento emerge de la dinámica colectiva de neuronas que interactúan. En esta charla mostramos que una única red recurrente de neuronas leaky integrate-and-fire puede generar distintos patrones locomotores en un robot cuadrúpedo. La red funciona como un central pattern generator cuyos atractores dinámicos corresponden a diferentes marchas, como el trote o el salto.\n\nUn único parámetro global, una señal dopaminérgica inspirada en la neuromodulación biológica, modifica el balance excitación-inhibición y permite que la red transicione entre atractores sin reentrenamiento ni módulos adicionales. Con niveles bajos de dopamina, la red entra en un régimen caótico, con un exponente de Lyapunov máximo positivo, que interpretamos como exploración: la actividad recorre distintos estados hasta que un aumento de dopamina la estabiliza en un ciclo límite. Así, la dopamina funciona como una perilla que regula el balance entre exploración y explotación.\n\nAdemás, presentamos una arquitectura jerárquica inspirada en la organización de los ganglios basales y la médula espinal. En ella, la recompensa ya no se calcula a partir de la actividad interna de la red, sino de la interacción del cuerpo con su entorno. Mostraremos resultados preliminares en un organismo simple simulado, donde la red primero explora de forma caótica y luego converge a una locomoción efectiva a medida que aumenta la recompensa, sin modificar los pesos sinápticos.\n\nDiscutiremos cómo este enfoque conecta la neurociencia computacional, los sistemas dinámicos y la robótica, y posibles líneas futuras, como la implementación en un cuadrúpedo comercial, el aprendizaje sináptico dentro de la red y la integración de feedback sensorial.",
    startsAt: new Date("2026-10-22T14:40:00-03:00"),
    endsAt: new Date("2026-10-22T16:10:00-03:00"),
    dateLabel: "22 de Octubre de 2026",
    media: [],
    cta: {
      label: "Inscribirse a la charla",
      url: "https://forms.gle/bVFSh5vmzEBUC2KQ7",
    },
  },
];
