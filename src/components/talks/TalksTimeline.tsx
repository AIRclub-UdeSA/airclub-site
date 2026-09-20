"use client";

import { Presentation, Camera, ArrowRight } from "lucide-react";
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
  // Las que no son "call-for-speakers" (la convocatoria va en su propia sección al pie)
  const scheduledTalks = talks.filter((t) => t.slug !== "call-for-speakers");

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12">
      <div className="border-t border-border/80 pt-16 md:pt-24">
        {/* Encabezado del archivo cronológico */}
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-black uppercase tracking-tight text-text">
            Archivo de Charlas & Cronograma
          </h2>
          <span className="font-mono text-[.8rem] text-text3">
            Ciclo de divulgación técnica · San Andrés
          </span>
        </div>

        {/* Tabla arquitectónica abierta (sin cajitas ni bordes redondeados) */}
        <div className="divide-y divide-border/80 border-b border-border/80">
          {scheduledTalks.map((talk, index) => {
            const isNext = talk.slug === nextSlug;
            const hasSlides = talk.slides && talk.slides.length > 0;
            const hasMedia = talk.media && talk.media.length > 0;

            return (
              <div
                key={talk.slug}
                onClick={() => onOpenTalk?.(talk.slug, hasSlides ? "slides" : "overview")}
                className="group flex flex-col justify-between py-8 transition-colors duration-200 hover:bg-bg2/40 cursor-pointer lg:flex-row lg:items-center lg:gap-12 px-2"
              >
                {/* Columna 1: Número de edición y fecha */}
                <div className="shrink-0 lg:w-64">
                  <div className="font-mono text-[.74rem] uppercase tracking-wider text-crimson-text font-semibold">
                    {isNext ? "Próxima fecha" : `AIR Talk #${String(index + 1).padStart(2, "0")}`}
                  </div>
                  <div className="mt-1 font-mono text-[.9rem] font-semibold text-text">
                    {formatDate(talk.startsAt, talk.dateLabel)}
                  </div>
                </div>

                {/* Columna 2: Título, orador y temática */}
                <div className="mt-4 flex-1 lg:mt-0">
                  <h3 className="font-display text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-text group-hover:text-crimson-text transition-colors">
                    {talk.title}
                  </h3>
                  <div className="mt-1 font-mono text-[.82rem] text-text2">
                    {talk.subtitle} {talk.details && `· ${talk.details}`}
                  </div>
                </div>

                {/* Columna 3: Disponibilidad de material & acción */}
                <div className="mt-5 flex flex-wrap items-center gap-4 lg:mt-0 shrink-0">
                  <div className="flex items-center gap-3 font-mono text-[.74rem] text-text3">
                    {hasSlides && (
                      <span className="inline-flex items-center gap-1 text-crimson-text font-medium">
                        <Presentation size={13} />
                        <span>Slides</span>
                      </span>
                    )}
                    {hasMedia && (
                      <span className="inline-flex items-center gap-1 text-text2">
                        <Camera size={13} />
                        <span>{talk.media.length} fotos</span>
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 font-mono text-[.78rem] uppercase tracking-wider font-semibold text-text group-hover:text-crimson-text group-hover:translate-x-1 transition-all">
                    <span>{hasSlides ? "Ver material" : "Detalle"}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
