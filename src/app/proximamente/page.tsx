import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Wrench, Calendar, FolderGit2, Bot } from "lucide-react";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Próximamente, AIR Club UdeSA",
  description:
    "Espacio en desarrollo: estamos preparando nuevas secciones, talleres y plataformas de robótica e inteligencia artificial.",
  path: "/proximamente",
});

type SectionInfo = {
  key: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  icon: typeof Calendar;
  items: string[];
};

const SECTIONS: Record<string, SectionInfo> = {
  eventos: {
    key: "eventos",
    badge: "Workshops & Actividades",
    title: "Estamos armando el calendario de talleres y encuentros",
    tagline: "Aprender metiendo mano",
    description:
      "Talleres prácticos de robótica móvil, visión artificial y simulación sin requisitos previos. Conectamos cables, cargamos código y movemos motores en el Campus Victoria.",
    icon: Calendar,
    items: [
      "Workshops prácticos con microcontroladores, sensores y motores",
      "Sesiones de simulación de entornos autónomos en ROS 2 y Gazebo",
      "Encuentros de integración para nuevos miembros del club",
    ],
  },
  proyectos: {
    key: "proyectos",
    badge: "Proyectos Estudiantiles",
    title: "Estamos preparando el tablón interactivo de proyectos",
    tagline: "Hardware real y código abierto",
    description:
      "Plataformas móviles omnidireccionales, gemelos digitales y modelos de percepción autónoma desarrollados por estudiantes del club. Muy pronto vas a poder explorar el código y cómo sumarte.",
    icon: FolderGit2,
    items: [
      "Documentación técnica de chasis móviles y hardware abierto",
      "Paquetes de navegación y librerías de control en GitHub",
      "Espacio para presentar tu propia idea y armar equipo",
    ],
  },
  plataformas: {
    key: "plataformas",
    badge: "Plataformas Robóticas",
    title: "Estamos catalogando los robots y plataformas del club",
    tagline: "Robots reales en el campus",
    description:
      "Fichas técnicas completas, especificaciones mecánicas, sensores LiDAR, cámaras de profundidad y computadoras de a bordo de las plataformas de prueba y competencia del club.",
    icon: Bot,
    items: [
      "ROSMASTER X3: tracción Mecanum, LiDAR 360° y cámara RGB-D",
      "Brazo robótico articulado con cinemática inversa en tiempo real",
      "Telemetría, simulador en Gazebo y especificaciones de manufactura",
    ],
  },
};

const DEFAULT_INFO: SectionInfo = {
  key: "general",
  badge: "Sección en desarrollo",
  title: "Esta sección estará disponible muy pronto",
  tagline: "Think. Build. Compete.",
  description:
    "Estamos trabajando en el diseño y contenido de este espacio como parte de la nueva versión del sitio de AIR Club UdeSA. Mientras tanto, podés explorar nuestras charlas técnicas, conocer al equipo o sumarte a la comunidad.",
  icon: Wrench,
  items: [
    "Próximos workshops y encuentros abiertos en el Campus Victoria",
    "Repositorios abiertos y plataformas de robótica móvil",
    "Preparación para el Challenge JAR 2026",
  ],
};

export default async function ProximamentePage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string }>;
}) {
  const { de } = await searchParams;
  const section = (de && SECTIONS[de.toLowerCase()]) || DEFAULT_INFO;
  const Icon = section.icon;

  return (
    <>
      {/* Título unificado en Anton, centrado y con el mismo escalado que /talks, /equipo y /contacto */}
      <header className="pb-8 pt-24 md:pb-12">
        <h1 className="talk-rise select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-crimson-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
          Próximamente
        </h1>
      </header>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <RevealOnScroll>
            {/* Contenedor principal con el lenguaje recto y minimalista de las subpáginas */}
            <div className="grid grid-cols-1 border border-text bg-card lg:grid-cols-12">
              {/* Lado izquierdo: Información editorial */}
              <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 xl:col-span-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 border border-text bg-bg px-3 py-1 font-mono text-[.74rem] font-semibold uppercase tracking-[.16em] text-crimson-text">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{section.badge}</span>
                    </span>
                    <span className="font-mono text-[.74rem] uppercase tracking-[.16em] text-text3">
                      [EN DESARROLLO]
                    </span>
                  </div>

                  <h2 className="mt-6 font-display text-[clamp(1.75rem,3.2vw,2.7rem)] font-black uppercase leading-[1.05] tracking-tight text-text">
                    {section.title}
                  </h2>

                  <p className="mt-3 font-mono text-[.82rem] uppercase tracking-[.14em] text-mauve">
                    {section.tagline}
                  </p>

                  <p className="mt-6 max-w-2xl font-body text-[1.02rem] leading-[1.78] text-text2 sm:text-[1.08rem]">
                    {section.description}
                  </p>

                  <div className="mt-8 border-t border-border pt-6">
                    <p className="font-mono text-[.74rem] font-semibold uppercase tracking-[.18em] text-text3">
                      Qué estamos preparando para esta sección
                    </p>
                    <ul className="mt-4 flex flex-col gap-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                          <span className="font-body text-[.94rem] leading-relaxed text-text2 sm:text-[.98rem]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Acciones principales con botones píldora oficiales */}
                <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-8">
                  <Link
                    href="/talks"
                    className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.12em] text-white transition-colors hover:bg-crimson-hover"
                  >
                    <span>Explorar AIR Talks</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/equipo"
                    className="inline-flex items-center gap-2 rounded-full border border-text px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.12em] text-text transition-colors hover:bg-text hover:text-bg"
                  >
                    <span>Conocer al equipo</span>
                  </Link>

                  <Link
                    href="/contacto"
                    className="inline-flex items-center gap-1.5 px-4 py-3 font-mono text-[.78rem] uppercase tracking-[.14em] text-crimson-text transition-colors hover:underline"
                  >
                    <span>Sumarme al club</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Lado derecho: Afiche arquitectónico con trama diagonal y tipografía de ingeniería */}
              <div className="relative flex min-h-[300px] flex-col justify-between border-t border-text bg-bg2 p-8 lg:col-span-5 lg:border-l lg:border-t-0 xl:col-span-4">
                {/* Trama diagonal 'lugar reservado' oficial */}
                <div className="talk-hatch pointer-events-none absolute inset-0 opacity-40 dark:opacity-25" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between border-b border-text/20 pb-4 font-mono text-[.72rem] uppercase tracking-[.18em] text-text3">
                    <span>AIR Club UdeSA</span>
                    <span>2026</span>
                  </div>

                  <div className="mt-8 font-logo text-[clamp(3.5rem,7vw,5.5rem)] leading-[0.88] text-text/10 select-none">
                    AIR
                    <br />
                    LAB
                  </div>
                </div>

                <div className="relative z-10 border-t border-text/20 pt-6">
                  <p className="font-mono text-[.78rem] uppercase tracking-[.14em] text-text2">
                    Lugar reservado para el próximo lanzamiento.
                  </p>
                  <p className="mt-2 font-mono text-[.72rem] text-text3">
                    ¿Tenés dudas o querés colaborar en el desarrollo? Escribinos a través de{" "}
                    <Link href="/contacto" className="text-crimson-text underline">
                      Contacto
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
