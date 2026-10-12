"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { workshopHref, type AsyncWorkshop } from "@/lib/workshops";
import { routeStates, type StepState } from "@/lib/workshop-progress";
import { useWorkshopProgress } from "./WorkshopProgress";
import { LEVEL_LABEL, LevelNode } from "./level";

// Un único enlace por tarjeta la cubre entera (enlace estirado); "Requiere" se eleva por encima.
const STRETCH = "after:absolute after:inset-0 after:content-['']";

/**
 * Las paradas de la ruta. Cada tarjeta es grande y entera es un enlace a la página del workshop. El color sigue el
 * progreso de la persona: lo hecho pasa a gris claro y el primero que le falta va en carmesí macizo ("Seguí acá"). Sin
 * sesión, o mientras carga, la 01 es la que va en carmesí ("Empezá acá").
 */
export function RouteSteps({ guides }: { guides: AsyncWorkshop[] }) {
  const { completed } = useWorkshopProgress();
  const slugs = guides.map((g) => g.slug);
  const states = routeStates(slugs, completed);
  const started = slugs.some((s) => completed.has(s));

  return (
    <ol className="relative mt-12 grid min-w-0 grid-cols-1 gap-3 md:mt-16">
      {/* La ruta: una línea de 1px que une los nodos de todas las semanas. */}
      <span className="absolute bottom-8 left-[6px] top-8 w-px bg-text/30" aria-hidden="true" />
      {guides.map((w) => (
        <RouteStop key={w.slug} workshop={w} state={states.get(w.slug) ?? "todo"} started={started} />
      ))}
    </ol>
  );
}

const CARD: Record<StepState, string> = {
  next: "bg-crimson text-white",
  done: "border border-text/15 text-text3 hover:border-text/45",
  todo: "border border-text bg-bg text-text hover:border-crimson-text",
};

function RouteStop({ workshop: w, state, started }: { workshop: AsyncWorkshop; state: StepState; started: boolean }) {
  const next = state === "next";
  const done = state === "done";
  const muted = next ? "text-white/80" : "text-text3";

  return (
    <li id={`semana-${w.week}`} className="relative grid scroll-mt-28 grid-cols-[14px_minmax(0,1fr)] items-start gap-4 sm:gap-6">
      <LevelNode level={w.level} done={done} className="relative mt-9 sm:mt-12" />

      <article
        className={`group relative grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 p-6 transition-colors sm:grid-cols-[auto_minmax(0,1fr)] sm:p-8 lg:min-h-[13rem] lg:grid-cols-[auto_minmax(0,1fr)_17rem] lg:p-10 ${CARD[state]}`}
      >
        <span
          className={`font-logo text-[clamp(3.6rem,7vw,6rem)] leading-[0.8] ${done ? "text-text/25" : ""}`}
          aria-hidden="true"
        >
          {w.week}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h3
              className={`font-display text-[clamp(1.4rem,2.4vw,2.1rem)] font-bold leading-[1.1] tracking-tight transition-colors ${
                state === "todo" ? "group-hover:text-crimson-text" : ""
              }`}
            >
              <Link href={workshopHref(w)} className={`${STRETCH} focus-visible:outline-none`}>
                <span className="sr-only">Semana {w.week}: </span>
                {w.title}
                {done && <span className="sr-only"> (hecho)</span>}
              </Link>
            </h3>
            {next && (
              <span className="-rotate-3 border border-white px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em]">
                {started ? "Seguí acá" : "Empezá acá"}
              </span>
            )}
            {done && (
              <span className="inline-flex -rotate-3 items-center gap-1 border border-text/30 px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em]">
                <Check size={11} aria-hidden="true" /> Hecho
              </span>
            )}
          </div>

          <p className={`mt-3 max-w-[62ch] text-[1rem] leading-[1.65] ${next ? "text-white/85" : done ? "text-text3" : "text-text2"}`}>
            {w.outcome}
          </p>
        </div>

        {/* Datos: debajo del texto en celular y tablet, en su propia columna en escritorio. */}
        <div
          className={`flex min-w-0 flex-col gap-4 sm:col-start-2 lg:col-start-3 lg:row-start-1 lg:border-l lg:pl-8 ${
            next ? "border-white/35" : done ? "border-text/15" : "border-text/20"
          }`}
        >
          <p className={`flex flex-wrap gap-x-4 gap-y-1 font-mono text-[.72rem] uppercase tracking-[.14em] ${muted}`}>
            <span>{w.durationLabel}</span>
            <span>{LEVEL_LABEL[w.level]}</span>
            <span className="normal-case tracking-normal [overflow-wrap:anywhere]">{w.ros2Package}</span>
          </p>

          {w.requires.length > 0 && (
            <p className={`font-mono text-[.72rem] uppercase tracking-[.14em] ${muted}`}>
              Requiere{" "}
              {w.requires.map((week, i) => (
                <span key={week}>
                  {i > 0 && " · "}
                  <a
                    href={`#semana-${week}`}
                    className="relative z-10 underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
                  >
                    {week}
                  </a>
                </span>
              ))}
            </p>
          )}

          <span
            className={`mt-auto inline-flex items-center gap-2 font-mono text-[.74rem] font-semibold uppercase tracking-[.14em] ${
              next ? "" : done ? "" : "group-hover:text-crimson-text"
            }`}
            aria-hidden="true"
          >
            Ver workshop
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </article>
    </li>
  );
}
