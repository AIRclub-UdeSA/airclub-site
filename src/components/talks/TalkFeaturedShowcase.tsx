"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Presentation, Camera, ArrowRight, ExternalLink } from "lucide-react";
import type { TimelineTalk } from "./TalksTimeline";
import type { FloatingWindowTab } from "./TalkFloatingWindow";

const ShaderGradientBg = dynamic(
  () => import("../home/ShaderGradientBg").then((mod) => mod.ShaderGradientBg),
  { ssr: false }
);

interface TalkFeaturedShowcaseProps {
  latestPastTalk?: TimelineTalk;
  nextUpcomingTalk?: TimelineTalk;
  onOpenTalk: (slug: string, tab?: FloatingWindowTab) => void;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

function formatFeaturedDate(iso?: string, dateLabel?: string) {
  if (dateLabel) return dateLabel;
  if (!iso) return "Fecha a confirmar";
  try {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, "0");
    const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(d);
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${day} de ${capitalizedMonth}, ${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

export function TalkFeaturedShowcase({
  latestPastTalk,
  nextUpcomingTalk,
  onOpenTalk,
}: TalkFeaturedShowcaseProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const mediaList = latestPastTalk?.media ?? [];

  // Rotación automática cada 4.5 segundos, pausando en hover o con reduced-motion
  useEffect(() => {
    if (mediaList.length <= 1 || isHovered || reducedMotion) return;
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [mediaList.length, isHovered, reducedMotion]);

  if (!latestPastTalk) return null;

  const activeMedia = mediaList[currentMediaIndex] ?? mediaList[0];

  return (
    <section className="relative overflow-hidden my-6 sm:my-10 bg-[#0e0407] text-[#f5e8ec] py-10 sm:py-14 md:py-18 shadow-2xl">
      {/* Fondo inmersivo 3D ShaderGradient de Challenge JAR */}
      <ShaderGradientBg />

      <div className="relative z-10 w-full px-4 sm:px-8 md:px-12">
        {/* ===== MÓDULO AUDITORIO DARK VELVET: ÚLTIMA CHARLA REALIZADA ===== */}
        <article className="border-b border-white/10 pb-12 md:pb-16">
          {/* Metadatos en JetBrains Mono sobrio que van de borde a borde */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono text-[.8rem] uppercase tracking-[.16em] text-white/40">
            <time dateTime={latestPastTalk.startsAt?.slice(0, 10)}>
              {formatFeaturedDate(latestPastTalk.startsAt, latestPastTalk.dateLabel)}
            </time>
            <span>{latestPastTalk.location ?? "Campus Victoria, UdeSA"}</span>
          </div>

          {/* Título de la charla en Syne aprovechando el ancho disponible */}
          <h2 className="mt-4 font-display text-[clamp(2rem,3.8vw,3.6rem)] font-bold tracking-tight text-white leading-[1.08]">
            {latestPastTalk.title}
          </h2>

          {/* Subtítulo o tema en Outfit cursiva elegante */}
          {(latestPastTalk.topic || latestPastTalk.subtitle) && (
            <p className="mt-2.5 font-body text-[1.05rem] sm:text-[1.2rem] text-rose/90 font-light italic leading-relaxed">
              “{latestPastTalk.topic ?? latestPastTalk.subtitle}”
            </p>
          )}

          {/* Layout cinematográfico de ancho completo */}
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 xl:gap-16 items-start">
            {/* Fotografía editorial de la sesión (7 cols en lg, 8 cols en xl) */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
              <div
                onClick={() => onOpenTalk(latestPastTalk.slug, "gallery")}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl bg-black border border-white/15 shadow-2xl"
              >
                {activeMedia && (
                  activeMedia.type === "image" ? (
                    <Image
                      key={activeMedia.src}
                      src={activeMedia.src}
                      alt={`${latestPastTalk.title} — registro ${currentMediaIndex + 1}`}
                      fill
                      priority={currentMediaIndex === 0}
                      sizes="(min-width: 1280px) 68vw, (min-width: 1024px) 60vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <video
                      key={activeMedia.src}
                      src={activeMedia.src}
                      poster={activeMedia.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  )
                )}

                {/* Indicadores sutiles de progreso si hay más de 1 medio */}
                {mediaList.length > 1 && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 border border-white/15 backdrop-blur-sm">
                    {mediaList.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentMediaIndex(idx);
                        }}
                        aria-label={`Ver foto/video ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentMediaIndex
                            ? "w-4 bg-crimson"
                            : "w-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                )}
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
                    <span>Ver diapositivas</span>
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

            {/* Ficha del orador y crónica directa (5 cols en lg, 4 cols en xl) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between">
              <div>
                {/* Ficha de orador */}
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

                {/* Crónica o resumen de la charla */}
                {latestPastTalk.abstract && (
                  <div className="mt-6">
                    <p className="text-[.98rem] leading-[1.8] text-white/80 max-w-xl">
                      {latestPastTalk.abstract}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* ===== PRÓXIMA CHARLA (CONCISA Y SIN FRASES DE MÁS) ===== */}
        {nextUpcomingTalk && (
          <section className="pt-10 md:pt-14">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-baseline">
              <div className="lg:col-span-4 xl:col-span-3 font-mono text-[.78rem] uppercase tracking-[.18em] text-crimson-text font-semibold">
                Próxima Edición · {nextUpcomingTalk.dateLabel ?? "Octubre 2026"}
              </div>

              <div className="lg:col-span-8 xl:col-span-9">
                <h3 className="font-display text-[clamp(1.5rem,2.8vw,2.2rem)] font-bold leading-[1.1] tracking-tight text-white">
                  {nextUpcomingTalk.title}
                </h3>
                <p className="mt-3 text-[.96rem] leading-[1.7] text-white/70 max-w-[75ch]">
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
    </section>
  );
}
