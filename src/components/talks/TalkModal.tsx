"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, X } from "lucide-react";
import { LinkedinIcon } from "@/components/equipo/SocialIcons";
import type { TimelineTalk } from "./TalksTimeline";
import { TalkSlideshow } from "./TalkSlideshow";
import { talkCover, talkDateParts, talkDateText } from "@/lib/talk-format";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export type TalkSection = "overview" | "slides" | "recording";

interface TalkModalProps {
  talk: TimelineTalk | null;
  talks: TimelineTalk[];
  isOpen: boolean;
  initialSection?: TalkSection;
  onClose: () => void;
  onSelectTalk: (slug: string, section?: TalkSection) => void;
}

// Coincide con la duración de la animación de salida en globals.css (.talk-modal[data-closing]).
const CLOSE_MS = 200;

const LABEL = "font-mono text-[.74rem] uppercase tracking-[.14em] text-text3";
const TEXT_LINK =
  "inline-flex items-center gap-1.5 font-mono text-[.76rem] uppercase tracking-[.12em] text-crimson-text underline decoration-crimson-text/40 underline-offset-[6px] transition-colors hover:decoration-crimson-text";

export function TalkModal({
  talk,
  talks,
  isOpen,
  initialSection = "overview",
  onClose,
  onSelectTalk,
}: TalkModalProps) {
  const [activeSection, setActiveSection] = useState<TalkSection>(initialSection);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [prevSlug, setPrevSlug] = useState(talk?.slug);
  const [prevInitialSection, setPrevInitialSection] = useState(initialSection);
  const [closing, setClosing] = useState(false);
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  // Sincronizar sección inicial durante el render cuando cambian las props
  if (talk?.slug !== prevSlug || initialSection !== prevInitialSection) {
    setPrevSlug(talk?.slug);
    setPrevInitialSection(initialSection);
    setActiveSection(initialSection);
    setActiveSlideIndex(0);
  }

  const visible = isOpen && talk !== null;
  const currentIndex = talk ? talks.findIndex((t) => t.slug === talk.slug) : -1;
  const prevTalk = currentIndex > 0 ? talks[currentIndex - 1] : null;
  const nextTalk = currentIndex >= 0 && currentIndex < talks.length - 1 ? talks[currentIndex + 1] : null;

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => {
      dialogRef.current?.close(); // al cerrar, el navegador devuelve el foco a quien abrió el modal
      closingRef.current = false;
      setClosing(false);
      onClose();
    }, CLOSE_MS);
  };

  // <dialog> modal: foco atrapado, Escape y fondo inerte los resuelve el navegador.
  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      if (dialog.open) dialog.close();
    };
  }, [visible]);

  // Flechas izquierda/derecha: saltar entre charlas (sin animación: es una acción de teclado).
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevTalk) onSelectTalk(prevTalk.slug, "overview");
      if (e.key === "ArrowRight" && nextTalk) onSelectTalk(nextTalk.slug, "overview");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, prevTalk, nextTalk, onSelectTalk]);

  // Al cambiar de charla, volver al tope del modal
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [talk?.slug]);

  if (!visible || !talk) return null;

  const slides = talk.slides ?? [];
  const currentSlide = slides[activeSlideIndex] ?? slides[0];
  const youtubeEmbedUrl = talk.recordingUrl ? getYoutubeEmbedUrl(talk.recordingUrl) : null;

  const upcoming = Boolean(talk.isUpcoming);
  const hasSlides = slides.length > 0;
  const hasRecording = Boolean(youtubeEmbedUrl);
  const hasPhotos = talk.media.length > 0;

  // Nunca dejar una sección en blanco si no existe para esta charla
  const section: TalkSection = (() => {
    if (upcoming) return "overview";
    if (activeSection === "slides" && !hasSlides) return "overview";
    if (activeSection === "recording" && !hasRecording) return "overview";
    return activeSection;
  })();

  const tabs: { id: TalkSection; label: string }[] = [
    { id: "overview", label: "Resumen" },
    ...(hasSlides ? [{ id: "slides" as const, label: "Diapositivas" }] : []),
    ...(hasRecording ? [{ id: "recording" as const, label: "Video" }] : []),
  ];

  const cover = talkCover(talk.media);
  const date = talkDateParts(talk.startsAt, talk.endsAt);

  const dateOverlay = date && (
    <div className="flex items-end gap-4">
      <time dateTime={talk.startsAt?.slice(0, 10)} className="font-logo text-[5.5rem] leading-[0.8]">
        {date.day}
      </time>
      <span className="pb-1 font-mono text-[.78rem] uppercase leading-snug tracking-[.14em]">
        <span className="block">{date.monthLong}</span>
        <span className="block">{date.year}</span>
      </span>
    </div>
  );

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-closing={closing}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      className="talk-modal m-0 h-dvh max-h-none w-dvw max-w-none items-center justify-center overflow-hidden bg-transparent p-0 text-text open:flex"
    >
      <div className="talk-modal-panel relative flex max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),62rem)] flex-col overflow-hidden border border-border-strong/30 bg-bg max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:border-0">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-3 sm:px-8">
          <p className={LABEL}>
            AIR Talks
            <span className="ml-3 text-text">{talk.subtitle}</span>
          </p>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Cerrar detalle de la charla"
            className="flex size-11 cursor-pointer items-center justify-center border border-border-strong/30 text-text transition-colors hover:border-text hover:bg-bg2"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {section === "overview" &&
            (!upcoming && hasPhotos ? (
              <TalkSlideshow key={talk.slug} media={talk.media} title={talk.title} overlay={dateOverlay} />
            ) : (
              <div
                className={cn(
                  "relative aspect-[16/9] w-full overflow-hidden sm:aspect-[3/1]",
                  !upcoming && cover && "bg-[#140a0e] text-white",
                  !upcoming && !cover && "bg-bg2 text-text",
                  upcoming && talk.confirmed && "bg-crimson text-white",
                  upcoming && !talk.confirmed && "talk-hatch bg-card text-text",
                )}
              >
                <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-8">{dateOverlay}</div>
              </div>
            ))}

          <div className="px-5 pb-12 pt-8 sm:px-8 lg:px-12">
            <h2
              id={titleId}
              className="max-w-[30ch] text-balance font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold leading-[1.08] tracking-tight"
            >
              {talk.title}
            </h2>
            {section === "overview" && talk.topic && (
              <p className="mt-3 font-body text-[1.12rem] font-light italic leading-relaxed text-mauve">
                “{talk.topic}”
              </p>
            )}

            {!upcoming && tabs.length > 1 && (
              <nav
                aria-label="Secciones de la charla"
                className="mt-7 flex gap-7 overflow-x-auto overflow-y-hidden border-b border-border"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    aria-current={section === tab.id ? "true" : undefined}
                    onClick={() => {
                      setActiveSection(tab.id);
                      setActiveSlideIndex(0);
                    }}
                    className={cn(
                      "relative shrink-0 cursor-pointer pb-3 font-mono text-[.78rem] uppercase tracking-[.14em] transition-colors",
                      "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-crimson after:transition-opacity",
                      section === tab.id
                        ? "text-text after:opacity-100"
                        : "text-text3 after:opacity-0 hover:text-text",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            )}

            {/* RESUMEN: datos y orador a la izquierda, texto a la derecha */}
            {section === "overview" && (
              <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
                <div className="space-y-8">
                  <dl className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2.5 text-[.98rem]">
                    <dt className={cn(LABEL, "pt-0.5")}>Fecha</dt>
                    <dd className="font-medium">{talkDateText(talk.startsAt, talk.dateLabel)}</dd>
                    {talk.location && (
                      <>
                        <dt className={cn(LABEL, "pt-0.5")}>Lugar</dt>
                        <dd>{talk.location}</dd>
                      </>
                    )}
                    {upcoming && (
                      <>
                        <dt className={cn(LABEL, "pt-0.5")}>Estado</dt>
                        <dd className={talk.confirmed ? "font-semibold text-crimson-text" : "text-text2"}>
                          {talk.confirmed ? "Confirmada" : "A confirmar"}
                        </dd>
                      </>
                    )}
                  </dl>

                  {talk.speaker ? (
                    <div className="border-t border-border pt-7">
                      {talk.speaker.avatar ? (
                        <span className="relative block size-16 overflow-hidden rounded-full">
                          <Image src={talk.speaker.avatar} alt="" fill sizes="64px" className="object-cover" />
                        </span>
                      ) : (
                        <span className="flex size-16 items-center justify-center rounded-full bg-bg2 font-mono text-lg font-bold text-text3">
                          {talk.speaker.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <p className="mt-4 font-display text-[1.2rem] font-bold leading-tight">{talk.speaker.name}</p>
                      <p className="mt-1 text-[.95rem] text-text2">{talk.speaker.role}</p>
                      {talk.speaker.affiliation && (
                        <p className="mt-0.5 text-[.88rem] text-text3">{talk.speaker.affiliation}</p>
                      )}
                      {talk.speaker.linkedin && (
                        <a
                          href={talk.speaker.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(TEXT_LINK, "mt-3 text-text2 decoration-text/25 hover:text-crimson-text")}
                        >
                          <LinkedinIcon className="size-3.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  ) : upcoming ? (
                    <p className="border-t border-border pt-7 text-[.95rem] italic text-text3">
                      Orador o equipo de investigación por confirmar en breve.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-8">
                  {upcoming && talk.cta && (
                    <div className="bg-crimson p-6 text-white">
                      <p className="font-display text-[1.15rem] font-bold">Confirmación de asistencia</p>
                      <p className="mt-1.5 text-[.95rem] leading-relaxed text-white/85">
                        Capacidad limitada por cupo en aula. Confirmá tu asistencia con anticipación.
                      </p>
                      <a
                        href={talk.cta.url}
                        className="mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-crimson transition-colors hover:bg-[#f5e8ec]"
                      >
                        <span>{talk.cta.label}</span>
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    </div>
                  )}

                  <div className="space-y-4 font-body text-[1.04rem] leading-[1.85] text-text2">
                    {talk.abstract.split("\n\n").map((paragraph, idx) => (
                      <p key={idx} className="max-w-[64ch]">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {talk.links && talk.links.length > 0 && (
                    <ul className="divide-y divide-border border-y border-border">
                      {talk.links.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between gap-4 py-3.5 text-[.98rem] text-text transition-colors hover:text-crimson-text"
                          >
                            <span>{link.label}</span>
                            <ExternalLink
                              size={15}
                              aria-hidden="true"
                              className="shrink-0 text-text3 transition-colors group-hover:text-crimson-text"
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* DIAPOSITIVAS */}
            {section === "slides" && (
              <div className="mt-8 space-y-4">
                {slides.length > 1 && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {slides.map((s, idx) => (
                      <button
                        key={s.title}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        aria-current={idx === activeSlideIndex ? "true" : undefined}
                        className={cn(
                          "cursor-pointer text-left text-[.95rem] underline-offset-[6px] transition-colors",
                          idx === activeSlideIndex
                            ? "font-semibold text-text underline decoration-crimson decoration-2"
                            : "text-text3 hover:text-text",
                        )}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}
                {currentSlide && (
                  <>
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <iframe
                        src={currentSlide.embedUrl}
                        title={currentSlide.title}
                        className="h-full w-full border-0"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    <a href={currentSlide.openUrl} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
                      Abrir a pantalla completa
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </>
                )}
              </div>
            )}

            {/* GRABACIÓN */}
            {section === "recording" && talk.recordingUrl && (
              <div className="mt-8 space-y-4">
                {youtubeEmbedUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <iframe
                      src={youtubeEmbedUrl}
                      title="Grabación de la charla"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                )}
                <a href={talk.recordingUrl} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
                  Ver en YouTube
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            )}

            {(prevTalk || nextTalk) && (
              <nav aria-label="Otras charlas" className="mt-14 grid gap-px bg-border sm:grid-cols-2">
                {prevTalk ? (
                  <NeighbourButton
                    direction="prev"
                    talk={prevTalk}
                    onClick={() => onSelectTalk(prevTalk.slug, "overview")}
                  />
                ) : (
                  <span className="hidden bg-bg sm:block" />
                )}
                {nextTalk ? (
                  <NeighbourButton
                    direction="next"
                    talk={nextTalk}
                    onClick={() => onSelectTalk(nextTalk.slug, "overview")}
                  />
                ) : (
                  <span className="hidden bg-bg sm:block" />
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

function NeighbourButton({
  direction,
  talk,
  onClick,
}: {
  direction: "prev" | "next";
  talk: TimelineTalk;
  onClick: () => void;
}) {
  const date = talkDateParts(talk.startsAt, talk.endsAt);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex cursor-pointer flex-col gap-1.5 bg-bg p-5 transition-colors hover:bg-bg2",
        direction === "next" && "sm:items-end sm:text-right",
      )}
    >
      <span className="inline-flex items-center gap-2 font-mono text-[.72rem] uppercase tracking-[.14em] text-text3">
        {direction === "prev" && <ArrowLeft size={14} aria-hidden="true" />}
        {direction === "prev" ? "Anterior" : "Siguiente"}
        {date && <span>{`${date.day} ${date.monthShort}`}</span>}
        {direction === "next" && <ArrowRight size={14} aria-hidden="true" />}
      </span>
      <span className="line-clamp-2 font-display text-[1.02rem] font-bold leading-snug transition-colors group-hover:text-crimson-text">
        {talk.title}
      </span>
    </button>
  );
}
