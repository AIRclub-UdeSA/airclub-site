import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

const PILLARS = [
  {
    category: "Cultura de Taller",
    title: "Aprender entre pares",
    desc: "Un espacio horizontal y abierto. No hay jerarquías: compartimos código, fierros, frustraciones y descubrimientos a través de workshops prácticos y proyectos colectivos.",
    tags: "ROS 2 · WORKSHOPS · HACKATHONS",
  },
  {
    category: "Ingeniería Aplicada",
    title: "Fierros, sensores y modelos",
    desc: "No nos quedamos en la pantalla ni en simuladores de juguete. Integramos percepción 3D con LiDAR, visión estéreo por computadora, chasis omnidireccionales y algoritmos de navegación en robots físicos.",
    tags: "SLAM · YOLOV8 · MECANUM · JETSON",
  },
  {
    category: "Ecosistema Académico",
    title: "Rigor de laboratorio UdeSA",
    desc: "Impulsados con el acompañamiento directo de profesores e investigadores del Departamento de Ingeniería de la Universidad de San Andrés, combinando rigor científico con espíritu hacker.",
    tags: "UDESA INGENIERÍA · LAB 01 · JAR 2026",
  },
];

export function AboutSection() {
  return (
    <section id="nosotros" className="px-6 sm:px-8 md:px-12 py-24 sm:py-36 max-w-7xl mx-auto">
      <RevealOnScroll>
        {/* Top Header: Declaración monumental y manifiesto */}
        <div className="mb-20 sm:mb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center border-b border-border/80 pb-16">
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-crimson" />
              <span className="font-mono text-[.72rem] uppercase tracking-[.25em] text-mauve font-semibold">
                Universidad de San Andrés · Club de Robótica e IA
              </span>
            </div>
            <h2 className="font-display text-[clamp(2.2rem,4.8vw,4.1rem)] font-extrabold leading-[0.96] tracking-tight text-text uppercase">
              Construir.
              <br />
              <span className="text-crimson">Competir.</span>
              <br />
              En comunidad.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-end">
            <p className="font-body text-[1.05rem] leading-[1.8] text-text2 mb-6">
              Somos estudiantes de diversas carreras de San Andrés que nos juntamos a crear con inteligencia artificial y robótica física. Encaramos desafíos técnicos que nadie podría resolver en solitario.
            </p>
            <div>
              <Link
                href="/equipo"
                className="group inline-flex items-center gap-2 font-mono text-[.8rem] uppercase tracking-[.12em] font-semibold text-text hover:text-crimson transition-colors"
              >
                <span>Conocé a los integrantes del club</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-crimson" />
              </Link>
            </div>
          </div>
        </div>
      </RevealOnScroll>

      {/* The Architectural Ledger: Lista abierta sin cajas redondeadas */}
      <div className="divide-y divide-border/80 border-b border-border/80">
        {PILLARS.map((pillar, i) => (
          <RevealOnScroll key={pillar.title} delay={(i + 1) as 1 | 2 | 3}>
            <div className="group py-10 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-baseline transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.015] px-2 sm:px-4">
              <div className="md:col-span-3">
                <span className="font-mono text-[.72rem] uppercase tracking-[.2em] text-mauve font-semibold block mb-1">
                  {pillar.category}
                </span>
                <span className="font-mono text-[.66rem] text-text3 block tracking-widest">
                  {pillar.tags}
                </span>
              </div>

              <div className="md:col-span-4">
                <h3 className="font-display text-[1.5rem] sm:text-[1.8rem] font-bold text-text leading-tight group-hover:text-crimson transition-colors">
                  {pillar.title}
                </h3>
              </div>

              <div className="md:col-span-5">
                <p className="font-body text-[.96rem] leading-[1.75] text-text2">
                  {pillar.desc}
                </p>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
