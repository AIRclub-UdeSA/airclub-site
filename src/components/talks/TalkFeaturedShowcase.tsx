"use client";

import Image from "next/image";
import {
  Presentation,
  Camera,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { TimelineTalk } from "./TalksTimeline";
import type { FloatingWindowTab } from "./TalkFloatingWindow";
import { TiltCard } from "@/components/shared/TiltCard";

interface TalkFeaturedShowcaseProps {
  latestPastTalk?: TimelineTalk;
  nextUpcomingTalk?: TimelineTalk;
  onOpenTalk: (slug: string, tab?: FloatingWindowTab) => void;
}

export function TalkFeaturedShowcase({
  latestPastTalk,
  nextUpcomingTalk,
  onOpenTalk,
}: TalkFeaturedShowcaseProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-6 pb-16 sm:px-8 md:px-12 md:pb-24">
      {/* Título de sección de afiche */}
      <div className="mb-8 flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-2 font-mono text-[.74rem] font-semibold uppercase tracking-[.2em] text-crimson-text">
          <span className="size-2 rounded-full bg-crimson shadow-[0_0_8px_rgba(164,12,76,0.8)]" />
          <span>Destacados AIR Talks</span>
        </div>
        <span className="hidden font-mono text-[.7rem] uppercase tracking-wider text-text3 sm:inline">
          Edición 2026
        </span>
      </div>

      {/* Grid Asimétrico Afiche de Ingeniería */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* TARJETA 1: ÚLTIMA CHARLA REALIZADA (60% / 7 cols) */}
        {latestPastTalk && (
          <div className="lg:col-span-7 flex flex-col">
            <TiltCard max={4} scale={1.01} lift={0} className="h-full">
              <div className="border-trail-hover flex h-full flex-col justify-between rounded-[24px] border-[1.5px] border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-border-h">
                <div>
                  {/* Encabezado de la tarjeta */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson/20 bg-crimson/10 px-3 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.16em] text-crimson-text">
                      <span className="size-1.5 rounded-full bg-crimson" />
                      Última Charla Realizada
                    </span>
                    <span className="font-mono text-[.72rem] font-medium text-text3">
                      {latestPastTalk.dateLabel ?? "3 Septiembre 2026"}
                    </span>
                  </div>

                  {/* Título Monumental */}
                  <h3 className="mt-5 font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-text">
                    {latestPastTalk.title}
                  </h3>

                  {/* Orador y afiliación */}
                  {latestPastTalk.speaker && (
                    <div className="mt-3 flex items-center gap-3">
                      {latestPastTalk.speaker.avatar && (
                        <div className="relative size-9 overflow-hidden rounded-full border border-crimson">
                          <Image
                            src={latestPastTalk.speaker.avatar}
                            alt={latestPastTalk.speaker.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-mono text-[.82rem] font-semibold text-text">
                          {latestPastTalk.speaker.name}
                        </div>
                        <div className="font-mono text-[.7rem] text-text3">
                          {latestPastTalk.speaker.role}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Imagen de portada de alta calidad con badge interactivo */}
                  <div
                    onClick={() => onOpenTalk(latestPastTalk.slug, "gallery")}
                    className="group relative mt-6 aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-black"
                  >
                    {latestPastTalk.media[0] && (
                      <Image
                        src={latestPastTalk.media[0].src}
                        alt={`Foto de ${latestPastTalk.title}`}
                        fill
                        sizes="(min-width: 1024px) 680px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                      <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 font-mono text-[.7rem] backdrop-blur-sm">
                        <Camera size={13} />
                        <span>Ver álbum ({latestPastTalk.media.length} fotos y video)</span>
                      </span>
                      <span className="rounded-full bg-crimson px-2.5 py-1 font-mono text-[.65rem] uppercase tracking-wider font-semibold">
                        Abrir
                      </span>
                    </div>
                  </div>

                  {/* Párrafo narrativo resumido */}
                  <p className="mt-5 text-[.95rem] leading-[1.75] text-text2">
                    {latestPastTalk.abstract}
                  </p>
                </div>

                {/* Acciones principales directas */}
                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border/80 pt-6">
                  {latestPastTalk.slides && latestPastTalk.slides.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onOpenTalk(latestPastTalk.slug, "slides")}
                      className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-3 font-mono text-[.76rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover shadow-sm"
                    >
                      <Presentation size={14} />
                      <span>Ver Slides Embebidas</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenTalk(latestPastTalk.slug, "gallery")}
                    className="inline-flex items-center gap-2 rounded-full border border-text px-5 py-3 font-mono text-[.76rem] font-semibold uppercase tracking-[.14em] text-text transition-colors hover:border-crimson hover:text-crimson-text"
                  >
                    <Camera size={14} />
                    <span>Álbum de Fotos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenTalk(latestPastTalk.slug, "overview")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 font-mono text-[.74rem] uppercase tracking-wider text-text3 transition-colors hover:text-crimson-text"
                  >
                    <span>Detalles</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </TiltCard>
          </div>
        )}

        {/* TARJETA 2: PRÓXIMA CHARLA / RSVP (40% / 5 cols) */}
        {nextUpcomingTalk ? (
          <div className="lg:col-span-5 flex flex-col">
            <TiltCard max={4} scale={1.01} lift={0} className="h-full">
              <div className="border-trail-hover flex h-full flex-col justify-between rounded-[24px] border-[1.5px] border-border bg-card p-6 sm:p-8 transition-all duration-300 hover:border-border-h">
                <div>
                  {/* Encabezado con pulso de próximo */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose/30 bg-rose/10 px-3 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.16em] text-mauve">
                      <span className="size-1.5 rounded-full bg-crimson animate-ping" />
                      Próxima Charla
                    </span>
                    <span className="font-mono text-[.72rem] font-semibold uppercase tracking-wider text-crimson-text">
                      [FECHA CONFIRMADA]
                    </span>
                  </div>

                  {/* Título de la próxima fecha */}
                  <h3 className="mt-5 font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-extrabold uppercase leading-[1.1] tracking-tight text-text">
                    {nextUpcomingTalk.title}
                  </h3>
                  <div className="mt-2 font-mono text-[.8rem] font-semibold text-text2">
                    {nextUpcomingTalk.subtitle}
                  </div>

                  {/* Bloque de fecha y ubicación de laboratorio */}
                  <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-bg2/50 p-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-crimson shrink-0" />
                      <div className="font-mono text-[.78rem] text-text">
                        {nextUpcomingTalk.dateLabel ?? "Octubre 2026"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-crimson shrink-0" />
                      <div className="font-mono text-[.78rem] text-text2">
                        Horario y aula a confirmar en el campus UdeSA
                      </div>
                    </div>
                  </div>

                  {/* Placeholder gráfico de anticipación */}
                  <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-dashed border-border bg-card-muted flex flex-col items-center justify-center p-6 text-center">
                    <Sparkles size={28} className="text-mauve mb-2" />
                    <p className="font-display text-[1rem] font-bold text-text">
                      Invitado especial en camino
                    </p>
                    <p className="mt-1 font-mono text-[.7rem] text-text3 max-w-[28ch]">
                      Coordinando orador sobre visión artificial o robótica móvil.
                    </p>
                  </div>

                  <p className="mt-5 text-[.9rem] leading-[1.7] text-text2">
                    {nextUpcomingTalk.abstract}
                  </p>
                </div>

                {/* Bloque RSVP y Recordatorio */}
                <div className="mt-8 border-t border-border/80 pt-6">
                  <div className="flex flex-col gap-3">
                    {nextUpcomingTalk.cta ? (
                      <a
                        href={nextUpcomingTalk.cta.url}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-crimson px-5 py-3 font-mono text-[.76rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover shadow-sm"
                      >
                        <UserCheck size={14} />
                        <span>{nextUpcomingTalk.cta.label}</span>
                      </a>
                    ) : (
                      <a
                        href="mailto:airclub@udesa.edu.ar?subject=Reserva de lugar para próximo AIR Talk"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-crimson px-5 py-3 font-mono text-[.76rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover shadow-sm"
                      >
                        <UserCheck size={14} />
                        <span>Reservar Lugar / RSVP</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenTalk(nextUpcomingTalk.slug, "overview")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 font-mono text-[.72rem] font-medium uppercase tracking-wider text-text3 transition-colors hover:border-crimson hover:text-text"
                    >
                      <span>Ver ficha del encuentro</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}
