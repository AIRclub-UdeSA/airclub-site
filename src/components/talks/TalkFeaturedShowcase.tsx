"use client";

import Image from "next/image";
import { Presentation, Camera, ArrowRight, ExternalLink } from "lucide-react";
import type { TimelineTalk } from "./TalksTimeline";
import type { FloatingWindowTab } from "./TalkFloatingWindow";

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
  if (!latestPastTalk) return null;

  return (
    <div className="w-full bg-[#0c0407] text-[#f5e8ec] border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16 md:px-12 md:py-20">
        {/* ===== MÓDULO AUDITORIO DARK VELVET: ÚLTIMA CHARLA REALIZADA ===== */}
        <article className="border-b border-white/10 pb-12 md:pb-16">
          {/* Metadatos en JetBrains Mono sobrio */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono text-[.8rem] uppercase tracking-[.16em] text-white/40">
            <time dateTime="2026-09-03">03 de Septiembre, 2026</time>
            <span>Aula Magna · Campus Victoria, UdeSA</span>
          </div>

          {/* Título de la charla en blanco sobre fondo terciopelo */}
          <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.2rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            Presentación del club <span className="text-crimson">&</span> Tadeo Casiraghi
          </h2>

          {/* Subtítulo único: tema de investigación */}
          <p className="mt-3 font-mono text-[.95rem] sm:text-[1.1rem] text-crimson-text">
            “Cómo reemplazar un tobillo: entrando al mundo de las prótesis motorizadas”
          </p>

          {/* Layout asimétrico de sala de proyección */}
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
            {/* Fotografía editorial de la sesión (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <div
                onClick={() => onOpenTalk(latestPastTalk.slug, "gallery")}
                className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl bg-black border border-white/15 shadow-2xl"
              >
                {latestPastTalk.media[0] && (
                  <Image
                    src={latestPastTalk.media[0].src}
                    alt="Presentación de AIR Club en Aula Magna"
                    fill
                    priority
                    sizes="(min-width: 1024px) 720px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                )}
                {/* Epígrafe sobrio sobre la foto */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 text-white">
                  <span className="font-mono text-[.74rem] text-white/70">
                    {latestPastTalk.media.length} fotografías y registro en video
                  </span>
                  <span className="font-mono text-[.72rem] uppercase tracking-wider text-white underline underline-offset-4 decoration-crimson group-hover:text-crimson-text transition-colors">
                    Ver fotos →
                  </span>
                </div>
              </div>

              {/* Botones directos a las slides y fotos */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {latestPastTalk.slides && latestPastTalk.slides.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenTalk(latestPastTalk.slug, "slides")}
                    className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
                  >
                    <Presentation size={15} />
                    <span>Ver diapositivas (Slides)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenTalk(latestPastTalk.slug, "gallery")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  <Camera size={15} />
                  <span>Álbum de fotos</span>
                </button>
              </div>
            </div>

            {/* Ficha del orador y crónica directa (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Ficha de Tadeo Casiraghi con foto real de LinkedIn */}
                {latestPastTalk.speaker && (
                  <div className="flex items-center gap-4 border-b border-white/15 pb-5">
                    {latestPastTalk.speaker.avatar && (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-crimson shadow-md">
                        <Image
                          src={latestPastTalk.speaker.avatar}
                          alt={latestPastTalk.speaker.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[1.2rem] font-bold text-white leading-tight">
                        {latestPastTalk.speaker.name}
                      </h3>
                      <p className="font-mono text-[.8rem] text-crimson-text mt-0.5">
                        {latestPastTalk.speaker.role}
                      </p>
                      {latestPastTalk.speaker.affiliation && (
                        <p className="font-mono text-[.72rem] text-white/50 mt-0.5">
                          {latestPastTalk.speaker.affiliation}
                        </p>
                      )}
                      {latestPastTalk.speaker.linkedin && (
                        <a
                          href={latestPastTalk.speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 font-mono text-[.72rem] text-white/70 transition-colors hover:text-white"
                        >
                          <span>Perfil de LinkedIn</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Crónica directa y concisa sin relleno */}
                <div className="mt-6">
                  <p className="text-[.98rem] leading-[1.8] text-white/80">
                    Primer encuentro abierto de AIR Club ante más de 40 estudiantes, docentes e investigadores. Presentamos
                    los proyectos de robótica autónoma, el Challenge JAR 2026 y los avances de tesis de Tadeo Casiraghi sobre
                    diseño, actuadores y control biomecánico de prótesis activas de tobillo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* ===== PRÓXIMA CHARLA (CONCISA Y SIN FRASES DE MÁS) ===== */}
        {nextUpcomingTalk && (
          <section className="pt-10 md:pt-14">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-baseline">
              <div className="lg:col-span-4 font-mono text-[.78rem] uppercase tracking-[.18em] text-crimson-text font-semibold">
                Próxima Edición · {nextUpcomingTalk.dateLabel ?? "Octubre 2026"}
              </div>

              <div className="lg:col-span-8">
                <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-black uppercase leading-[1.05] tracking-tight text-white">
                  {nextUpcomingTalk.title}
                </h3>
                <p className="mt-3 text-[.96rem] leading-[1.7] text-white/70 max-w-[60ch]">
                  {nextUpcomingTalk.abstract}
                </p>

                {nextUpcomingTalk.cta && (
                  <div className="mt-5">
                    <a
                      href={nextUpcomingTalk.cta.url}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 font-mono text-[.74rem] font-semibold uppercase tracking-[.12em] text-white transition-colors hover:border-white hover:bg-white/10"
                    >
                      <span>{nextUpcomingTalk.cta.label}</span>
                      <ArrowRight size={13} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
