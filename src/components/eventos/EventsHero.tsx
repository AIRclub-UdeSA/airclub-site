"use client";

import { Clock, MapPin, ArrowRight, LayoutGrid, List } from "lucide-react";
import type { CalendarActivity, CalendarActivityCategory } from "@/lib/calendar-types";
import { CategoryBadge } from "./EventBadge";
import { cn } from "@/lib/utils";

interface EventsHeroProps {
  nextActivity: CalendarActivity | null;
  selectedCategory: CalendarActivityCategory | "all";
  onSelectCategory: (cat: CalendarActivityCategory | "all") => void;
  viewMode: "grid" | "list";
  onSelectViewMode: (mode: "grid" | "list") => void;
  totalActivitiesCount: number;
  onOpenActivity: (activity: CalendarActivity) => void;
}

const CATEGORIES: { key: CalendarActivityCategory | "all"; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "workshop", label: "Workshops" },
  { key: "talk", label: "Talks" },
  { key: "competition", label: "Competencias" },
  { key: "meetup", label: "Encuentros" },
];

export function EventsHero({
  nextActivity,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onSelectViewMode,
  totalActivitiesCount,
  onOpenActivity,
}: EventsHeroProps) {
  return (
    <section className="pb-8 pt-24 md:pb-12">
      {/* Título monumental idéntico en escala y alineación a /talks, /equipo y /contacto */}
      <div className="px-4 text-center sm:px-8 md:px-12">
        <h1 className="talk-rise my-3 select-none overflow-hidden whitespace-nowrap font-logo text-[min(36rem,calc((100vw-2rem)/5))] uppercase leading-[0.92] tracking-tight text-text sm:text-[min(36rem,calc((100vw-4rem)/5.8))] md:text-[min(36rem,calc((100vw-6rem)/6.8))]">
          EVEN<span className="text-crimson-text">TOS</span>
        </h1>
      </div>

      <div className="mx-auto mt-6 max-w-[1440px] px-4 sm:px-8 md:px-12">
        {/* Spotlight: Próxima Actividad destacada */}
        {nextActivity && (
          <article className="relative mb-10 border border-text bg-bg2 p-6 transition-all sm:p-8 md:p-10">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Fecha destacada en Anton */}
              <div className="flex flex-col border-b border-border pb-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[.76rem] font-bold uppercase tracking-[.18em] text-mauve">
                    Próxima Actividad
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-logo text-[clamp(3.5rem,7vw,5.5rem)] leading-none text-text">
                    {nextActivity.startsAt
                      ? new Intl.DateTimeFormat("es-AR", {
                          day: "2-digit",
                          timeZone: "America/Argentina/Buenos_Aires",
                        }).format(new Date(nextActivity.startsAt))
                      : "—"}
                  </span>
                  <div className="font-mono text-[.82rem] uppercase leading-snug tracking-[.14em] text-text2">
                    <div>
                      {nextActivity.startsAt
                        ? new Intl.DateTimeFormat("es-AR", {
                            month: "long",
                            timeZone: "America/Argentina/Buenos_Aires",
                          }).format(new Date(nextActivity.startsAt))
                        : "Por anunciar"}
                    </div>
                    <div className="text-text3">
                      {nextActivity.startsAt
                        ? new Intl.DateTimeFormat("es-AR", {
                            year: "numeric",
                            timeZone: "America/Argentina/Buenos_Aires",
                          }).format(new Date(nextActivity.startsAt))
                        : ""}
                    </div>
                  </div>
                </div>
                {nextActivity.timeLabel && (
                  <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[.78rem] text-text3">
                    <Clock className="h-3.5 w-3.5 text-mauve" />
                    {nextActivity.timeLabel}
                  </p>
                )}
              </div>

              {/* Contenido principal */}
              <div className="flex flex-col justify-between gap-4 lg:col-span-8 lg:pl-4">
                <div>
                  <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    <CategoryBadge category={nextActivity.category} />
                    {nextActivity.location && (
                      <span className="inline-flex items-center gap-1 font-mono text-[.72rem] text-text3">
                        <MapPin className="h-3.5 w-3.5 text-mauve" />
                        {nextActivity.location}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold uppercase leading-[1.1] tracking-tight text-text">
                    {nextActivity.subtitle && nextActivity.title.toLowerCase().includes("a confirmar")
                      ? `${nextActivity.subtitle} — ${nextActivity.title}`
                      : nextActivity.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 font-body text-[.92rem] leading-relaxed text-text2">
                    {nextActivity.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenActivity(nextActivity)}
                    className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-crimson/90"
                  >
                    Ver detalles y participar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  {nextActivity.capacity && (
                    <span className="font-mono text-[.74rem] uppercase tracking-[.1em] text-text3">
                      Cupos: {nextActivity.capacity} lugares
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Barra de Filtros y Selector de Vista */}
        <div className="flex flex-col justify-between gap-4 border-y border-text/15 py-4 sm:flex-row sm:items-center">
          {/* Chips de Categoría */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 hidden font-mono text-[.72rem] uppercase tracking-[.16em] text-text3 md:inline">
              Filtrar:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => onSelectCategory(cat.key)}
                  className={cn(
                    "border px-3 py-1 font-mono text-[.74rem] uppercase tracking-[.12em] transition-all",
                    active
                      ? "border-text bg-text text-bg font-bold"
                      : "border-border bg-bg text-text2 hover:border-text/60 hover:text-text"
                  )}
                >
                  [{cat.label}]
                </button>
              );
            })}
          </div>

          {/* Switcher de Vista y Conteo */}
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="font-mono text-[.74rem] uppercase tracking-[.14em] text-text3">
              {totalActivitiesCount} {totalActivitiesCount === 1 ? "actividad" : "actividades"}
            </span>

            <div className="inline-flex border border-border p-0.5">
              <button
                type="button"
                onClick={() => onSelectViewMode("grid")}
                aria-label="Ver calendario mensual"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 font-mono text-[.72rem] uppercase tracking-[.1em] transition-colors",
                  viewMode === "grid" ? "bg-text text-bg font-semibold" : "text-text2 hover:text-text"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Mes</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectViewMode("list")}
                aria-label="Ver agenda cronológica"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 font-mono text-[.72rem] uppercase tracking-[.1em] transition-colors",
                  viewMode === "list" ? "bg-text text-bg font-semibold" : "text-text2 hover:text-text"
                )}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Agenda</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
