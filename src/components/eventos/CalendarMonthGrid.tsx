"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from "lucide-react";
import type { CalendarActivity } from "@/lib/calendar-types";
import { getUdesaAcademicDate, getUdesaHoliday } from "@/lib/udesa-calendar";
import { cn } from "@/lib/utils";

interface CalendarMonthGridProps {
  activities: CalendarActivity[];
  onOpenActivity: (activity: CalendarActivity) => void;
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const TIME_ZONE = "America/Argentina/Buenos_Aires";

interface CalendarDayCell {
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  dayKey: string;
}

interface WeekEventSegment {
  activity: CalendarActivity;
  startCol: number; // 1 to 7 (1-indexed for CSS grid)
  endCol: number;   // 2 to 8 (exclusive for CSS grid: e.g. 2 / 6 spans cols 2,3,4,5)
  spanCols: number;
  isMultiDay: boolean;
  continuesFromPrev: boolean;
  continuesToNext: boolean;
}

/**
 * Calcula los segmentos de eventos que caen dentro de una semana específica (7 días).
 * Los eventos multi-día forman UN SOLO bloque continuo que abarca todas sus columnas en esa semana.
 */
function getWeekEventSlots(week: CalendarDayCell[], activities: CalendarActivity[]): WeekEventSegment[][] {
  if (week.length === 0) return [];
  const weekStartKey = week[0].dayKey;
  const weekEndKey = week[6].dayKey;

  const segments: WeekEventSegment[] = [];

  for (const act of activities) {
    if (!act.startsAt) continue;

    const startDate = new Date(act.startsAt);
    const startKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(startDate);
    const endDate = act.endsAt ? new Date(act.endsAt) : startDate;
    const endKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(endDate);

    // Si termina antes de la semana o empieza después, no corresponde a esta semana
    if (endKey < weekStartKey || startKey > weekEndKey) continue;

    // Columna inicial en esta semana (0 a 6)
    let startColIndex = 0;
    let continuesFromPrev = false;
    if (startKey < weekStartKey) {
      startColIndex = 0;
      continuesFromPrev = true;
    } else {
      const idx = week.findIndex((d) => d.dayKey === startKey);
      startColIndex = idx >= 0 ? idx : 0;
    }

    // Columna final en esta semana (0 a 6)
    let endColIndex = 6;
    let continuesToNext = false;
    if (endKey > weekEndKey) {
      endColIndex = 6;
      continuesToNext = true;
    } else {
      const idx = week.findIndex((d) => d.dayKey === endKey);
      endColIndex = idx >= 0 ? idx : 6;
    }

    const spanCols = Math.max(1, endColIndex - startColIndex + 1);
    const isMultiDay = startKey !== endKey;

    segments.push({
      activity: act,
      startCol: startColIndex + 1, // 1-based
      endCol: endColIndex + 2,     // 1-based exclusive
      spanCols,
      isMultiDay,
      continuesFromPrev,
      continuesToNext,
    });
  }

  // Ordenar segmentos: mayor span primero (para que multi-día ocupe la fila superior)
  // luego por startCol ascendente
  segments.sort((a, b) => {
    if (a.spanCols !== b.spanCols) return b.spanCols - a.spanCols;
    if (a.startCol !== b.startCol) return a.startCol - b.startCol;
    const timeA = a.activity.startsAt ? new Date(a.activity.startsAt).getTime() : 0;
    const timeB = b.activity.startsAt ? new Date(b.activity.startsAt).getTime() : 0;
    return timeA - timeB;
  });

  // Distribuir en filas/slots sin colisión
  const slots: WeekEventSegment[][] = [];
  for (const seg of segments) {
    let placed = false;
    for (const slot of slots) {
      const collides = slot.some(
        (existing) => !(seg.endCol <= existing.startCol || seg.startCol >= existing.endCol)
      );
      if (!collides) {
        slot.push(seg);
        placed = true;
        break;
      }
    }
    if (!placed) {
      slots.push([seg]);
    }
  }

  return slots;
}

function getBaYearMonth(d: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(d);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value) - 1;
  return { year, month };
}

export function CalendarMonthGrid({ activities, onOpenActivity }: CalendarMonthGridProps) {
  // Inicializar en el mes del primer evento futuro (u hoy) en hora de Buenos Aires
  const rawDate = activities.find((a) => a.isUpcoming)?.startsAt
    ? new Date(activities.find((a) => a.isUpcoming)!.startsAt!)
    : new Date();
  const { year: initYear, month: initMonth } = getBaYearMonth(rawDate);

  const [currentDate, setCurrentDate] = useState(
    new Date(initYear, initMonth, 1)
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    timeZone: TIME_ZONE,
  }).format(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayKey(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayKey(null);
  };

  const goToToday = () => {
    const { year: nowY, month: nowM } = getBaYearMonth(new Date());
    setCurrentDate(new Date(nowY, nowM, 1));
    setSelectedDayKey(null);
  };

  // Calcular matriz de días para el mes (Lunes = 0, ..., Domingo = 6)
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper para armar key YYYY-MM-DD
  const formatDayKey = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  // Días previos de relleno (maneja cambio de año/mes automáticamente)
  const prevDays: CalendarDayCell[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dateObj = new Date(year, month, -i);
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const d = dateObj.getDate();
    prevDays.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: false,
      dayKey: formatDayKey(y, m, d),
    });
  }

  // Días del mes actual
  const currentDays: CalendarDayCell[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentDays.push({
      day: d,
      month,
      year,
      isCurrentMonth: true,
      dayKey: formatDayKey(year, month, d),
    });
  }

  // Días posteriores para completar la última semana (maneja cambio de año/mes automáticamente)
  const totalSlots = prevDays.length + currentDays.length;
  const remainingSlots = (7 - (totalSlots % 7)) % 7;
  const nextDays: CalendarDayCell[] = [];
  for (let d = 1; d <= remainingSlots; d++) {
    const dateObj = new Date(year, month + 1, d);
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const dNum = dateObj.getDate();
    nextDays.push({
      day: dNum,
      month: m,
      year: y,
      isCurrentMonth: false,
      dayKey: formatDayKey(y, m, dNum),
    });
  }

  const allCalendarDays = [...prevDays, ...currentDays, ...nextDays];

  // Agrupar en semanas de 7 días
  const weeks: CalendarDayCell[][] = [];
  for (let i = 0; i < allCalendarDays.length; i += 7) {
    weeks.push(allCalendarDays.slice(i, i + 7));
  }

  // Mapa de actividades por día (para selector y drawer en mobile)
  const activitiesByDay = new Map<string, CalendarActivity[]>();
  for (const act of activities) {
    if (!act.startsAt) continue;
    const sDate = new Date(act.startsAt);
    const eDate = act.endsAt ? new Date(act.endsAt) : sDate;
    const sKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(sDate);
    const eKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(eDate);

    const [sy, sm, sd] = sKey.split("-").map(Number);
    const [ey, em, ed] = eKey.split("-").map(Number);
    const cur = new Date(Date.UTC(sy, sm - 1, sd, 12, 0, 0));
    const end = new Date(Date.UTC(ey, em - 1, ed, 12, 0, 0));

    while (cur.getTime() <= end.getTime()) {
      const y = cur.getUTCFullYear();
      const m = String(cur.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cur.getUTCDate()).padStart(2, "0");
      const k = `${y}-${m}-${d}`;
      const list = activitiesByDay.get(k) || [];
      if (!list.some((a) => a.id === act.id)) {
        list.push(act);
        activitiesByDay.set(k, list);
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  }

  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());

  // Actividades del día seleccionado en mobile
  const selectedDayActivities = selectedDayKey ? activitiesByDay.get(selectedDayKey) || [] : [];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8 md:px-12">
      {/* Controles de Navegación del Mes */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[clamp(1.5rem,3.2vw,2.4rem)] font-black uppercase tracking-tight text-text">
            {monthName} <span className="font-mono font-normal text-text3">{year}</span>
          </h2>
          <button
            type="button"
            onClick={goToToday}
            className="border border-border px-2.5 py-1 font-mono text-[.68rem] uppercase tracking-[.1em] text-text2 transition-colors hover:border-text hover:text-text"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Mes anterior"
            className="flex h-9 w-9 items-center justify-center border border-border bg-bg text-text transition-colors hover:border-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mes siguiente"
            className="flex h-9 w-9 items-center justify-center border border-border bg-bg text-text transition-colors hover:border-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grilla Mensual */}
      <div className="border border-text bg-border">
        {/* Cabecera de 7 días */}
        <div className="grid grid-cols-7 gap-px bg-text">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="bg-bg2 py-2.5 text-center font-mono text-[.74rem] font-bold uppercase tracking-[.16em] text-text"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Semanas del Mes */}
        <div className="flex flex-col divide-y divide-border bg-border">
          {weeks.map((week, weekIdx) => {
            const slots = getWeekEventSlots(week, activities);

            return (
              <div
                key={`week-${weekIdx}`}
                className="relative min-h-[105px] sm:min-h-[125px] md:min-h-[140px] bg-bg"
              >
                {/* Capa 1: Retícula de fondo y números de día */}
                <div className="absolute inset-0 grid grid-cols-7 gap-px bg-border">
                  {week.map((cell) => {
                    const isToday = cell.dayKey === todayKey;
                    const isSelected = selectedDayKey === cell.dayKey;
                    const dayActs = activitiesByDay.get(cell.dayKey) || [];
                    const hasActivities = dayActs.length > 0;
                    const holiday = getUdesaHoliday(cell.dayKey);
                    const academicDate = getUdesaAcademicDate(cell.dayKey);

                    return (
                      <div
                        key={cell.dayKey}
                        title={holiday ? `Feriado: ${holiday.name}` : undefined}
                        onClick={() => {
                          if (hasActivities) setSelectedDayKey(cell.dayKey);
                        }}
                        className={cn(
                          "flex flex-col justify-between p-1.5 sm:p-2 transition-colors",
                          cell.isCurrentMonth ? (holiday ? "bg-bg2" : "bg-bg") : "bg-bg2/40 opacity-40",
                          hasActivities && "cursor-pointer hover:bg-bg2/40",
                          isSelected && "ring-2 ring-inset ring-crimson"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "font-mono text-[.76rem] font-semibold",
                              isToday
                                ? "flex h-5 w-5 items-center justify-center rounded-full bg-crimson text-[.7rem] text-white"
                                : holiday
                                ? "text-crimson-text"
                                : cell.isCurrentMonth
                                ? "text-text"
                                : "text-text3"
                            )}
                          >
                            {cell.day}
                          </span>
                          {isToday ? (
                            <span className="hidden font-mono text-[.6rem] font-bold uppercase tracking-[.1em] text-crimson-text sm:inline">
                              Hoy
                            </span>
                          ) : (
                            holiday && (
                              <span className="hidden font-mono text-[.6rem] uppercase tracking-[.1em] text-crimson-text sm:inline">
                                Feriado
                              </span>
                            )
                          )}
                        </div>

                        {/* Fecha académica de UdeSA, abajo del día para no chocar con las barras de eventos */}
                        {academicDate && (
                          <span className="mt-auto hidden truncate font-mono text-[.58rem] uppercase tracking-[.08em] text-text3 sm:block">
                            {academicDate.label}
                          </span>
                        )}

                        {/* Indicadores en celulares ultra-pequeños */}
                        {hasActivities && (
                          <div className="mt-auto flex flex-wrap gap-1 sm:hidden">
                            {dayActs.map((act) => (
                              <span
                                key={act.id}
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  act.category === "talk"
                                    ? "bg-crimson"
                                    : act.category === "workshop"
                                    ? "bg-rose-500"
                                    : act.category === "competition"
                                    ? "bg-mauve"
                                    : "bg-text3"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Capa 2: Barras continuas de eventos sobre la retícula */}
                <div className="relative z-10 flex flex-col gap-1.5 px-1 pb-2 pt-8 pointer-events-none">
                  {slots.map((slot, slotIdx) => (
                    <div key={`slot-${weekIdx}-${slotIdx}`} className="grid grid-cols-7 gap-1">
                      {slot.map((segment) => {
                        const act = segment.activity;
                        const spanCols = segment.spanCols;

                        // Estilos por categoría
                        let themeStyles = "";
                        if (act.category === "talk") {
                          themeStyles =
                            "bg-crimson/15 border-crimson/50 text-crimson-text hover:bg-crimson/25 hover:border-crimson";
                        } else if (act.category === "competition") {
                          themeStyles =
                            "bg-mauve/20 border-mauve/55 text-text hover:bg-mauve/30 hover:border-mauve";
                        } else if (act.category === "workshop") {
                          themeStyles =
                            "bg-rose/25 border-crimson/50 text-text hover:bg-rose/35 hover:border-crimson";
                        } else {
                          themeStyles =
                            "bg-bg2 border-border text-text2 hover:border-text hover:text-text";
                        }

                        return (
                          <div
                            key={act.id}
                            style={{
                              gridColumn: `${segment.startCol} / ${segment.endCol}`,
                            }}
                            className="pointer-events-auto relative group/bar"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenActivity(act);
                              }}
                              className={cn(
                                "flex w-full items-center justify-between rounded-sm border text-left transition-all duration-200 ease-out will-change-transform",
                                // Expansión al hacer hover: escala sutil, elevación z-index y sombra
                                "hover:scale-[1.015] hover:-translate-y-0.5 hover:z-30 hover:shadow-lg motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0",
                                themeStyles,
                                spanCols > 1 ? "px-2.5 py-1 gap-2" : "p-1 gap-1",
                                segment.continuesFromPrev && "rounded-l-none border-l-0",
                                segment.continuesToNext && "rounded-r-none border-r-0"
                              )}
                            >
                              {/* Barra Multi-Día Continua */}
                              {spanCols >= 2 ? (
                                <>
                                  <div className="flex min-w-0 items-center gap-2">
                                    {segment.continuesFromPrev && (
                                      <span className="font-mono text-[.66rem] text-mauve shrink-0">◀</span>
                                    )}
                                    <span className="shrink-0 rounded-[2px] bg-bg/80 px-1.5 py-0.5 font-mono text-[.6rem] font-bold uppercase tracking-wider text-crimson-text shadow-sm">
                                      {act.category === "competition"
                                        ? "Competencia"
                                        : act.category === "talk"
                                        ? "AIR Talk"
                                        : act.category === "workshop"
                                        ? "Taller"
                                        : act.category}
                                    </span>
                                    <span className="truncate font-display text-[.78rem] sm:text-[.84rem] font-bold leading-tight group-hover/bar:underline">
                                      {act.title}
                                    </span>
                                    {act.subtitle && (
                                      <span className="hidden lg:inline truncate font-mono text-[.68rem] text-mauve">
                                        — {act.subtitle}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex shrink-0 items-center gap-2">
                                    {act.location && (
                                      <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[.64rem] text-text3">
                                        <MapPin className="h-3 w-3 text-mauve shrink-0" />
                                        <span className="truncate max-w-[120px]">{act.location}</span>
                                      </span>
                                    )}
                                    <span className="font-mono text-[.66rem] font-semibold text-crimson-text opacity-90 group-hover/bar:translate-x-0.5 transition-transform">
                                      Ver ficha →
                                    </span>
                                    {segment.continuesToNext && (
                                      <span className="font-mono text-[.66rem] text-mauve shrink-0">▶</span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                /* Evento de 1 solo día */
                                <div className="flex w-full flex-col items-start overflow-hidden">
                                  <div className="flex w-full items-center justify-between font-mono text-[.6rem]">
                                    <span className="truncate uppercase font-bold tracking-wider">
                                      {act.timeLabel || (act.category === "talk" ? "AIR Talk" : act.category)}
                                    </span>
                                  </div>
                                  <span className="w-full truncate font-display text-[.72rem] font-bold leading-tight group-hover/bar:underline">
                                    {act.title}
                                  </span>
                                </div>
                              )}
                            </button>

                            {/* Popover flotante al pasar el mouse por encima */}
                            <div
                              role="tooltip"
                              className={cn(
                                "pointer-events-none absolute z-50 hidden w-64 flex-col rounded-sm border border-text bg-bg p-3 shadow-2xl transition-all duration-150 group-hover/bar:flex",
                                weekIdx === 0 ? "top-full mt-2" : "bottom-full mb-2",
                                segment.startCol === 1
                                  ? "left-0 translate-x-0"
                                  : segment.endCol === 8
                                  ? "right-0 translate-x-0"
                                  : "left-1/2 -translate-x-1/2"
                              )}
                            >
                              <div className="flex items-center justify-between border-b border-border pb-1.5 font-mono text-[.64rem] uppercase tracking-wider">
                                <span className="font-bold text-crimson-text">
                                  {act.category === "talk"
                                    ? "AIR Talk"
                                    : act.category === "competition"
                                    ? "Competencia"
                                    : act.category === "workshop"
                                    ? "Taller"
                                    : act.category}
                                </span>
                                {segment.isMultiDay && (
                                  <span className="text-text3">Multi-día</span>
                                )}
                              </div>

                              <p className="mt-2 font-display text-[.86rem] font-bold leading-snug text-text">
                                {act.title}
                              </p>

                              {act.subtitle && (
                                <p className="mt-0.5 font-mono text-[.68rem] text-mauve">
                                  {act.subtitle}
                                </p>
                              )}

                              <div className="mt-2 flex flex-col gap-0.5 border-t border-border pt-1.5 font-mono text-[.66rem] text-text2">
                                <div className="flex items-center gap-1.5">
                                  <CalendarIcon className="h-3 w-3 shrink-0 text-mauve" />
                                  <span className="truncate">{act.dateLabel}</span>
                                </div>
                                {act.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 shrink-0 text-mauve" />
                                    <span className="truncate">{act.location}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 flex items-center justify-between border-t border-border/80 pt-1.5 font-mono text-[.62rem] font-semibold text-crimson-text">
                                <span>Click para abrir detalles</span>
                                <span>↗</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalle expandido al tocar un día en mobile */}
      {selectedDayActivities.length > 0 && (
        <div className="mt-6 border border-border bg-bg2 p-4 sm:hidden">
          <h3 className="mb-3 font-mono text-[.74rem] uppercase tracking-[.14em] text-text3">
            Actividades del día:
          </h3>
          <div className="flex flex-col gap-2">
            {selectedDayActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => onOpenActivity(act)}
                className="flex items-center justify-between border border-border bg-bg p-3 cursor-pointer hover:border-crimson"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[.68rem] uppercase font-bold text-crimson-text">
                      {act.category === "talk"
                        ? "AIR Talk"
                        : act.category === "competition"
                        ? "Competencia"
                        : act.category === "workshop"
                        ? "Taller"
                        : act.category}
                    </span>
                  </div>
                  <p className="font-display text-[.88rem] font-bold text-text">{act.title}</p>
                  <p className="font-mono text-[.68rem] text-text3">{act.dateLabel}</p>
                </div>
                <span className="font-mono text-[.74rem] text-crimson-text">Ver →</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
