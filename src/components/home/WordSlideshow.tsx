"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import type { AnimationEvent, KeyboardEvent, PointerEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

interface WordSlide {
  title: string;
  short: string; // nombre corto para la pestaña de navegación
  tagline: string;
  href: string;
  isExternal?: boolean;
  bg: string;
  accent: string;
}

const SLIDES: WordSlide[] = [
  {
    title: "WORKSHOPS",
    short: "Workshops",
    tagline: "Aprender metiendo mano. Conectamos cables, cargamos código y movemos motores sin requisitos previos.",
    href: "/eventos",
    bg: "#440924", // Deep Velvet Bordeaux Vivo
    accent: "#ff2a6d",
  },
  {
    title: "AIR TALKS",
    short: "Talks",
    tagline: "Espacio abierto para que tesistas muestren sus avances, estudiantes compartan ideas y vengan invitados.",
    href: "/talks",
    bg: "#520b2f", // Rich Saturated Ruby
    accent: "#ff4d8d",
  },
  {
    title: "PROYECTOS ESTUDIANTILES",
    short: "Proyectos",
    tagline: "Construcción de plataformas robóticas reales, chasis móviles omnidireccionales y visión por computadora.",
    href: "/proyectos",
    bg: "#380931", // Electric Midnight Plum
    accent: "#ff5c8a",
  },
  {
    title: "COMPETENCIAS",
    short: "Competencias",
    tagline: "Impulsamos equipos para medirnos a nivel nacional: simulación en Gazebo y pista física en la JAR 2026.",
    href: "#cuenta-regresiva",
    bg: "#5a0827", // Intense Cardinal Wine
    accent: "#ff6b95",
  },
  {
    title: "GITHUB",
    short: "GitHub",
    tagline: "Nuestros paquetes, librerías y simuladores están abiertos en GitHub para que cualquiera clone y colabore.",
    href: "https://github.com/airclub-udesa",
    isExternal: true,
    bg: "#3b0d2a", // Saturated Deep Mauve Wine
    accent: "#f7a8c4",
  },
];

const N = SLIDES.length;
const EXTENDED_SLIDES = [...SLIDES, SLIDES[0]]; // el clon del final permite el loop hacia adelante
const AUTO_INTERVAL = 3400; // 3.4s por palabra (también tras cambiar de diapositiva a mano)
const TRANSITION_MS = 750; // 750ms de animación
const SWIPE_MIN_PX = 50;

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedMotionServer = () => false;

export function WordSlideshow() {
  // `current` recorre 0..N: N es el clon de la diapositiva 0 (loop hacia adelante sin salto visible)
  const [current, setCurrent] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const [hovered, setHovered] = useState(false); // mouse encima
  const [keyboardFocus, setKeyboardFocus] = useState(false); // foco de teclado adentro (no el del clic con mouse)
  const [touching, setTouching] = useState(false); // dedo apoyado
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);

  const activeIdx = current % N;
  const activeSlide = SLIDES[activeIdx];
  const paused = hovered || keyboardFocus || touching;

  const rafs = useRef<number[]>([]);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    const ids = rafs.current;
    return () => ids.forEach(cancelAnimationFrame);
  }, []);

  // ---------- navegación ----------
  // Avance automático: lo dispara la barra de progreso al terminar su animación (onAnimationEnd). Así la
  // pausa (hover, foco, dedo) simplemente congela la barra y el avance retoma justo donde quedó.
  const autoAdvance = () => {
    setEnableTransition(true);
    setCurrent((c) => (c >= N ? c : c + 1));
  };

  const next = useCallback(() => {
    if (current >= N) return; // ya en el clon del final: el reseteo a 0 está por ocurrir
    setEnableTransition(true);
    setCurrent(current + 1);
  }, [current]);

  const prev = useCallback(() => {
    if (current === 0) {
      // Hacia atrás desde la primera: saltamos sin animación al clon del final (se ve igual que la primera)
      // y recién ahí animamos hacia la última, para que se sienta un retroceso natural.
      setEnableTransition(false);
      setCurrent(N);
      const a = requestAnimationFrame(() => {
        const b = requestAnimationFrame(() => {
          setEnableTransition(true);
          setCurrent(N - 1);
        });
        rafs.current.push(b);
      });
      rafs.current.push(a);
    } else {
      setEnableTransition(true);
      setCurrent(current - 1);
    }
  }, [current]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx === activeIdx) return;
      setEnableTransition(true);
      setCurrent(idx);
    },
    [activeIdx]
  );

  // Al llegar ANIMANDO al clon del final, esperamos a que termine la animación y reseteamos a 0 sin
  // transición visible. Si se llegó al clon con el salto instantáneo de "anterior desde la primera"
  // (enableTransition = false) NO se resetea: si no, en un navegador lento el reseteo (750ms) le podía ganar
  // al frame que arranca la animación de retroceso y la diapositiva se quedaba en la primera.
  useEffect(() => {
    if (current !== N || !enableTransition) return;
    const resetTimer = setTimeout(() => {
      setEnableTransition(false);
      setCurrent(0);
    }, TRANSITION_MS);
    return () => clearTimeout(resetTimer);
  }, [current, enableTransition]);

  // ---------- teclado ----------
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  // ---------- swipe (solo touch/lápiz; con mouse arrastrar seleccionaría texto y molestaría a los enlaces) ----------
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
    swiped.current = false;
    setTouching(true);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    setTouching(false);
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      if (dx < 0) next();
      else prev();
    }
  };
  const onPointerCancel = () => {
    swipeStart.current = null;
    setTouching(false);
  };
  // si el gesto fue un swipe, el "click" que cae sobre un enlace no tiene que navegar
  const onClickCapture = (e: React.MouseEvent) => {
    if (swiped.current) {
      e.preventDefault();
      e.stopPropagation();
      swiped.current = false;
    }
  };

  return (
    <section
      id="slideshow-palabras"
      aria-roledescription="carrusel"
      aria-label="Qué hacemos en AIR Club"
      className="relative w-full overflow-hidden transition-colors duration-700 ease-in-out border-y border-white/10 my-16 select-none"
      style={{ backgroundColor: activeSlide.bg }}
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      // el foco por clic de mouse (en una flecha o pestaña) NO pausa: si no, tras un clic quedaría trabado
      onFocusCapture={(e) => setKeyboardFocus(e.target.matches(":focus-visible"))}
      onBlurCapture={() => setKeyboardFocus(false)}
    >
      {/* Resplandor ambiental dinámico superior derecho */}
      <div
        className="absolute -right-20 -top-20 w-[480px] h-[480px] rounded-full blur-[140px] pointer-events-none opacity-35 transition-all duration-700"
        style={{ backgroundColor: activeSlide.accent }}
      />
      {/* Resplandor ambiental complementario inferior izquierdo */}
      <div
        className="absolute -left-20 -bottom-20 w-[420px] h-[420px] rounded-full blur-[130px] pointer-events-none opacity-25 transition-all duration-700"
        style={{ backgroundColor: activeSlide.accent }}
      />

      {/* Pista Horizontal con overflow-hidden. pan-y: el scroll vertical de la página sigue andando con el dedo */}
      <div
        className="overflow-hidden w-full"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        <div
          className="flex w-full"
          // se anuncia a lectores de pantalla solo cuando no rota sola (pausado): si no, hablaría sin parar
          aria-live={paused || reducedMotion ? "polite" : "off"}
          style={{
            transform: `translateX(-${current * 100}%)`,
            transition:
              enableTransition && !reducedMotion
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                : "none",
          }}
        >
          {EXTENDED_SLIDES.map((slide, idx) => (
            <div
              key={`${slide.title}-${idx}`}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${(idx % N) + 1} de ${N}`}
              // las que no se ven no reciben foco ni clics (si no, el Tab podría llevar el foco afuera de pantalla)
              inert={idx !== current}
              aria-hidden={idx === N && current !== N ? true : undefined}
              className="w-full shrink-0 min-w-full px-6 sm:px-12 md:px-20 pt-16 pb-28 sm:pt-24 sm:pb-32 min-h-[440px] sm:min-h-[500px] flex items-center justify-start"
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

      {/* ===== Controles: pestañas grandes (cada una es un blanco de clic de 44px de alto y ocupa todo su
          ancho, en vez de puntitos de 6px) + flechas. El segmento activo se llena como barra de progreso del
          avance automático; al pasar el mouse se congela y retoma donde quedó. ===== */}
      <div className="absolute inset-x-0 bottom-3 sm:bottom-5 px-6 sm:px-12 md:px-20">
        <div className="max-w-6xl mx-auto flex items-end gap-2 sm:gap-4">
          <div role="group" aria-label="Elegir diapositiva" className="flex flex-1 gap-1.5 sm:gap-3">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={`Ir a ${slide.short} (${idx + 1} de ${N})`}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex-1 min-w-0 min-h-11 flex flex-col justify-end gap-2 pb-3 text-left cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90"
                >
                  <span
                    className={`hidden md:block truncate font-mono text-[.7rem] uppercase tracking-[.14em] transition-colors ${
                      isActive ? "text-white" : "text-white/45 group-hover:text-white/80"
                    }`}
                  >
                    {slide.short}
                  </span>
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/20 group-hover:bg-white/35 transition-colors">
                    {isActive &&
                      (reducedMotion ? (
                        // sin movimiento: no hay avance automático, el activo solo se marca lleno
                        <span className="absolute inset-0 bg-white" />
                      ) : (
                        <span
                          // la key NO incluye el clon: al resetear de N a 0 la barra sigue sin reiniciarse
                          key={activeIdx}
                          className="ws-progress-fill absolute inset-0 origin-left bg-white"
                          style={{
                            animationDuration: `${AUTO_INTERVAL}ms`,
                            animationPlayState: paused ? "paused" : "running",
                          }}
                          onAnimationEnd={(e: AnimationEvent) => {
                            if (e.animationName === "ws-progress") autoAdvance();
                          }}
                        />
                      ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 gap-2 pb-1">
            <button
              type="button"
              onClick={prev}
              aria-label="Diapositiva anterior"
              className="grid size-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Diapositiva siguiente"
              className="grid size-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
