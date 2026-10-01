"use client";

import { Clock, MapPin, ArrowRight, ExternalLink } from "lucide-react";
import type { CalendarActivity } from "@/lib/calendar-types";
import { buildGoogleCalendarUrl } from "@/lib/calendar-types";
import { CategoryBadge, StatusBadge } from "./EventBadge";
import { cn } from "@/lib/utils";

interface CalendarTimelineListProps {
  activities: CalendarActivity[];
  onOpenActivity: (activity: CalendarActivity) => void;
}

const TIME_ZONE = "America/Argentina/Buenos_Aires";

export function CalendarTimelineList({ activities, onOpenActivity }: CalendarTimelineListProps) {
  // Agrupar actividades por Año-Mes
  const groups: { monthLabel: string; activities: CalendarActivity[] }[] = [];
  const map = new Map<string, CalendarActivity[]>();

  for (const act of activities) {
    let key = "Fechas a confirmar";
    if (act.startsAt) {
      const d = new Date(act.startsAt);
      key = new Intl.DateTimeFormat("es-AR", {
        month: "long",
        year: "numeric",
        timeZone: TIME_ZONE,
      }).format(d);
    }

    const existing = map.get(key) || [];
    existing.push(act);
    map.set(key, existing);
  }

  for (const [monthLabel, acts] of map.entries()) {
    groups.push({ monthLabel, activities: acts });
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-8 md:px-12">
      <div className="flex flex-col gap-16">
        {groups.map((group) => (
          <section key={group.monthLabel} className="flex flex-col">
            {/* Encabezado del mes en Syne */}
            <div className="mb-6 flex items-baseline justify-between border-b border-text pb-2">
              <h3 className="font-display text-[clamp(1.6rem,4vw,2.5rem)] font-extrabold uppercase tracking-tight text-text">
                {group.monthLabel}
              </h3>
              <span className="font-mono text-[.74rem] uppercase tracking-[.14em] text-mauve">
                {group.activities.length} {group.activities.length === 1 ? "actividad" : "actividades"}
              </span>
            </div>

            {/* Lista de tarjetas estilo ticket */}
            <div className="flex flex-col gap-5">
              {group.activities.map((act) => {
                const dateObj = act.startsAt ? new Date(act.startsAt) : null;
                const endDateObj = act.endsAt ? new Date(act.endsAt) : null;

                let dayNum = "—";
                let dayWeekday = "";
                let isRange = false;

                if (dateObj) {
                  const startDay = new Intl.DateTimeFormat("es-AR", { day: "2-digit", timeZone: TIME_ZONE }).format(dateObj);
                  const startWd = new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: TIME_ZONE }).format(dateObj);

                  if (endDateObj) {
                    const startKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(dateObj);
                    const endKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(endDateObj);

                    if (startKey !== endKey) {
                      const endDay = new Intl.DateTimeFormat("es-AR", { day: "2-digit", timeZone: TIME_ZONE }).format(endDateObj);
                      const endWd = new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: TIME_ZONE }).format(endDateObj);
                      dayNum = `${startDay}–${endDay}`;
                      dayWeekday = `${startWd} a ${endWd}`;
                      isRange = true;
                    } else {
                      dayNum = startDay;
                      dayWeekday = startWd;
                    }
                  } else {
                    dayNum = startDay;
                    dayWeekday = startWd;
                  }
                }

                const gcalUrl = buildGoogleCalendarUrl(act);

                return (
                  <article
                    key={act.id}
                    className={cn(
                      "group relative flex flex-col border border-text bg-bg transition-all hover:border-crimson lg:flex-row",
                      act.status === "past" && "bg-bg2/40 opacity-80"
                    )}
                  >
                    {/* Talón izquierdo con fecha monumental en Anton */}
                    <div className="flex items-center justify-between border-b border-border bg-bg2 p-5 sm:p-6 lg:w-56 lg:shrink-0 lg:flex-col lg:justify-between lg:border-b-0 lg:border-r">
                      <div className="flex items-baseline gap-3 lg:flex-col lg:items-start lg:gap-0">
                        <span
                          className={cn(
                            "font-logo leading-none text-text tracking-tight",
                            isRange ? "text-[clamp(1.85rem,3.8vw,2.9rem)]" : "text-[clamp(2.8rem,5vw,4.2rem)]"
                          )}
                        >
                          {dayNum}
                        </span>
                        <span className="font-mono text-[.78rem] uppercase tracking-[.14em] text-mauve">
                          {dayWeekday}
                        </span>
                      </div>
                      <div className="mt-2">
                        <StatusBadge status={act.status} />
                      </div>
                    </div>

                    {/* Cuerpo del ticket */}
                    <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                      <div>
                        {/* Metadatos y badges */}
                        <div className="mb-3 flex flex-wrap items-center gap-y-2 gap-x-4">
                          <CategoryBadge category={act.category} />
                          {isRange && (
                            <span className="border border-mauve/40 bg-mauve/10 px-2 py-0.5 font-mono text-[.66rem] uppercase tracking-[.1em] text-text">
                              Multi-día
                            </span>
                          )}
                          {act.timeLabel && (
                            <span className="inline-flex items-center gap-1.5 font-mono text-[.74rem] text-text2">
                              <Clock className="h-3.5 w-3.5 text-mauve" />
                              {act.timeLabel}
                            </span>
                          )}
                          {act.location && (
                            <span className="inline-flex items-center gap-1.5 font-mono text-[.74rem] text-text3">
                              <MapPin className="h-3.5 w-3.5 text-mauve" />
                              {act.location}
                            </span>
                          )}
                        </div>

                        {/* Título y subtítulo */}
                        <h4
                          onClick={() => onOpenActivity(act)}
                          className="cursor-pointer font-display text-[clamp(1.2rem,2.4vw,1.7rem)] font-extrabold uppercase leading-[1.1] tracking-tight text-text transition-colors group-hover:text-crimson-text"
                        >
                          {act.title}
                        </h4>

                        {act.subtitle && (
                          <p className="mt-1 font-mono text-[.76rem] uppercase tracking-[.12em] text-mauve">
                            {act.subtitle}
                          </p>
                        )}

                        <p className="mt-3 line-clamp-2 max-w-[75ch] font-body text-[.92rem] leading-relaxed text-text2">
                          {act.description}
                        </p>

                        {act.instructorOrSpeaker && (
                          <p className="mt-2 font-mono text-[.74rem] text-text3">
                            <span className="uppercase text-text2">A cargo:</span> {act.instructorOrSpeaker}
                          </p>
                        )}
                      </div>

                      {/* Acciones del ticket */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onOpenActivity(act)}
                            className="inline-flex items-center gap-2 rounded-full bg-text px-4 py-1.5 font-mono text-[.74rem] uppercase tracking-[.1em] text-bg transition-colors hover:bg-crimson hover:text-white"
                          >
                            Detalles
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>

                          {act.externalUrl && (
                            <a
                              href={act.externalUrl}
                              target={act.externalUrl.startsWith("http") ? "_blank" : undefined}
                              rel={act.externalUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                              className="inline-flex items-center gap-1.5 font-mono text-[.74rem] uppercase tracking-[.1em] text-crimson-text hover:underline"
                            >
                              {act.ctaLabel || "Acceder"}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {act.startsAt && act.status !== "past" && (
                          <a
                            href={gcalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[.72rem] uppercase tracking-[.1em] text-text3 transition-colors hover:text-text"
                          >
                            + Agendar
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
