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
    <div className="mx-auto max-w-7xl px-6 pt-4 pb-20 sm:px-8 md:px-12 md:pb-28">
      {/* ===== MÓDULO HERO EDITORIAL: ÚLTIMA CHARLA REALIZADA ===== */}
      <article className="border-b border-border/80 pb-16 md:pb-24">
        {/* Metadatos tipográficos limpios sin cajitas ni micro-tags */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono text-[.82rem] text-text3">
          <time dateTime="2026-09-03">Jueves 3 de septiembre, 2026</time>
          <span>Aula Magna · Campus Victoria, UdeSA</span>
        </div>

        {/* Título de afiche monumental */}
        <h2 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-black uppercase leading-[0.95] tracking-tight text-text">
          Presentación del club <span className="text-crimson">&</span> Tadeo Casiraghi
        </h2>
        <p className="mt-4 font-display text-[clamp(1.1rem,2vw,1.5rem)] font-bold text-text2 max-w-[58ch]">
          &ldquo;Cómo reemplazar un tobillo: entrando al mundo de las prótesis motorizadas&rdquo;
        </p>

        {/* Layout asimétrico de afiche gráfico */}
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Fotografía editorial real de la jornada (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              onClick={() => onOpenTalk(latestPastTalk.slug, "gallery")}
              className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-black shadow-lg"
            >
              {latestPastTalk.media[0] && (
                <Image
                  src={latestPastTalk.media[0].src}
                  alt="Presentación de AIR Club y charla de Tadeo Casiraghi"
                  fill
                  priority
                  sizes="(min-width: 1024px) 720px, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              )}
              {/* Barra inferior sobria sobre la foto */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 text-white">
                <span className="font-mono text-[.76rem] tracking-wider text-slate-200">
                  {latestPastTalk.media.length} fotografías y registro en video
                </span>
                <span className="font-mono text-[.74rem] uppercase tracking-wider text-white underline underline-offset-4 decoration-crimson group-hover:text-rose transition-colors">
                  Ver álbum completo →
                </span>
              </div>
            </div>

            {/* Acciones directas debajo de la foto */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {latestPastTalk.slides && latestPastTalk.slides.length > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenTalk(latestPastTalk.slug, "slides")}
                  className="inline-flex items-center gap-2.5 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.8rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
                >
                  <Presentation size={16} />
                  <span>Ver diapositivas (Slides)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenTalk(latestPastTalk.slug, "gallery")}
                className="inline-flex items-center gap-2.5 rounded-full border border-text px-6 py-3.5 font-mono text-[.8rem] font-semibold uppercase tracking-[.14em] text-text transition-colors hover:border-crimson hover:text-crimson-text"
              >
                <Camera size={16} />
                <span>Álbum de fotos</span>
              </button>
            </div>
          </div>

          {/* Relato del encuentro y orador (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Ficha del orador con su foto real de LinkedIn */}
              {latestPastTalk.speaker && (
                <div className="flex items-center gap-5 border-b border-border/80 pb-6">
                  {latestPastTalk.speaker.avatar && (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-crimson/80 shadow-md">
                      <Image
                        src={latestPastTalk.speaker.avatar}
                        alt={latestPastTalk.speaker.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[1.35rem] font-bold text-text leading-tight">
                      {latestPastTalk.speaker.name}
                    </h3>
                    <p className="font-mono text-[.82rem] text-crimson-text mt-0.5">
                      {latestPastTalk.speaker.role}
                    </p>
                    {latestPastTalk.speaker.affiliation && (
                      <p className="font-mono text-[.74rem] text-text3 mt-1">
                        {latestPastTalk.speaker.affiliation}
                      </p>
                    )}
                    {latestPastTalk.speaker.linkedin && (
                      <a
                        href={latestPastTalk.speaker.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 font-mono text-[.74rem] text-text2 transition-colors hover:text-crimson-text"
                      >
                        <span>Perfil de LinkedIn</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Narrativa de la jornada */}
              <div className="mt-8">
                <p className="text-[1.05rem] leading-[1.85] text-text2">
                  Primer encuentro abierto de AIR Club ante más de 40 estudiantes, docentes e investigadores. Presentamos
                  la visión del club, los proyectos de robótica autónoma y el lanzamiento del{" "}
                  <strong className="text-text font-semibold">Challenge JAR 2026</strong>.
                </p>
                <p className="mt-4 text-[1.05rem] leading-[1.85] text-text2">
                  En la charla técnica, Tadeo Casiraghi expuso los avances de su tesis doctoral en el LINAR sobre el diseño,
                  control biomecánico y actuadores necesarios para reemplazar un tobillo humano con prótesis activas.
                </p>
              </div>

              {/* Enlaces de consulta rápida */}
              {latestPastTalk.links && latestPastTalk.links.length > 0 && (
                <div className="mt-8 border-t border-border/80 pt-6">
                  <div className="font-mono text-[.74rem] uppercase tracking-wider text-text3 mb-3">
                    Documentación de la charla
                  </div>
                  <ul className="flex flex-col gap-2">
                    {latestPastTalk.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 font-mono text-[.84rem] text-text transition-colors hover:text-crimson-text"
                        >
                          <span className="underline underline-offset-4 decoration-border group-hover:decoration-crimson">
                            {l.label}
                          </span>
                          <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* ===== MÓDULO EDITORIAL: PRÓXIMA CHARLA ===== */}
      {nextUpcomingTalk && (
        <section className="pt-16 md:pt-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-baseline">
            <div className="lg:col-span-4 font-mono text-[.84rem] uppercase tracking-[.18em] text-crimson-text">
              Próxima Edición · Octubre 2026
            </div>

            <div className="lg:col-span-8">
              <h3 className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-black uppercase leading-[1.05] tracking-tight text-text">
                {nextUpcomingTalk.title}
              </h3>
              <p className="mt-2 font-mono text-[.9rem] text-text2 font-semibold">
                {nextUpcomingTalk.subtitle}
              </p>
              <p className="mt-4 text-[1.02rem] leading-[1.8] text-text2 max-w-[65ch]">
                {nextUpcomingTalk.abstract}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="font-mono text-[.8rem] text-text3">
                  Fecha estimada: {nextUpcomingTalk.dateLabel ?? "Semana del 12 al 16 de octubre"}
                </span>

                {nextUpcomingTalk.cta && (
                  <a
                    href={nextUpcomingTalk.cta.url}
                    className="inline-flex items-center gap-2 rounded-full border border-text px-5 py-2.5 font-mono text-[.76rem] font-semibold uppercase tracking-[.12em] text-text transition-colors hover:border-crimson hover:text-crimson-text"
                  >
                    <span>{nextUpcomingTalk.cta.label}</span>
                    <ArrowRight size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
