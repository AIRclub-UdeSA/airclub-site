"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { routeStates, trackStates, type StepState } from "@/lib/workshop-progress";
import { useWorkshopProgress } from "./WorkshopProgress";

export type TrackBox = {
  key: string;
  href: string;
  title: string;
  label?: string;
  summary: string;
  /** Lo que tiene adentro, en mono: "09 guías asincrónicas", "15–21 h". */
  facts: string[];
  /** Sus talleres, en orden: arman el progreso de la caja. */
  slugs: string[];
};

// Un único enlace por caja la cubre entera (enlace estirado).
const STRETCH = "after:absolute after:inset-0 after:content-['']";

const CARD: Record<StepState, string> = {
  next: "bg-crimson text-white",
  done: "border border-text/15 text-text3 hover:border-text/45",
  todo: "border border-text bg-bg text-text hover:border-crimson-text",
};

/**
 * Las cajas de /workshops: una por workshop, en orden (el recorrido sugerido), unidas por la misma ruta de nodos que los
 * talleres adentro. Cada caja entera lleva a la página del workshop. El color sigue el progreso, igual que la ruta: el
 * workshop terminado pasa a gris claro y el primero sin terminar va en carmesí ("Seguí acá"; sin nada hecho, "Empezá acá").
 */
export function TrackBoxes({ tracks }: { tracks: TrackBox[] }) {
  const { status, completed } = useWorkshopProgress();
  const states = trackStates(tracks, completed);
  const started = tracks.some((t) => t.slugs.some((s) => completed.has(s)));

  return (
    <ol className="relative grid min-w-0 grid-cols-1 gap-3">
      <span className="absolute bottom-10 left-[6px] top-10 w-px bg-text/30" aria-hidden="true" />
      {tracks.map((t, i) => (
        <Box
          key={t.key}
          track={t}
          order={String(i + 1).padStart(2, "0")}
          state={states.get(t.key) ?? "todo"}
          started={started}
          showProgress={status === "ready"}
          completed={completed}
        />
      ))}
    </ol>
  );
}

function Box({
  track: t,
  order,
  state,
  started,
  showProgress,
  completed,
}: {
  track: TrackBox;
  order: string;
  state: StepState;
  started: boolean;
  showProgress: boolean;
  completed: ReadonlySet<string>;
}) {
  const next = state === "next";
  const done = state === "done";
  const steps = routeStates(t.slugs, completed);
  const doneCount = t.slugs.filter((s) => completed.has(s)).length;

  return (
    <li id={`workshop-${t.key}`} className="relative grid scroll-mt-28 grid-cols-[14px_minmax(0,1fr)] items-start gap-4 sm:gap-6">
      <span
        className={`relative mt-12 block size-3.5 border sm:mt-16 ${
          done ? "border-text/25 bg-text/20" : next ? "border-crimson bg-crimson" : "border-crimson-text bg-bg"
        }`}
        aria-hidden="true"
      />

      <article
        className={`group relative grid min-w-0 grid-cols-1 gap-x-10 gap-y-6 p-6 transition-colors sm:grid-cols-[auto_minmax(0,1fr)] sm:p-10 lg:min-h-[19rem] lg:grid-cols-[auto_minmax(0,1fr)_18rem] lg:p-12 ${CARD[state]}`}
      >
        <span
          className={`font-logo text-[clamp(5rem,10vw,9rem)] leading-[0.8] ${done ? "text-text/25" : ""}`}
          aria-hidden="true"
        >
          {order}
        </span>

        <div className="min-w-0">
          {t.label && (
            <p className={`mb-3 font-mono text-[.72rem] font-semibold uppercase tracking-[.16em] ${next ? "text-white/80" : "text-mauve"}`}>
              {t.label}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h3
              className={`font-display text-[clamp(1.5rem,3.6vw,3rem)] font-black uppercase leading-[0.98] tracking-tight transition-colors [overflow-wrap:anywhere] ${
                state === "todo" ? "group-hover:text-crimson-text" : ""
              }`}
            >
              <Link href={t.href} className={`${STRETCH} focus-visible:outline-none`}>
                <span className="sr-only">Workshop {order}: </span>
                {t.title}
                {done && <span className="sr-only"> (completo)</span>}
              </Link>
            </h3>
            {next && (
              <span className="-rotate-3 border border-white px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em]">
                {started ? "Seguí acá" : "Empezá acá"}
              </span>
            )}
            {done && (
              <span className="inline-flex -rotate-3 items-center gap-1 border border-text/30 px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em]">
                <Check size={11} aria-hidden="true" /> Completo
              </span>
            )}
          </div>
          <p className={`mt-4 max-w-[58ch] text-[1.02rem] leading-[1.7] ${next ? "text-white/85" : done ? "text-text3" : "text-text2"}`}>
            {t.summary}
          </p>
        </div>

        {/* Datos y progreso: debajo del texto en celular y tablet, en su propia columna en escritorio. */}
        <div
          className={`flex min-w-0 flex-col gap-5 sm:col-start-2 lg:col-start-3 lg:row-start-1 lg:border-l lg:pl-8 ${
            next ? "border-white/35" : done ? "border-text/15" : "border-text/20"
          }`}
        >
          <ul className={`flex flex-col gap-1.5 font-mono text-[.74rem] uppercase tracking-[.14em] ${next ? "text-white/85" : "text-text3"}`}>
            {t.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          {showProgress && t.slugs.length > 0 && (
            <div>
              <p className="font-logo text-[2.2rem] leading-[0.8]">
                {String(doneCount).padStart(2, "0")}
                <span className={next ? "text-white/60" : "text-text3"}>/{String(t.slugs.length).padStart(2, "0")}</span>
              </p>
              <ol className="mt-3 flex flex-wrap gap-1" aria-label={`Progreso en ${t.title}`}>
                {t.slugs.map((s) => {
                  const st = steps.get(s);
                  return (
                    <li
                      key={s}
                      className={`size-3.5 border ${
                        st === "done"
                          ? next
                            ? "border-white/50 bg-white/40"
                            : "border-text/25 bg-text/20"
                          : st === "next"
                            ? next
                              ? "border-white bg-white"
                              : "border-crimson bg-crimson"
                            : next
                              ? "border-white/50"
                              : "border-text/40"
                      }`}
                    >
                      <span className="sr-only">{st === "done" ? "hecho" : st === "next" ? "siguiente" : "pendiente"}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <span
            className={`mt-auto inline-flex items-center gap-2 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] ${
              state === "todo" ? "group-hover:text-crimson-text" : ""
            }`}
            aria-hidden="true"
          >
            Ver workshop
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </article>
    </li>
  );
}
