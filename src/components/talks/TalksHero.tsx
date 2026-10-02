"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { TimelineTalk } from "./TalksTimeline";
import type { TalkSection } from "./TalkModal";
import { shortDayLabel, talkCover, talkDateParts } from "@/lib/talk-format";

interface TalksHeroProps {
  latest?: TimelineTalk;
  next?: TimelineTalk;
  todayIso: string;
  daysUntilNext: string | null;
  onOpenTalk: (slug: string, section?: TalkSection) => void;
}

const PANEL_PAD = "p-6 sm:p-8 lg:p-10";
// Un único elemento por panel cubre todo el panel (enlace estirado); los demás enlaces se elevan por encima.
const STRETCH = "after:absolute after:inset-0 after:content-['']";

export function TalksHero({ latest, next, todayIso, daysUntilNext, onOpenTalk }: TalksHeroProps) {
  const both = Boolean(latest && next);
  return (
    <section className="pb-10 pt-24 md:pb-14">
      {/* Título monumental: una sola línea, centrada, sin nada debajo. */}
      <h1 className="talk-rise mb-6 select-none overflow-hidden whitespace-nowrap px-4 text-center font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-text sm:px-8 sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:px-12 md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
        AIR <span className="text-crimson-text">TALKS</span>
      </h1>

      <div
        className={`relative z-10 grid grid-cols-1 gap-3 bg-bg ${
          both ? "lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" : ""
        } lg:min-h-[clamp(540px,calc(100dvh-19.5rem),720px)]`}
      >
        {latest && <LatestPanel talk={latest} onOpenTalk={onOpenTalk} />}

        {both && <TodayBadge todayIso={todayIso} />}

        {next ? (
          <NextPanel talk={next} daysUntil={daysUntilNext} onOpenTalk={onOpenTalk} />
        ) : (
          <NoDatePanel />
        )}
      </div>
    </section>
  );
}

/* ---------- Última charla: foto en blanco y negro que se revela a color ---------- */

function LatestPanel({
  talk,
  onOpenTalk,
}: {
  talk: TimelineTalk;
  onOpenTalk: TalksHeroProps["onOpenTalk"];
}) {
  const cover = talkCover(talk.media);
  const date = talkDateParts(talk.startsAt, talk.endsAt);
  const hasSlides = Boolean(talk.slides?.length);

  return (
    <article
      className="talk-photo-host talk-rise relative isolate min-h-[34rem] overflow-hidden bg-[#140a0e] text-[#f5e8ec]"
      style={{ "--d": "90ms" } as React.CSSProperties}
    >
      {cover ? (
        <Image
          src={cover}
          alt={`Registro fotográfico de la charla ${talk.title}`}
          fill
          sizes="(min-width: 1024px) 62vw, 100vw"
          loading="eager"
          fetchPriority="high"
          className="talk-photo talk-develop -z-10 object-cover object-[50%_58%]"
        />
      ) : (
        <div className="talk-hatch absolute inset-0 -z-10" aria-hidden="true" />
      )}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-transparent via-45% to-black/85"
        aria-hidden="true"
      />

      <div className={`relative z-10 flex h-full flex-col justify-between ${PANEL_PAD}`}>
        <div>
          <p className="font-mono text-[.78rem] uppercase tracking-[.16em] text-white/75">Última charla</p>
          {date && (
            <div className="mt-3 flex items-end gap-4">
              <time
                dateTime={talk.startsAt?.slice(0, 10)}
                className="font-logo text-[clamp(4.5rem,9vw,8.5rem)] leading-[0.8]"
              >
                {date.day}
              </time>
              <div className="pb-1 font-mono text-[.78rem] uppercase leading-snug tracking-[.14em] text-white/85">
                <div>{date.monthLong}</div>
                <div>{date.year}</div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-16">
          <h2 className="max-w-[22ch] text-balance font-display text-[clamp(1.9rem,3.6vw,3.3rem)] font-bold leading-[1.06] tracking-tight">
            {talk.title}
          </h2>
          {(talk.topic || talk.subtitle) && (
            <p className="mt-3 max-w-[52ch] font-body text-[1.05rem] font-light italic leading-relaxed text-white/80">
              “{talk.topic ?? talk.subtitle}”
            </p>
          )}

          {talk.speaker && (
            <div className="mt-5 flex items-center gap-3">
              {talk.speaker.avatar && (
                <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
                  <Image src={talk.speaker.avatar} alt="" fill sizes="44px" className="object-cover" />
                </span>
              )}
              <p className="text-[.95rem] leading-snug">
                <span className="font-semibold">{talk.speaker.name}</span>
                <span className="block text-white/70">{talk.speaker.role}</span>
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => onOpenTalk(talk.slug, "overview")}
              className={`${STRETCH} inline-flex cursor-pointer items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover`}
            >
              <span>Ver la charla</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
            {hasSlides && (
              <SecondaryLink onClick={() => onOpenTalk(talk.slug, "slides")}>Diapositivas</SecondaryLink>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function SecondaryLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-10 cursor-pointer font-mono text-[.78rem] uppercase tracking-[.12em] text-white/85 underline decoration-white/35 underline-offset-[6px] transition-colors hover:text-white hover:decoration-white"
    >
      {children}
    </button>
  );
}

/* ---------- Próxima charla: carmesí macizo; con trama si todavía no hay orador ---------- */

function NextPanel({
  talk,
  daysUntil,
  onOpenTalk,
}: {
  talk: TimelineTalk;
  daysUntil: string | null;
  onOpenTalk: TalksHeroProps["onOpenTalk"];
}) {
  const date = talkDateParts(talk.startsAt, talk.endsAt);

  return (
    <article
      className="talk-rise relative isolate flex min-h-[28rem] flex-col justify-between overflow-hidden bg-crimson text-white"
      style={{ "--d": "190ms" } as React.CSSProperties}
    >
      {!talk.confirmed && (
        <div
          className="talk-hatch absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
          aria-hidden="true"
        />
      )}

      <div className={`relative z-10 flex h-full flex-col justify-between ${PANEL_PAD}`}>
        <div>
          <div className="flex items-baseline justify-between gap-4 font-mono text-[.78rem] uppercase tracking-[.16em]">
            <p className="text-white/85">Próxima charla</p>
            <p className="font-semibold">{talk.confirmed ? "Confirmada" : "A confirmar"}</p>
          </div>

          {date && (
            <div className="mt-3">
              <time
                dateTime={talk.startsAt?.slice(0, 10)}
                className="block font-logo text-[clamp(4.5rem,8vw,8rem)] leading-[0.8]"
              >
                {date.day}
              </time>
              <p className="mt-3 font-mono text-[.78rem] uppercase tracking-[.14em] text-white/85">
                {date.monthLong} {date.year}
              </p>
              {daysUntil && <p className="mt-1 font-display text-[1.1rem] font-bold">{daysUntil}</p>}
            </div>
          )}
        </div>

        <div className="pt-12">
          <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold leading-[1.1] tracking-tight">
            {talk.title}
          </h2>
          {/* Resumen en celular y en escritorio ancho (2xl). En escritorio chico (lg a 2xl) se oculta: con títulos
              largos no entra junto al botón en el alto del panel. */}
          <p className="mt-3 line-clamp-3 max-w-[46ch] text-[.98rem] leading-[1.65] text-white/85 lg:hidden 2xl:line-clamp-3">
            {talk.abstract}
          </p>

          {/* Debajo de 2xl el botón va más compacto (menos relleno y tracking) para que "Ver detalles" entre en la
              misma fila en notebooks de ~1300px. En anchos menores igual baja a la línea siguiente, sin cortarse. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 2xl:gap-x-6">
            {talk.cta && (
              <a
                href={talk.cta.url}
                className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-crimson 2xl:px-6 2xl:tracking-[.14em] transition-colors hover:bg-[#f5e8ec]"
              >
                <span>{talk.cta.label}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onOpenTalk(talk.slug, "overview")}
              className={`${STRETCH} cursor-pointer font-mono text-[.78rem] uppercase tracking-[.12em] text-white underline decoration-white/40 underline-offset-[6px] transition-colors hover:decoration-white`}
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function NoDatePanel() {
  return (
    <article className="talk-rise relative flex min-h-[22rem] flex-col justify-between border border-dashed border-border-strong/40 bg-bg2 p-6 sm:p-8 lg:p-10">
      <p className="font-mono text-[.78rem] uppercase tracking-[.16em] text-text3">Próxima charla</p>
      <div>
        <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold leading-[1.1] tracking-tight text-text">
          Todavía no hay fecha
        </h2>
        <p className="mt-3 max-w-[42ch] text-[.98rem] leading-[1.65] text-text2">
          Estamos armando el calendario. Si tenés algo para contar, este es el momento de proponerlo.
        </p>
        <a
          href="#convocatoria"
          className="mt-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
        >
          <span>Proponer una charla</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

/* ---------- Marcador HOY: queda justo en la costura entre lo que pasó y lo que viene ---------- */

function TodayBadge({ todayIso }: { todayIso: string }) {
  return (
    <div
      className="pointer-events-none relative z-20 -my-9 mx-auto flex size-[76px] -rotate-[5deg] flex-col items-center justify-center border border-text bg-bg text-text lg:absolute lg:left-[62.9%] lg:top-1/2 lg:m-0 lg:-translate-x-1/2 lg:-translate-y-1/2"
    >
      <span className="font-mono text-[.66rem] font-semibold uppercase tracking-[.2em] text-crimson-text">Hoy</span>
      <span className="font-logo text-[1.15rem] uppercase leading-none">{shortDayLabel(todayIso)}</span>
    </div>
  );
}
