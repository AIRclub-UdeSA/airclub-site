"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CalendarActivity, CalendarActivityCategory } from "@/lib/calendar-types";
import { EventsHero } from "./EventsHero";
import { CalendarMonthGrid } from "./CalendarMonthGrid";
import { CalendarTimelineList } from "./CalendarTimelineList";
import { EventDetailModal } from "./EventDetailModal";

interface EventsHubProps {
  initialActivities: CalendarActivity[];
  nextActivity: CalendarActivity | null;
}

export function EventsHub({ initialActivities, nextActivity }: EventsHubProps) {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<CalendarActivityCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => searchParams.get("evento"));
  const [isModalOpen, setIsModalOpen] = useState(() => Boolean(searchParams.get("evento")));
  const [, startTransition] = useTransition();

  const activeSlug = isModalOpen ? selectedSlug : null;
  const activeActivity = initialActivities.find((a) => a.slug === activeSlug) ?? null;

  const handleOpenActivity = (activity: CalendarActivity) => {
    setSelectedSlug(activity.slug);
    setIsModalOpen(true);
    startTransition(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("evento", activity.slug);
      window.history.replaceState({}, "", url.toString());
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlug(null);
    startTransition(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("evento");
      window.history.replaceState({}, "", url.toString());
    });
  };

  // Filtrar actividades según categoría seleccionada
  const filteredActivities =
    selectedCategory === "all"
      ? initialActivities
      : initialActivities.filter((a) => a.category === selectedCategory);

  return (
    <>
      <EventsHero
        nextActivity={nextActivity}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        totalActivitiesCount={filteredActivities.length}
        onOpenActivity={handleOpenActivity}
      />

      <main className="min-h-[50vh]">
        {filteredActivities.length === 0 ? (
          <div className="mx-auto my-16 max-w-xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-[1.1rem] font-bold text-text2">
              No hay actividades en esta categoría
            </p>
            <p className="mt-2 font-mono text-[.82rem] text-text3">
              Seleccioná otra categoría o volvé a ver todas las fechas del club.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="mt-6 inline-flex rounded-full border border-border px-4 py-2 font-mono text-[.74rem] uppercase tracking-[.1em] text-text transition-colors hover:border-crimson hover:text-crimson-text"
            >
              Ver todas las actividades
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <CalendarMonthGrid activities={filteredActivities} onOpenActivity={handleOpenActivity} />
        ) : (
          <CalendarTimelineList activities={filteredActivities} onOpenActivity={handleOpenActivity} />
        )}
      </main>

      {/* Banda de Cierre: Proponer una actividad */}
      <section className="border-t border-text/15 bg-bg2 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <div className="border border-text bg-bg p-8 sm:p-12 md:p-16">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-[65ch]">
                <span className="font-mono text-[.74rem] uppercase tracking-[.2em] text-crimson-text">
                  Convocatoria Abierta
                </span>
                <h3 className="mt-2 font-display text-[clamp(1.8rem,4vw,3rem)] font-black uppercase leading-[1.05] tracking-tight text-text">
                  ¿Tenés algo que querés mostrar o enseñar?
                </h3>
                <p className="mt-4 font-body text-[1rem] leading-[1.7] text-text2">
                  Si tenés algo propio que querés mostrar, querés tener tus ideas difundidas,
                  enseñar algo nuevo a la comunidad o coordinar una actividad práctica en el club,
                  escribinos. El espacio está abierto para todos.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 rounded-full bg-crimson px-7 py-3 font-mono text-[.82rem] font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-crimson/90"
                >
                  Escribinos / Proponer idea
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Detalle unificado con formato TalkModal */}
      <EventDetailModal
        activity={activeActivity}
        activities={filteredActivities}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectActivity={(slug) => {
          const target = initialActivities.find((a) => a.slug === slug);
          if (target) handleOpenActivity(target);
        }}
      />
    </>
  );
}
