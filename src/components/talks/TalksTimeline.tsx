"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, EyeOff, Presentation } from "lucide-react";
import type { TalkMedia, TalkSlide, TalkSpeaker } from "@/lib/talks";
import type { TalkSection } from "./TalkModal";
import { talkCover, talkDateParts } from "@/lib/talk-format";
import { cn } from "@/lib/utils";

export type TimelineTalk = {
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  speaker?: TalkSpeaker;
  speakers?: TalkSpeaker[];
  startsAt?: string; // ISO; sin fecha = siempre al final
  endsAt?: string; // ISO; fin de un rango (ej.: una semana entera)
  dateLabel?: string;
  location?: string;
  topic?: string;
  recordingUrl?: string;
  confirmed: boolean;
  isUpcoming?: boolean;
  media: TalkMedia[];
  slides?: TalkSlide[];
  links?: { label: string; url: string }[];
  cta?: { label: string; url: string };
  category?: "talk" | "workshop" | "competition" | "meetup";
  capacity?: number;
  prerequisites?: string;
  /** Borrador: solo llega a /admin/talks, que lo muestra apagado. */
  draft?: boolean;
};

/**
 * Lo que /admin/talks suma sobre la misma vista de /talks (ver TalksHub): sin esto, todo se ve
 * exactamente como el sitio.
 */
export type TalksEdit = {
  /** Controles de una charla (el lápiz) sobre su tarjeta. Arriba no van: la próxima y la última salen solas de las fechas. */
  controls: (talk: TimelineTalk) => ReactNode;
  /** Contenido de la columna extra al final de la línea de tiempo, para agregar una charla. */
  add: ReactNode;
};

interface TalksTimelineProps {
  talks: TimelineTalk[];
  nextSlug: string | null;
  onOpenTalk: (slug: string, section?: TalkSection) => void;
  edit?: TalksEdit;
}

type Item = { kind: "talk"; talk: TimelineTalk } | { kind: "today" };

const GUTTER = "px-4 sm:px-8 md:px-12";

export function TalksTimeline({ talks, nextSlug, onOpenTalk, edit }: TalksTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  // HOY va justo antes de la primera charla que todavía no terminó; si todas pasaron, al final.
  const firstUpcoming = talks.findIndex((t) => t.isUpcoming);
  const splitAt = firstUpcoming === -1 ? talks.length : firstUpcoming;
  const items: Item[] = [
    ...talks.slice(0, splitAt).map((talk): Item => ({ kind: "talk", talk })),
    { kind: "today" },
    ...talks.slice(splitAt).map((talk): Item => ({ kind: "talk", talk })),
  ];

  // Qué puntas de la pista están a la vista: decide si hacen falta las flechas y cuáles habilitar.
  useEffect(() => {
    const root = trackRef.current;
    const first = root?.querySelector<HTMLElement>("[data-edge=first]");
    const last = root?.querySelector<HTMLElement>("[data-edge=last]");
    if (!root || !first || !last) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setEdges((prev) => {
          const next = { ...prev };
          for (const entry of entries) {
            if (entry.target === first) next.start = entry.isIntersecting;
            if (entry.target === last) next.end = entry.isIntersecting;
          }
          return next;
        });
      },
      { root, threshold: 0.98 },
    );
    observer.observe(first);
    observer.observe(last);
    return () => observer.disconnect();
  }, [items.length]);

  // Al entrar, la pista queda centrada en el presente (solo si hay más charlas de las que entran).
  useEffect(() => {
    const root = trackRef.current;
    const today = root?.querySelector<HTMLElement>("[data-today]");
    if (!root || !today || root.scrollWidth <= root.clientWidth) return;
    root.scrollTo({ left: Math.max(0, today.offsetLeft - root.clientWidth * 0.3), behavior: "instant" });
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    const root = trackRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.scrollBy({ left: direction * root.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  const hasOverflow = !(edges.start && edges.end);

  return (
    <section id="cronograma" className="scroll-mt-24 border-y border-text/20 bg-bg2 py-16 md:py-24">
      <div className={cn("flex items-end justify-between gap-6", GUTTER)}>
        <div className="min-w-0">
          <h2 className="font-display text-[clamp(1.5rem,6.6vw,4rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-text">
            Cronograma
          </h2>
          <p className="mt-4 max-w-[52ch] text-[1rem] leading-[1.7] text-text2">
            Charlas abiertas de inteligencia artificial y robótica en el Campus Victoria. Tocá una para ver el
            resumen, las diapositivas y las fotos.
          </p>
        </div>

        {hasOverflow && (
          <div className="flex shrink-0 items-center gap-2">
            <ArrowButton label="Ver charlas anteriores" disabled={edges.start} onClick={() => scrollByPage(-1)}>
              <ArrowLeft size={18} aria-hidden="true" />
            </ArrowButton>
            <ArrowButton label="Ver charlas siguientes" disabled={edges.end} onClick={() => scrollByPage(1)}>
              <ArrowRight size={18} aria-hidden="true" />
            </ArrowButton>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        className={cn(
          "relative mt-10 snap-x snap-proximity overflow-x-auto scroll-px-4 pb-2 sm:scroll-px-8 md:scroll-px-12",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          GUTTER,
        )}
      >
        <ol className="flex items-stretch">
          {items.map((item, i) => {
            // En el panel la última es la columna de agregar.
            const edge = i === 0 ? "first" : i === items.length - 1 && !edit ? "last" : undefined;
            if (item.kind === "today") {
              return <TodayColumn key="today" edge={edge} />;
            }
            return (
              <TalkColumn
                key={item.talk.slug}
                talk={item.talk}
                isNext={item.talk.slug === nextSlug}
                edge={edge}
                onOpenTalk={onOpenTalk}
                controls={edit?.controls(item.talk)}
              />
            );
          })}
          {edit && (
            <li data-edge="last" className="flex w-[min(80vw,23rem)] shrink-0 snap-start flex-col pr-5">
              <div className="relative h-10" aria-hidden="true">
                <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-crimson-text/60" />
              </div>
              {edit.add}
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 cursor-pointer items-center justify-center border border-text text-text transition-colors hover:bg-text hover:text-bg disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text"
    >
      {children}
    </button>
  );
}

/* ---------- Marcador HOY sobre el eje: lo pasado a la izquierda (línea sólida), lo que viene a la derecha (punteada) ---------- */

function TodayColumn({ edge }: { edge?: "first" | "last" }) {
  return (
    <li data-today data-edge={edge} className="relative w-[4.5rem] shrink-0" aria-label="Hoy">
      <div className="relative h-10" aria-hidden="true">
        <span className="absolute inset-x-0 left-0 right-1/2 top-1/2 border-t border-text/45" />
        <span className="absolute left-1/2 right-0 top-1/2 border-t border-dashed border-crimson-text/60" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-crimson px-2.5 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.16em] text-white">
          Hoy
        </span>
      </div>
      <span
        className="absolute bottom-0 left-1/2 top-10 border-l border-dashed border-crimson-text/40"
        aria-hidden="true"
      />
    </li>
  );
}

/* ---------- Una charla sobre el eje: una entrada con talón ---------- */

function TalkColumn({
  talk,
  isNext,
  edge,
  onOpenTalk,
  controls,
}: {
  talk: TimelineTalk;
  isNext: boolean;
  edge?: "first" | "last";
  onOpenTalk: TalksTimelineProps["onOpenTalk"];
  controls?: ReactNode;
}) {
  const upcoming = Boolean(talk.isUpcoming);
  const cover = talkCover(talk.media);
  const date = talkDateParts(talk.startsAt, talk.endsAt);
  const hasSlides = Boolean(talk.slides?.length);
  const hasActions = hasSlides || (upcoming && talk.cta);

  return (
    <li
      data-edge={edge}
      className={cn("flex shrink-0 snap-start flex-col pr-5", upcoming ? "w-[min(80vw,23rem)]" : "w-[min(86vw,27rem)]")}
    >
      {/* Eje temporal */}
      <div className="relative h-10" aria-hidden="true">
        <span
          className={cn(
            "absolute inset-x-0 top-1/2 border-t",
            upcoming ? "border-dashed border-crimson-text/60" : "border-text/55",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-1/2 size-3 -translate-y-1/2",
            !upcoming && "bg-text",
            isNext && "bg-crimson ring-4 ring-crimson/20",
            upcoming && !isNext && "border-2 border-crimson-text/70 bg-bg2",
          )}
        />
      </div>

      <article
        className={cn(
          "group relative flex flex-1 flex-col border border-text bg-card transition-transform duration-200 ease-out hover:-translate-y-1",
          cover && !upcoming && "talk-photo-host",
          talk.draft && "border-dashed",
        )}
      >
        {controls}
        {talk.draft && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex aspect-[4/3] items-center justify-center">
            <span className="flex items-center gap-2 border border-text bg-card px-3 py-1.5 font-mono text-[.72rem] font-bold uppercase tracking-[.12em] text-text">
              <EyeOff size={16} aria-hidden="true" />
              Borrador
            </span>
          </div>
        )}
        {/* Cuerpo de la entrada: la fecha manda. Foto en blanco y negro (pasado), carmesí (la próxima) o trama (por confirmar). */}
        <div
          className={cn(
            "relative aspect-[4/3] overflow-hidden border-b border-text",
            talk.draft && "opacity-40",
            cover && !upcoming && "bg-[#140a0e] text-white",
            !cover && !upcoming && "bg-bg2 text-text",
            isNext && "bg-crimson text-white",
            upcoming && !isNext && "talk-hatch bg-card text-text",
          )}
        >
          {cover && !upcoming && (
            <>
              <Image
                src={cover}
                alt=""
                fill
                sizes="(min-width: 640px) 432px, 86vw"
                className="talk-photo object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent via-55% to-black/25"
                aria-hidden="true"
              />
            </>
          )}
          {isNext && !talk.confirmed && (
            <div
              className="talk-hatch absolute inset-0 text-white [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
              aria-hidden="true"
            />
          )}

          {date && (
            <div className="absolute bottom-4 left-5 flex items-end gap-3">
              <time dateTime={talk.startsAt?.slice(0, 10)} className="font-logo text-[4.75rem] leading-[0.8]">
                {date.day}
              </time>
              <span className="pb-0.5 font-mono text-[.72rem] uppercase leading-snug tracking-[.14em] opacity-90">
                <span className="block">{date.monthShort}</span>
                <span className="block">{date.year}</span>
              </span>
            </div>
          )}

          {upcoming ? (
            <span className="absolute right-4 top-4 rotate-[4deg] border border-text bg-card px-2.5 py-1 font-mono text-[.68rem] font-bold uppercase tracking-[.12em] text-text">
              {isNext ? "Próxima" : talk.confirmed ? "Confirmada" : "A confirmar"}
            </span>
          ) : (
            <ArrowUpRight
              size={22}
              aria-hidden="true"
              className="absolute right-4 top-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          )}
        </div>

        <div className={cn("flex flex-1 flex-col p-5", talk.draft && "opacity-50")}>
          <p className="font-mono text-[.74rem] uppercase tracking-[.14em] text-text3">{talk.subtitle}</p>
          <h3 className="mt-2 line-clamp-3 font-display text-[1.3rem] font-bold leading-[1.15] tracking-tight text-text">
            <button
              type="button"
              onClick={() => onOpenTalk(talk.slug, "overview")}
              className="cursor-pointer text-left transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-crimson-text"
            >
              {talk.title}
            </button>
          </h3>

          {talk.speaker ? (
            <p className="mt-2 text-[.92rem] leading-snug text-text2">
              <span className="font-semibold text-text">{talk.speaker.name}</span>
              <span className="block">{talk.speaker.role}</span>
            </p>
          ) : (
            <p className="mt-2 text-[.92rem] italic text-text3">Orador a confirmar</p>
          )}

          {/* Talón de la entrada: separado por una línea de puntos */}
          {hasActions && (
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-text/40 pt-4">
              {hasSlides && (
                <ActionLink onClick={() => onOpenTalk(talk.slug, "slides")}>
                  <Presentation size={14} aria-hidden="true" />
                  Diapositivas
                </ActionLink>
              )}
              {upcoming && talk.cta && (
                <a
                  href={talk.cta.url}
                  className="relative z-10 inline-flex items-center gap-1.5 font-mono text-[.74rem] uppercase tracking-[.12em] text-crimson-text underline decoration-crimson-text/40 underline-offset-[6px] transition-colors hover:decoration-crimson-text"
                >
                  {talk.cta.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </li>
  );
}

function ActionLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 inline-flex cursor-pointer items-center gap-1.5 font-mono text-[.74rem] uppercase tracking-[.12em] text-text2 underline decoration-text/25 underline-offset-[6px] transition-colors hover:text-crimson-text hover:decoration-crimson-text"
    >
      {children}
    </button>
  );
}
