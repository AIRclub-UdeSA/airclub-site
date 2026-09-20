"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  X,
  Presentation,
  Camera,
  FileText,
  ExternalLink,
  Play,
  ArrowRight,
  User,
  Calendar,
  Layers,
} from "lucide-react";
import type { TimelineTalk } from "./TalksTimeline";
import { formatEventDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type FloatingWindowTab = "slides" | "gallery" | "overview";

interface TalkFloatingWindowProps {
  talk: TimelineTalk | null;
  isOpen: boolean;
  initialTab?: FloatingWindowTab;
  onClose: () => void;
}

const thumbOf = (m: TimelineTalk["media"][number]) => (m.type === "video" ? m.poster : m.src);

function TalkFloatingWindowContent({
  talk,
  initialTab,
  onClose,
}: {
  talk: TimelineTalk;
  initialTab: FloatingWindowTab;
  onClose: () => void;
}) {
  const slides = talk.slides ?? [];
  const initialResolvedTab: FloatingWindowTab =
    initialTab === "slides" && slides.length === 0
      ? talk.media && talk.media.length > 0
        ? "gallery"
        : "overview"
      : initialTab;

  const [activeTab, setActiveTab] = useState<FloatingWindowTab>(initialResolvedTab);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  const currentSlide = slides[activeSlideIndex] ?? slides[0];
  const currentMedia = talk.media?.[activeMediaIndex] ?? talk.media?.[0];
  const dateDisplay = talk.dateLabel ?? (talk.startsAt ? formatEventDate(new Date(talk.startsAt)) : "");

  return (
    <div
      className="relative z-10 flex h-[92vh] max-h-[860px] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] border border-border/90 bg-card shadow-2xl transition-all"
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px var(--border)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Barra superior de control y metadatos */}
      <header className="flex shrink-0 flex-wrap items-center justify-between border-b border-border bg-bg/80 px-5 py-3.5 backdrop-blur-sm sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-2 rounded-full bg-crimson shadow-[0_0_8px_rgba(164,12,76,0.8)]" />
          <span className="truncate font-mono text-[.72rem] font-semibold uppercase tracking-[.18em] text-crimson-text">
            AIR Talks Archivo
          </span>
          {dateDisplay && (
            <>
              <span className="text-border">/</span>
              <span className="hidden truncate font-mono text-[.7rem] uppercase tracking-wider text-text3 sm:inline">
                {dateDisplay}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[.68rem] text-text3 sm:inline">ESC para cerrar</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="flex size-8 items-center justify-center rounded-full border border-border text-text transition-colors hover:border-crimson hover:bg-crimson/10 hover:text-crimson"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Título y navegación por pestañas */}
      <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-bg2/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="min-w-0 flex-1">
          <h2
            id="talk-dialog-title"
            className="truncate font-display text-[clamp(1.15rem,2.2vw,1.5rem)] font-extrabold uppercase leading-tight tracking-tight text-text"
          >
            {talk.title}
          </h2>
          <p className="truncate font-mono text-[.78rem] text-text2">{talk.subtitle}</p>
        </div>

        {/* Selector de pestañas */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card p-1">
          {slides.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("slides")}
              className={cn(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[.72rem] font-semibold uppercase tracking-wider transition-all",
                activeTab === "slides"
                  ? "bg-crimson text-white shadow-sm"
                  : "text-text2 hover:text-text",
              )}
            >
              <Presentation size={14} />
              <span>Slides ({slides.length})</span>
            </button>
          )}

          {talk.media && talk.media.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={cn(
                "flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[.72rem] font-semibold uppercase tracking-wider transition-all",
                activeTab === "gallery"
                  ? "bg-crimson text-white shadow-sm"
                  : "text-text2 hover:text-text",
              )}
            >
              <Camera size={14} />
              <span>Fotos & Video ({talk.media.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[.72rem] font-semibold uppercase tracking-wider transition-all",
              activeTab === "overview"
                ? "bg-crimson text-white shadow-sm"
                : "text-text2 hover:text-text",
            )}
          >
            <FileText size={14} />
            <span>Resumen</span>
          </button>
        </div>
      </div>

      {/* Cuerpo principal interactivo con scroll interno */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {/* TAB 1: SLIDES EMBEBIDAS */}
        {activeTab === "slides" && (
          <div className="flex h-full flex-col">
            {slides.length > 1 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[.7rem] uppercase tracking-wider text-text3">
                  Presentaciones:
                </span>
                {slides.map((s, idx) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[.72rem] font-medium transition-all",
                      idx === activeSlideIndex
                        ? "border-crimson bg-crimson/10 text-crimson-text"
                        : "border-border text-text2 hover:border-border-h",
                    )}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {currentSlide ? (
              <div className="flex flex-1 flex-col">
                {/* Visor 16:9 con Google Slides embebidas */}
                <div className="relative aspect-[16/9] w-full flex-1 overflow-hidden rounded-xl border border-border bg-black shadow-inner">
                  <iframe
                    src={currentSlide.embedUrl}
                    title={currentSlide.title}
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Acciones de pie para slides */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-text2">
                    <Presentation size={15} className="text-crimson" />
                    <span className="font-mono text-[.78rem] font-medium">{currentSlide.title}</span>
                  </div>

                  <a
                    href={currentSlide.openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[.72rem] font-semibold uppercase tracking-wider text-text transition-colors hover:border-crimson hover:text-crimson-text"
                  >
                    Abrir en Google Slides <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
                <Presentation size={32} className="text-text3 mb-3" />
                <p className="font-mono text-[.82rem] text-text2">
                  No hay diapositivas digitalizadas cargadas para esta charla.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ÁLBUM FOTOGRÁFICO Y VIDEOS */}
        {activeTab === "gallery" && (
          <div className="flex flex-col gap-6">
            {currentMedia && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-black">
                {currentMedia.type === "video" ? (
                  <video
                    key={currentMedia.src}
                    src={currentMedia.src}
                    poster={currentMedia.poster}
                    controls
                    playsInline
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    key={currentMedia.src}
                    src={currentMedia.src}
                    alt={`Foto de ${talk.title}`}
                    fill
                    sizes="(min-width: 1024px) 960px, 100vw"
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            )}

            {/* Tira de miniaturas interactivas */}
            {talk.media && talk.media.length > 1 && (
              <div>
                <div className="mb-2 font-mono text-[.7rem] uppercase tracking-wider text-text3">
                  Archivo fotográfico ({talk.media.length} capturas)
                </div>
                <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 md:grid-cols-6">
                  {talk.media.map((m, idx) => (
                    <button
                      key={m.src}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      aria-label={`Ver captura ${idx + 1}`}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                        idx === activeMediaIndex
                          ? "border-crimson shadow-md ring-2 ring-crimson/30"
                          : "border-border opacity-70 hover:opacity-100",
                      )}
                    >
                      <Image src={thumbOf(m)} alt="" fill sizes="140px" className="object-cover" />
                      {m.type === "video" && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play size={16} className="fill-white text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESUMEN Y NARRATIVA TÉCNICA */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8 max-w-3xl">
            {/* Tarjeta de orador */}
            {talk.speaker ? (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg2/50 p-5 sm:flex-row sm:items-center sm:gap-6">
                {talk.speaker.avatar ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-crimson">
                    <Image
                      src={talk.speaker.avatar}
                      alt={talk.speaker.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-card text-text3">
                    <User size={24} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[.68rem] font-semibold uppercase tracking-[.16em] text-crimson-text">
                    Orador Invitado
                  </span>
                  <h3 className="font-display text-[1.2rem] font-bold text-text">
                    {talk.speaker.name}
                  </h3>
                  <p className="font-mono text-[.78rem] text-text2">{talk.speaker.role}</p>
                  {talk.speaker.affiliation && (
                    <p className="font-mono text-[.72rem] text-text3">{talk.speaker.affiliation}</p>
                  )}
                </div>
                {talk.speaker.linkedin && (
                  <a
                    href={talk.speaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[.72rem] font-semibold uppercase tracking-wider text-text transition-colors hover:border-crimson hover:text-crimson-text"
                  >
                    LinkedIn <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg2/40 p-4">
                <User size={18} className="text-text3" />
                <span className="font-mono text-[.8rem] text-text2">{talk.details}</span>
              </div>
            )}

            {/* Bitácora / Abstract narrativo */}
            <div>
              <h4 className="mb-3 font-mono text-[.74rem] font-semibold uppercase tracking-[.18em] text-crimson-text">
                Qué pasó en este encuentro
              </h4>
              <p className="text-[1rem] leading-[1.8] text-text2">{talk.abstract}</p>
            </div>

            {/* Enlaces y recursos */}
            {talk.links && talk.links.length > 0 && (
              <div>
                <h4 className="mb-3 font-mono text-[.74rem] font-semibold uppercase tracking-[.18em] text-text3">
                  Recursos & Enlaces
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {talk.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-mono text-[.74rem] font-semibold uppercase tracking-wider text-text transition-colors hover:border-crimson hover:text-crimson-text"
                    >
                      {link.label} <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTA directo */}
            {talk.cta && (
              <div className="pt-2">
                <a
                  href={talk.cta.url}
                  {...(talk.cta.url.startsWith("mailto:")
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
                >
                  {talk.cta.label} <ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barra inferior de estado del laboratorio */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border bg-bg/90 px-6 py-3 font-mono text-[.68rem] text-text3">
        <div className="flex items-center gap-2">
          <Layers size={13} />
          <span>AIR Club · Inteligencia Artificial y Robótica UdeSA</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={13} />
          <span>{dateDisplay}</span>
        </div>
      </footer>
    </div>
  );
}

export function TalkFloatingWindow({
  talk,
  isOpen,
  initialTab = "slides",
  onClose,
}: TalkFloatingWindowProps) {
  // Manejo de overflow y tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !talk) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="talk-dialog-title"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6 md:p-10 animate-fade-in"
    >
      {/* Fondo oscuro con desenfoque de laboratorio */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenido con key para inicialización de estado limpia y sin cascadas */}
      <TalkFloatingWindowContent
        key={`${talk.slug}:${initialTab}`}
        talk={talk}
        initialTab={initialTab}
        onClose={onClose}
      />
    </div>
  );
}
