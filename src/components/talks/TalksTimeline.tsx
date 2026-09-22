"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Presentation, Camera, ChevronLeft, ChevronRight, ArrowUpRight, Calendar, User } from "lucide-react";
import type { TalkMedia, TalkSlide, TalkSpeaker } from "@/lib/talks";
import type { FloatingWindowTab } from "./TalkFloatingWindow";

export type TimelineTalk = {
  slug: string;
  title: string;
  subtitle: string;
  details: string;
  abstract: string;
  speaker?: TalkSpeaker;
  startsAt?: string; // ISO; sin fecha = siempre al final
  dateLabel?: string;
  placeholder?: string;
  location?: string;
  topic?: string;
  media: TalkMedia[];
  slides?: TalkSlide[];
  links?: { label: string; url: string }[];
  cta?: { label: string; url: string };
};

interface TalksTimelineProps {
  talks: TimelineTalk[];
  nextSlug: string | null;
  onOpenTalk?: (slug: string, tab?: FloatingWindowTab) => void;
}

function formatDate(iso?: string, label?: string) {
  if (label) return label;
  if (!iso) return "Fecha a confirmar";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  })
    .format(new Date(iso))
    .replace(/\./g, "")
    .toUpperCase();
}

export function TalksTimeline({ talks, nextSlug, onOpenTalk }: TalksTimelineProps) {
  // Charlas programadas (excluyendo el call-for-speakers que va al pie)
  const scheduledTalks = talks.filter((t) => t.slug !== "call-for-speakers");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(1);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calcular índice aproximado
    const cardWidth = 380;
    const current = Math.min(
      Math.max(Math.round(scrollLeft / cardWidth) + 1, 1),
      scheduledTalks.length,
    );
    setActiveIndex(current);
  }, [scheduledTalks.length]);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -400 : 400;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12">
      <div className="border-t border-border/80 pt-14 md:pt-20">
        {/* Cabecera del slideshow con controles de navegación */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 font-mono text-[.74rem] uppercase tracking-[.2em] text-crimson-text font-semibold">
              <span className="size-2 rounded-full bg-crimson" />
              <span>Cronograma & Archivo</span>
            </div>
            <h2 className="mt-1 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-bold tracking-tight text-text">
              Sesiones del Club
            </h2>
          </div>

          {/* Indicador y botones anterior / siguiente */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[.76rem] tracking-widest text-text3">
              [ {String(activeIndex).padStart(2, "0")} / {String(scheduledTalks.length).padStart(2, "0")} ]
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Charla anterior"
                className="flex size-9 items-center justify-center rounded-full border border-border/80 text-text transition-colors hover:border-crimson hover:text-crimson-text disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Siguiente charla"
                className="flex size-9 items-center justify-center rounded-full border border-border/80 text-text transition-colors hover:border-crimson hover:text-crimson-text disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Pista de bloques estéticos deslizables horizontalmente */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {scheduledTalks.map((talk, index) => {
            const isNext = talk.slug === nextSlug;
            const hasSlides = talk.slides && talk.slides.length > 0;
            const hasMedia = talk.media && talk.media.length > 0;

            return (
              <article
                key={talk.slug}
                className="group relative flex w-[320px] sm:w-[380px] md:w-[410px] shrink-0 snap-start flex-col justify-between border border-border/80 bg-card/50 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-crimson/70 hover:bg-card"
              >
                {/* Parte superior del bloque: estado y fecha técnica */}
                <div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono text-[.72rem]">
                    <span
                      className={`uppercase tracking-[.18em] font-semibold ${
                        hasSlides || hasMedia ? "text-crimson-text" : "text-text3"
                      }`}
                    >
                      {hasSlides || hasMedia
                        ? `EDICIÓN #${String(index + 1).padStart(2, "0")} · ARCHIVO`
                        : isNext
                          ? "PRÓXIMA EDICIÓN"
                          : `EDICIÓN #${String(index + 1).padStart(2, "0")}`}
                    </span>
                    {isNext && (
                      <span className="flex items-center gap-1.5 text-crimson-text font-semibold">
                        <span className="size-1.5 rounded-full bg-crimson animate-pulse" />
                        <span>CONFIRMADA</span>
                      </span>
                    )}
                  </div>

                  {/* Fecha de la sesión */}
                  <div className="mt-4 flex items-center gap-2 font-mono text-[.82rem] font-bold text-text">
                    <Calendar size={14} className="text-crimson" />
                    <span>{formatDate(talk.startsAt, talk.dateLabel)}</span>
                  </div>

                  {/* Título de la charla */}
                  <h3 className="mt-3 font-display text-[1.25rem] sm:text-[1.38rem] font-bold text-text leading-tight group-hover:text-crimson transition-colors">
                    {talk.title}
                  </h3>

                  {/* Ficha del orador o estado de convocatoria */}
                  {talk.speaker ? (
                    <div className="mt-5 flex items-center gap-3 border-t border-border/50 pt-4">
                      {talk.speaker.avatar ? (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-crimson/60">
                          <Image
                            src={talk.speaker.avatar}
                            alt={talk.speaker.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg2 border border-border text-text3">
                          <User size={16} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-[.9rem] font-bold text-text">
                          {talk.speaker.name}
                        </div>
                        <div className="truncate font-mono text-[.72rem] text-crimson-text">
                          {talk.speaker.role}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 border-t border-border/50 pt-4 font-mono text-[.74rem] text-text3">
                      Orador invitado e investigación a confirmar
                    </div>
                  )}

                  {/* Síntesis o abstract corto */}
                  <p className="mt-4 text-[.86rem] leading-[1.65] text-text2 line-clamp-3">
                    {talk.abstract}
                  </p>
                </div>

                {/* Pie del bloque: disparadores interactivos a la ventana flotante o RSVP */}
                <div className="mt-6 border-t border-border/60 pt-4">
                  {hasSlides || hasMedia ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {hasSlides && (
                        <button
                          type="button"
                          onClick={() => onOpenTalk?.(talk.slug, "slides")}
                          className="inline-flex items-center gap-1.5 rounded-full bg-crimson/10 px-3.5 py-1.5 font-mono text-[.72rem] font-semibold text-crimson-text transition-colors hover:bg-crimson hover:text-white"
                        >
                          <Presentation size={13} />
                          <span>Ver Slides</span>
                        </button>
                      )}
                      {hasMedia && (
                        <button
                          type="button"
                          onClick={() => onOpenTalk?.(talk.slug, "gallery")}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 font-mono text-[.72rem] font-semibold text-text2 transition-colors hover:border-text hover:text-text"
                        >
                          <Camera size={13} />
                          <span>{talk.media.length} fotos</span>
                        </button>
                      )}
                    </div>
                  ) : talk.cta ? (
                    <a
                      href={talk.cta.url}
                      className="inline-flex items-center gap-1.5 font-mono text-[.76rem] font-semibold uppercase tracking-wider text-crimson-text transition-colors hover:text-crimson"
                    >
                      <span>{talk.cta.label}</span>
                      <ArrowUpRight size={13} />
                    </a>
                  ) : (
                    <span className="font-mono text-[.72rem] uppercase tracking-wider text-text3">
                      Registro próximamente
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

