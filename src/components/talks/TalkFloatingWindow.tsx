"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  X,
  Presentation,
  ExternalLink,
  Play,
} from "lucide-react";
import type { TimelineTalk } from "./TalksTimeline";
import { cn } from "@/lib/utils";

export type FloatingWindowTab = "slides" | "gallery" | "overview";

interface TalkFloatingWindowProps {
  talk: TimelineTalk | null;
  isOpen: boolean;
  initialTab?: FloatingWindowTab;
  onClose: () => void;
}

const thumbOf = (m: TimelineTalk["media"][number]) => (m.type === "video" ? m.poster : m.src);

function TalkViewerContent({
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

  return (
    <div className="flex flex-col h-full max-h-[92vh] w-full overflow-hidden">
      {/* Barra superior estilo ventana de laboratorio */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3.5 sm:px-6 bg-[#12060a]">
        {/* Controles y Título */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 pr-2">
            <span className="size-2.5 rounded-full bg-crimson" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
          </div>
          <span className="font-mono text-[.74rem] uppercase tracking-[.18em] text-crimson font-semibold">
            AIR Talks
          </span>
          <span className="text-white/20 hidden sm:inline">/</span>
          <h2 className="truncate font-display text-[.92rem] sm:text-[1.02rem] font-bold text-white max-w-[28ch] md:max-w-[40ch]">
            {talk.title}
          </h2>
        </div>

        {/* Selector de modo central: Slides / Fotos / Memoria */}
        <nav className="flex items-center gap-4 sm:gap-6 font-mono text-[.76rem] uppercase tracking-wider">
          {slides.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("slides")}
              className={cn(
                "pb-1 transition-all",
                activeTab === "slides"
                  ? "text-white border-b-2 border-crimson font-semibold"
                  : "text-white/60 hover:text-white border-b-2 border-transparent",
              )}
            >
              Slides ({slides.length})
            </button>
          )}

          {talk.media && talk.media.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={cn(
                "pb-1 transition-all",
                activeTab === "gallery"
                  ? "text-white border-b-2 border-crimson font-semibold"
                  : "text-white/60 hover:text-white border-b-2 border-transparent",
              )}
            >
              Fotos ({talk.media.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "pb-1 transition-all",
              activeTab === "overview"
                ? "text-white border-b-2 border-crimson font-semibold"
                : "text-white/60 hover:text-white border-b-2 border-transparent",
            )}
          >
            Memoria
          </button>
        </nav>

        {/* Botón de cierre */}
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[.68rem] text-white/40 md:inline">ESC</span>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Área de contenido interactivo */}
      <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 bg-[#0c0407]">
        {/* VISTA 1: DIAPOSITIVAS INTERACTIVAS */}
        {activeTab === "slides" && (
          <div className="flex h-full w-full max-w-4xl flex-col items-center justify-center">
            {/* Selector de diapositivas si hay múltiples mazos */}
            {slides.length > 1 && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[.72rem] uppercase tracking-wider text-white/50">
                  Deck:
                </span>
                {slides.map((s, idx) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={cn(
                      "rounded-full px-3.5 py-1 font-mono text-[.72rem] transition-all",
                      idx === activeSlideIndex
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "border border-white/20 text-white/70 hover:border-white/60 hover:text-white",
                    )}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {currentSlide ? (
              <div className="flex w-full flex-col">
                {/* Pantalla 16:9 ajustada a la ventana */}
                <div className="relative aspect-[16/9] w-full max-h-[58vh] overflow-hidden rounded-xl bg-black shadow-xl border border-white/15">
                  <iframe
                    src={currentSlide.embedUrl}
                    title={currentSlide.title}
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Barra inferior del visor de slides */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[.74rem] text-white/60">
                  <div className="flex items-center gap-2 text-white/90">
                    <Presentation size={14} className="text-crimson" />
                    <span>{currentSlide.title}</span>
                  </div>

                  <a
                    href={currentSlide.openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white"
                  >
                    <span>Abrir en Google Slides a pantalla completa</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-center font-mono text-white/60">
                <p>No hay diapositivas disponibles para esta sesión.</p>
              </div>
            )}
          </div>
        )}

        {/* VISTA 2: ÁLBUM FOTOGRÁFICO & VIDEO */}
        {activeTab === "gallery" && (
          <div className="flex h-full w-full max-w-4xl flex-col items-center justify-between gap-4">
            {currentMedia && (
              <div className="relative aspect-[16/10] w-full max-h-[54vh] overflow-hidden rounded-xl bg-black border border-white/15">
                {currentMedia.type === "video" ? (
                  <video
                    key={currentMedia.src}
                    src={currentMedia.src}
                    poster={currentMedia.poster}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    key={currentMedia.src}
                    src={currentMedia.src}
                    alt={talk.title}
                    fill
                    sizes="(min-width: 1024px) 1000px, 100vw"
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            )}

            {/* Tira de miniaturas */}
            {talk.media && talk.media.length > 1 && (
              <div className="w-full">
                <div className="flex gap-2.5 overflow-x-auto justify-center py-1">
                  {talk.media.map((m, idx) => (
                    <button
                      key={m.src}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      className={cn(
                        "relative h-14 w-22 shrink-0 overflow-hidden rounded-md border transition-all",
                        idx === activeMediaIndex
                          ? "border-crimson opacity-100 ring-2 ring-crimson"
                          : "border-white/20 opacity-50 hover:opacity-90",
                      )}
                    >
                      <Image src={thumbOf(m)} alt="" fill sizes="100px" className="object-cover" />
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

        {/* VISTA 3: MEMORIA Y CRÓNICA TÉCNICA */}
        {activeTab === "overview" && (
          <div className="flex w-full max-w-3xl flex-col gap-8 py-6">
            {/* Orador */}
            {talk.speaker && (
              <div className="flex items-center gap-6 border-b border-white/10 pb-6">
                {talk.speaker.avatar && (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-crimson">
                    <Image
                      src={talk.speaker.avatar}
                      alt={talk.speaker.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-display text-[1.4rem] font-bold text-white">
                    {talk.speaker.name}
                  </h3>
                  <p className="font-mono text-[.82rem] text-crimson mt-0.5">
                    {talk.speaker.role}
                  </p>
                  {talk.speaker.affiliation && (
                    <p className="font-mono text-[.76rem] text-white/50 mt-1">
                      {talk.speaker.affiliation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Crónica */}
            <div>
              <h4 className="font-mono text-[.76rem] uppercase tracking-wider text-crimson mb-3">
                Resumen de la sesión
              </h4>
              <p className="text-[1.1rem] leading-[1.85] text-white/80">
                {talk.abstract}
              </p>
            </div>

            {/* Documentos */}
            {talk.links && talk.links.length > 0 && (
              <div className="border-t border-white/10 pt-6">
                <h4 className="font-mono text-[.74rem] uppercase tracking-wider text-white/50 mb-3">
                  Documentos y Enlaces
                </h4>
                <div className="flex flex-wrap gap-4">
                  {talk.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 font-mono text-[.76rem] uppercase tracking-wider text-white hover:border-crimson hover:text-crimson transition-colors"
                    >
                      <span>{link.label}</span>
                      <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export function TalkFloatingWindow({
  talk,
  isOpen,
  initialTab = "slides",
  onClose,
}: TalkFloatingWindowProps) {
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
      aria-label={talk.title}
      className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6 md:p-8 animate-fade-in"
    >
      {/* Backdrop con desenfoque que cierra al hacer clic fuera */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Ventana flotante de laboratorio */}
      <div className="relative z-10 flex w-full max-w-5xl max-h-[92vh] flex-col rounded-2xl border border-white/15 bg-[#0c0407] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        <TalkViewerContent
          key={`${talk.slug}:${initialTab}`}
          talk={talk}
          initialTab={initialTab}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
