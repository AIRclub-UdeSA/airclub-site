"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Play, Presentation, Camera, X } from "lucide-react";
import { formatEventDate } from "@/lib/dates";
import type { TalkMedia, TalkSlide, TalkSpeaker } from "@/lib/talks";
import type { FloatingWindowTab } from "./TalkFloatingWindow";
import { TiltCard } from "@/components/shared/TiltCard";
import { cn } from "@/lib/utils";

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

// Ancla invisible entre la última charla pasada y la próxima; "Volver a hoy" centra en ella.
const TODAY_ID = "__hoy__";
// Ancho de una tarjeta del eje en desktop (incluye su gutter); define el paso del desenfoque.
const CARD_STEP = 400;
// Distancia (en "pasos" de tarjeta) hasta la que una charla se ve nítida.
const SHARP_RADIUS = 1.4;

function shortDate(iso: string) {
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

const thumbOf = (m: TalkMedia) => (m.type === "video" ? m.poster : m.src);

function Photo({ talk, className, sizes }: { talk: TimelineTalk; className?: string; sizes: string }) {
  const first = talk.media[0];
  const src = first && thumbOf(first);
  return (
    <div className={cn("relative overflow-hidden border border-border/80 bg-card-muted", className)}>
      {src ? (
        <Image src={src} alt={`Foto de ${talk.title}`} fill sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(135deg,transparent_0_10px,var(--border)_10px_11px)]">
          <span className="font-display text-6xl font-extrabold text-mauve">{talk.placeholder ?? "?"}</span>
        </div>
      )}
    </div>
  );
}

// Visor: el elemento elegido en grande y una tira de miniaturas debajo para cambiar.
function MediaGallery({ media, title }: { media: TalkMedia[]; title: string }) {
  const [index, setIndex] = useState(0);
  const current = media[index];
  if (!current) return null;
  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border/80 bg-card-muted">
        {current.type === "video" ? (
          <video
            key={current.src}
            src={current.src}
            poster={current.poster}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <Image
            key={current.src}
            src={current.src}
            alt={`Foto de la charla: ${title}`}
            fill
            sizes="(min-width: 640px) 540px, 100vw"
            className="object-cover"
          />
        )}
      </div>
      {media.length > 1 && (
        <div
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.min(media.length, 5)}, minmax(0, 1fr))` }}
        >
          {media.map((m, i) => (
            <button
              key={m.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${m.type === "video" ? "Ver video" : "Ver foto"} ${i + 1} de ${media.length}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-[1.5px] transition-all duration-200",
                i === index ? "border-crimson" : "border-border opacity-70 hover:border-border-h hover:opacity-100",
              )}
            >
              <Image src={thumbOf(m)} alt="" fill sizes="110px" className="object-cover" />
              {m.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={18} className="fill-white text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Entrada escalonada de cada bloque del detalle (ver .talk-rise en globals.css).
const rise = (i: number) => ({ "--d": `${120 + i * 70}ms` }) as React.CSSProperties;

function TalkDetail({ talk }: { talk: TimelineTalk }) {
  const links = talk.links ?? [];

  return (
    <div className="flex flex-col">
      <div className="talk-rise" style={rise(0)}>
        {talk.media.length > 0 ? (
          <MediaGallery media={talk.media} title={talk.title} />
        ) : (
          <Photo talk={talk} className="aspect-[4/3] w-full rounded-card" sizes="(min-width: 640px) 540px, 100vw" />
        )}
      </div>
      <div
        className="talk-rise mb-4 mt-7 font-mono text-[.74rem] font-semibold uppercase tracking-[.18em] text-crimson-text"
        style={rise(1)}
      >
        {talk.dateLabel ?? (talk.startsAt ? formatEventDate(new Date(talk.startsAt)) : "")}
      </div>
      <h3
        className="talk-rise mb-4 font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-black uppercase leading-[1.05] tracking-tight text-text"
        style={rise(2)}
      >
        {talk.title}
      </h3>
      <div className="talk-rise" style={rise(3)}>
        <p className="mb-1 font-mono text-[.82rem] font-semibold text-text">{talk.subtitle}</p>
        <p className="mb-5 font-mono text-[.72rem] text-text3">{talk.details}</p>
      </div>
      <p className="talk-rise mb-7 text-[.95rem] leading-[1.75] text-text2" style={rise(4)}>
        {talk.abstract}
      </p>
      <div className="talk-rise flex flex-wrap gap-2" style={rise(5)}>
        {talk.cta && (
          <a
            href={talk.cta.url}
            {...(talk.cta.url.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
            className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
          >
            {talk.cta.label} <ArrowRight size={14} />
          </a>
        )}
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-text px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-text transition-colors hover:border-crimson-text hover:text-crimson-text"
          >
            {l.label} <ExternalLink size={13} />
          </a>
        ))}
      </div>
    </div>
  );
}

interface TalksTimelineProps {
  talks: TimelineTalk[];
  nextSlug: string | null;
  onOpenTalk?: (slug: string, tab?: FloatingWindowTab) => void;
}

export function TalksTimeline({ talks, nextSlug, onOpenTalk }: TalksTimelineProps) {
  // Posición del ancla "hoy": justo antes de la próxima charla; si no hay, antes de las tarjetas sin fecha
  // (Call for Speakers), que siempre van al final.
  const firstUndated = talks.findIndex((t) => !t.startsAt);
  const nextIndex = nextSlug
    ? talks.findIndex((t) => t.slug === nextSlug)
    : firstUndated === -1
      ? talks.length
      : firstUndated;
  // Orden del track: pasadas, ancla de HOY, próximas.
  const items: (TimelineTalk | "today")[] = [...talks.slice(0, nextIndex), "today", ...talks.slice(nextIndex)];

  const [selected, setSelected] = useState(nextSlug ?? talks[talks.length - 1]?.slug ?? "");
  const [open, setOpen] = useState(false);
  // Cambia en cada apertura para reiniciar la entrada escalonada del detalle.
  const [openTick, setOpenTick] = useState(0);
  const [farFromToday, setFarFromToday] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const isHorizontal = () => (typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false);

  const center = useCallback((id: string, smooth = true) => {
    const el = itemRefs.current[id];
    const track = trackRef.current;
    if (!el || !track || !window.matchMedia("(min-width: 768px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2;
    track.scrollTo({ left, behavior: smooth && !reduce ? "smooth" : "auto" });
  }, []);

  // Desenfoque progresivo según la distancia al centro visible. Se escribe directo al DOM
  // (sin estado) para no re-renderizar en cada frame de scroll.
  const applyFocus = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const horizontal = isHorizontal();
    const view = horizontal
      ? { mid: track.getBoundingClientRect().left + track.clientWidth / 2, step: CARD_STEP }
      : { mid: window.innerHeight / 2, step: 380 };
    for (const [id, el] of Object.entries(itemRefs.current)) {
      if (!el || id === TODAY_ID) continue;
      const rect = el.getBoundingClientRect();
      const pos = horizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
      const d = Math.abs(pos - view.mid) / view.step;
      const over = id === nextSlug ? 0 : Math.max(0, d - SHARP_RADIUS);
      el.style.filter = over > 0 ? `blur(${Math.min(over * 2.5, 6).toFixed(2)}px)` : "";
      el.style.opacity = String(Math.max(0.35, 1 - over * 0.22).toFixed(2));
    }
    const today = itemRefs.current[TODAY_ID];
    if (today && horizontal) {
      const rect = today.getBoundingClientRect();
      setFarFromToday(Math.abs(rect.left - view.mid) > view.step * 2);
    }
  }, [nextSlug]);

  useLayoutEffect(() => {
    center(TODAY_ID, false);
    applyFocus();
  }, [center, applyFocus]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyFocus);
    };
    const track = trackRef.current;
    track?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      track?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [applyFocus]);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    lastTrigger.current?.focus();
  }, []);

  // Drawer abierto: bloquea el scroll de la página y cierra con Esc.
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeDrawer]);

  function handleCardClick(slug: string, trigger?: HTMLElement | null, tab?: FloatingWindowTab) {
    if (onOpenTalk) {
      onOpenTalk(slug, tab);
      center(slug);
      return;
    }
    if (trigger) lastTrigger.current = trigger;
    setSelected(slug);
    setOpen(true);
    setOpenTick((t) => t + 1);
    center(slug);
  }

  function step(dir: 1 | -1) {
    const ids = items.map((i) => (i === "today" ? TODAY_ID : i.slug));
    const from = ids.indexOf(selected);
    let idx = from + dir;
    if (ids[idx] === TODAY_ID) idx += dir;
    const target = ids[idx];
    if (target) {
      setSelected(target);
      center(target);
    }
  }

  const pointerState = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    pointerState.current = { active: true, moved: false, startX: e.clientX, startScroll: trackRef.current.scrollLeft };
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = pointerState.current;
    if (!d.active || !trackRef.current) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    if (d.moved) trackRef.current.scrollLeft = d.startScroll - dx;
  }
  function endDrag() {
    pointerState.current.active = false;
    setTimeout(() => {
      pointerState.current.moved = false;
    }, 0);
  }

  const selectedTalk = talks.find((t) => t.slug === selected);
  const selectedIndex = talks.findIndex((t) => t.slug === selected);

  return (
    <div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => {
          if (pointerState.current.moved) e.stopPropagation();
        }}
        className={cn(
          "flex flex-col gap-8 px-5.5",
          "md:flex-row md:items-stretch md:gap-0 md:overflow-x-auto md:px-[calc(50%-200px)] md:py-3 md:select-none md:cursor-grab md:active:cursor-grabbing",
          "md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden",
        )}
      >
        {items.map((item) => {
          if (item === "today") {
            return (
              <div
                key={TODAY_ID}
                ref={(el) => {
                  itemRefs.current[TODAY_ID] = el;
                }}
                aria-hidden
                className="hidden w-0 shrink-0 md:block"
              />
            );
          }
          const isSelected = open && item.slug === selected;
          const upcoming = talks.indexOf(item) >= nextIndex;
          const hasSlides = item.slides && item.slides.length > 0;
          const hasMedia = item.media && item.media.length > 0;

          return (
            <div key={item.slug} className="shrink-0 md:w-[400px] md:px-4">
              <button
                type="button"
                ref={(el) => {
                  itemRefs.current[item.slug] = el;
                }}
                onClick={(e) => handleCardClick(item.slug, e.currentTarget)}
                className="group block w-full text-left transition-[filter,opacity] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson-text"
              >
                {/* Eje: línea con nodo */}
                <div className="mb-3 flex items-center gap-2 max-md:hidden">
                  <span
                    className={cn(
                      "size-2.5 rounded-full border-[1.5px] border-text3 bg-bg transition-colors",
                      upcoming && "border-crimson bg-crimson",
                      isSelected && "border-crimson-text bg-crimson-text",
                    )}
                  />
                  <span className="h-px flex-1 bg-border-h" />
                </div>
                <div
                  className={cn(
                    "mb-3 font-mono text-[.74rem] font-semibold uppercase tracking-[.16em]",
                    upcoming ? "text-crimson-text" : "text-text3",
                  )}
                >
                  {item.dateLabel ?? (item.startsAt ? shortDate(item.startsAt) : "")}
                </div>
                <TiltCard>
                  <div
                    className={cn(
                      "border-trail-hover relative rounded-card border-[1.5px] bg-card p-4 transition-all duration-300 ease-club group-hover:-translate-y-1",
                      isSelected ? "border-border-h after:opacity-100!" : "border-border group-hover:border-border-h",
                    )}
                  >
                    <div className="relative">
                      <Photo
                        talk={item}
                        className="aspect-[16/9] w-full rounded-xl"
                        sizes="(min-width: 768px) 430px, 100vw"
                      />
                      {/* Badges de recursos disponibles */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        {hasSlides && (
                          <span className="flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 font-mono text-[.64rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                            <Presentation size={11} className="text-crimson" />
                            <span>Slides</span>
                          </span>
                        )}
                        {hasMedia && (
                          <span className="flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 font-mono text-[.64rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                            <Camera size={11} />
                            <span>{item.media.length}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 px-1 pb-1">
                      <div className="font-display text-[1.2rem] font-extrabold uppercase leading-[1.12] tracking-tight text-text">
                        {item.title}
                      </div>
                      <div className="mt-3 font-mono text-[.78rem] font-semibold text-text">{item.subtitle}</div>
                      <div className="mt-1 font-mono text-[.7rem] text-text3">{item.details}</div>
                    </div>
                  </div>
                </TiltCard>
              </button>
            </div>
          );
        })}
      </div>

      {/* Controles (desktop) */}
      <div className="mx-auto mt-6 hidden max-w-7xl items-center justify-start px-12 md:flex">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Charla anterior"
            onClick={() => step(-1)}
            className="rounded-full border border-text p-2 text-text transition-colors hover:border-crimson hover:text-crimson"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Charla siguiente"
            onClick={() => step(1)}
            className="rounded-full border border-text p-2 text-text transition-colors hover:border-crimson hover:text-crimson"
          >
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => center(TODAY_ID)}
            aria-hidden={!farFromToday}
            tabIndex={farFromToday ? 0 : -1}
            className={cn(
              "rounded-full border border-crimson px-4 py-2 font-mono text-[.7rem] font-semibold uppercase tracking-[.14em] text-crimson transition-opacity",
              farFromToday ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            Volver a hoy
          </button>
        </div>
      </div>

      {/* Drawer lateral de respaldo si no hay modal externo */}
      {!onOpenTalk && (
        <div
          className={cn(
            "fixed inset-0 z-[1100] transition-opacity duration-300",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={!open}
          inert={!open}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={closeDrawer} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Detalle de la charla"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(1);
              if (e.key === "ArrowLeft") step(-1);
            }}
            className={cn(
              "absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-border bg-bg px-6 pb-12 transition-transform sm:w-[600px] sm:rounded-l-[28px] sm:px-8",
              open
                ? "drawer-flash translate-x-0 duration-[500ms] ease-[cubic-bezier(.22,1,.36,1)]"
                : "translate-x-full duration-[260ms] ease-in",
            )}
          >
            <div className="sticky top-0 z-10 -mx-6 mb-6 flex items-center justify-between bg-bg/90 px-6 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Charla anterior"
                  onClick={() => step(-1)}
                  disabled={selectedIndex <= 0}
                  className="rounded-full border border-text p-2 text-text transition-colors hover:border-crimson hover:text-crimson disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  aria-label="Charla siguiente"
                  onClick={() => step(1)}
                  disabled={selectedIndex >= talks.length - 1}
                  className="rounded-full border border-text p-2 text-text transition-colors hover:border-crimson hover:text-crimson disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              <button
                ref={closeRef}
                type="button"
                aria-label="Cerrar detalle"
                onClick={closeDrawer}
                className="rounded-full border border-text p-2 text-text transition-colors hover:border-crimson hover:text-crimson"
              >
                <X size={16} />
              </button>
            </div>
            {selectedTalk && <TalkDetail key={`${selectedTalk.slug}:${openTick}`} talk={selectedTalk} />}
          </aside>
        </div>
      )}
    </div>
  );
}
