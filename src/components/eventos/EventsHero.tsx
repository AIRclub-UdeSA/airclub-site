"use client";

import { ArrowRight, LayoutGrid, List } from "lucide-react";
import type { CalendarActivity, CalendarActivityCategory } from "@/lib/calendar-types";
import { ActivityPanel, activityActionClass } from "./ActivityPanel";
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
          <ActivityPanel
            activity={nextActivity}
            variant="wide"
            label="Próxima Actividad"
            className="mb-10"
            action={
              <button type="button" onClick={() => onOpenActivity(nextActivity)} className={activityActionClass}>
                Ver detalles y participar
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          />
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
                  {cat.label}
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
