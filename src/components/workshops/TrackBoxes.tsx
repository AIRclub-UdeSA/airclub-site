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
  /** Lo que tiene adentro, en mono: "10 guías asincrónicas", "18–25 h de práctica". */
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
 * Las cajas de /workshops: una por workshop, en mosaico (cajas casi cuadradas, tres por fila en escritorio) y en orden: el
 * número en Anton dice cuál va primero. Cada caja entera lleva a la página del workshop. El color sigue el progreso,
 * igual que la ruta de talleres: el workshop terminado pasa a gris claro y el primero sin terminar va en carmesí ("Seguí
 * acá"; sin nada hecho, "Empezá acá").
 */
export function TrackBoxes({ tracks }: { tracks: TrackBox[] }) {
  const { status, completed } = useWorkshopProgress();
  // Mientras carga, ninguna caja destacada (como la ruta): si no, se veía la 01 en carmesí y después saltaba.
  const states = status === "loading" ? new Map<string, StepState>() : trackStates(tracks, completed);
  const started = tracks.some((t) => t.slugs.some((s) => completed.has(s)));

  return (
    // En escritorio cada fila mide al menos un tercio del ancho (cajas cuadradas) y crece si el contenido no entra. Con dos
    // workshops van en dos columnas: en tres quedaba un hueco a la derecha que se leía como incompleto. La fila sigue
    // midiendo un tercio, así las dos cajas no se vuelven cuadrados gigantes.
    <div className="@container min-w-0">
      <ol
        className={`grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-[minmax(calc((100cqw_-_1.5rem)/3),auto)] ${
          tracks.length === 2 ? "" : "lg:grid-cols-3"
        }`}
      >
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
    </div>
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
  const muted = next ? "text-white/80" : "text-text3";

  return (
    <li id={`workshop-${t.key}`} className="min-w-0 scroll-mt-28">
      <article
        className={`group relative flex h-full min-h-[21rem] flex-col gap-5 p-6 transition-colors sm:p-8 ${CARD[state]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className={`font-logo text-[clamp(3.6rem,6vw,5.5rem)] leading-[0.8] ${done ? "text-text/25" : ""}`} aria-hidden="true">
            {order}
          </span>
          {next && (
            <span className="-rotate-3 border border-white px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em]">
              {started ? "Seguí acá" : "Empezá acá"}
            </span>
          )}
          {done && (
            <span className="inline-flex -rotate-3 items-center gap-1 border border-text/30 px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em] text-text2">
              <Check size={11} aria-hidden="true" /> Completo
            </span>
          )}
        </div>

        <div className="min-w-0">
          {t.label && (
            <p className={`mb-2 font-mono text-[.7rem] font-semibold uppercase tracking-[.16em] ${next ? "text-white/80" : "text-mauve"}`}>
              {t.label}
            </p>
          )}
          <h3
            className={`font-display text-[clamp(1.35rem,2.2vw,1.9rem)] font-black uppercase leading-[1] tracking-tight transition-colors [overflow-wrap:anywhere] ${
              state === "todo" ? "group-hover:text-crimson-text" : ""
            }`}
          >
            <Link href={t.href} className={`${STRETCH} focus-visible:outline-none`}>
              <span className="sr-only">Workshop {order}: </span>
              {t.title}
              {done && <span className="sr-only"> (completo)</span>}
            </Link>
          </h3>
          <p className={`mt-3 line-clamp-3 text-[.95rem] leading-[1.6] ${next ? "text-white/85" : done ? "text-text3" : "text-text2"}`}>
            {t.summary}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <p className={`font-mono text-[.7rem] uppercase leading-[1.7] tracking-[.14em] ${muted}`}>{t.facts.join(" · ")}</p>

          {showProgress && t.slugs.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="font-logo text-[1.7rem] leading-[0.8]">
                {String(doneCount).padStart(2, "0")}
                <span className={next ? "text-white/60" : "text-text3"}>/{String(t.slugs.length).padStart(2, "0")}</span>
              </p>
              <ol className="flex flex-wrap gap-1" aria-label={`Progreso en ${t.title}`}>
                {t.slugs.map((s) => {
                  const st = steps.get(s);
                  return (
                    <li
                      key={s}
                      className={`size-3 border ${
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
            className={`inline-flex items-center gap-2 font-mono text-[.74rem] font-semibold uppercase tracking-[.14em] ${
              state === "todo" ? "group-hover:text-crimson-text" : ""
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
