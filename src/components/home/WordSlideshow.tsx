"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface WordSlide {
  title: string;
  tagline: string;
  href: string;
  isExternal?: boolean;
  bg: string;
  accent: string;
}

const SLIDES: WordSlide[] = [
  {
    title: "WORKSHOPS",
    tagline: "Aprender metiendo mano. Conectamos cables, cargamos código y movemos motores sin requisitos previos.",
    href: "/eventos",
    bg: "#1a0511", // Deep Velvet Bordeaux
    accent: "#ff2a6d",
  },
  {
    title: "AIR TALKS",
    tagline: "Espacio abierto para que tesistas muestren sus avances, estudiantes compartan ideas y vengan invitados.",
    href: "/eventos",
    bg: "#240616", // Rich Dark Ruby
    accent: "#f0357f",
  },
  {
    title: "PROYECTOS ESTUDIANTILES",
    tagline: "Construcción de plataformas robóticas reales, chasis móviles omnidireccionales y visión por computadora.",
    href: "/plataformas",
    bg: "#13030b", // Midnight Obsidian Cherry
    accent: "#ff4370",
  },
  {
    title: "COMPETENCIAS",
    tagline: "Impulsamos equipos para medirnos a nivel nacional: simulación en Gazebo y pista física en la JAR 2026.",
    href: "#cuenta-regresiva",
    bg: "#28081c", // Deep Plum Crimson
    accent: "#ff6392",
  },
  {
    title: "GITHUB",
    tagline: "Nuestros paquetes, librerías y simuladores están abiertos en GitHub para que cualquiera clone y colabore.",
    href: "https://github.com/airclub-udesa",
    isExternal: true,
    bg: "#170512", // Dark Rosewood Slate
    accent: "#ddaabc",
  },
];

const EXTENDED_SLIDES = [...SLIDES, SLIDES[0]];
const AUTO_INTERVAL = 3400; // 3.4s por palabra
const TRANSITION_MS = 750; // 750ms de animación

export function WordSlideshow() {
  const [current, setCurrent] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  // El slide visualmente activo para el color de fondo
  const activeSlide = SLIDES[current % SLIDES.length];

  // Avance automático continuo hacia adelante
  useEffect(() => {
    // Si estamos en el punto de reseteo, dejamos que el reseteo ocurra
    if (current === SLIDES.length) return;

    const timer = setTimeout(() => {
      setEnableTransition(true);
      setCurrent((prev) => prev + 1);
    }, AUTO_INTERVAL);

    return () => clearTimeout(timer);
  }, [current]);

  // Loop infinito hacia adelante: al llegar al clon (índice SLIDES.length),
  // esperamos a que complete la animación hacia adelante y reseteamos a 0 sin transición visible
  useEffect(() => {
    if (current === SLIDES.length) {
      const resetTimer = setTimeout(() => {
        setEnableTransition(false);
        setCurrent(0);
      }, TRANSITION_MS);

      return () => clearTimeout(resetTimer);
    }
  }, [current]);

  return (
    <section
      id="slideshow-palabras"
      className="relative w-full overflow-hidden transition-colors duration-700 ease-in-out border-y border-white/10 my-16 select-none"
      style={{ backgroundColor: activeSlide.bg }}
    >
      {/* Resplandor ambiental de color sutil */}
      <div
        className="absolute -right-24 -top-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: activeSlide.accent }}
      />

      {/* Pista Horizontal con overflow-hidden */}
      <div className="overflow-hidden w-full">
        <div
          className="flex w-full"
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition: enableTransition
              ? `transform ${TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
              : "none",
          }}
        >
          {EXTENDED_SLIDES.map((slide, idx) => (
            <div
              key={`${slide.title}-${idx}`}
              className="w-full shrink-0 min-w-full px-6 sm:px-12 md:px-20 py-16 sm:py-24 min-h-[440px] sm:min-h-[500px] flex items-center justify-start"
            >
              <div className="max-w-6xl mx-auto w-full flex flex-col items-start text-left">
                {/* PALABRA MONUMENTAL ALINEADA A LA IZQUIERDA */}
                <div className="mb-5 sm:mb-6">
                  {slide.isExternal ? (
                    <a
                      href={slide.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block group"
                    >
                      <h3 className="font-display font-black text-[clamp(2.2rem,6vw,5.2rem)] tracking-tight uppercase leading-[0.92] text-white group-hover:opacity-85 transition-opacity text-left">
                        {slide.title}
                      </h3>
                    </a>
                  ) : (
                    <Link href={slide.href} className="inline-block group">
                      <h3 className="font-display font-black text-[clamp(2.2rem,6vw,5.2rem)] tracking-tight uppercase leading-[0.92] text-white group-hover:opacity-85 transition-opacity text-left">
                        {slide.title}
                      </h3>
                    </Link>
                  )}
                </div>

                {/* Tagline y enlace alineados a la izquierda */}
                <p className="font-body text-[1.05rem] sm:text-[1.18rem] text-white/80 max-w-2xl leading-relaxed mb-6 text-left">
                  {slide.tagline}
                </p>

                <div>
                  {slide.isExternal ? (
                    <a
                      href={slide.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-[.82rem] uppercase tracking-[.14em] font-semibold text-white hover:underline transition-all"
                      style={{ color: slide.accent }}
                    >
                      <span>Explorar {slide.title}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      href={slide.href}
                      className="inline-flex items-center gap-2 font-mono text-[.82rem] uppercase tracking-[.14em] font-semibold text-white hover:underline transition-all"
                      style={{ color: slide.accent }}
                    >
                      <span>Explorar {slide.title}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
