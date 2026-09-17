"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Timer } from "lucide-react";
import type { EventItem } from "@/lib/events";

function diffParts(targetMs: number) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}
const pad = (n: number) => String(n).padStart(2, "0");

export function CountdownStrip({ event }: { event: EventItem }) {
  const targetMs = event.startsAt.getTime();
  const [parts, setParts] = useState<ReturnType<typeof diffParts>>(null);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    function tick() {
      const next = diffParts(targetMs);
      setParts(next);
      setIsPast(next === null);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (isPast) {
    return (
      <section className="border-y border-border bg-card text-text px-6 sm:px-8 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="font-display text-[1.2rem] font-bold">🎉 {event.title} está en curso</span>
          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[.82rem] font-semibold uppercase tracking-wider text-crimson hover:underline"
            >
              Ver transmisión en vivo
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="cuenta-regresiva" className="border-y border-border/80 bg-surface/30 my-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Lado izquierdo: Metadatos editoriales del evento */}
          <div className="lg:col-span-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[.7rem] uppercase tracking-[.22em] text-crimson font-bold">
                <Timer className="h-3.5 w-3.5" />
                Hito Nacional del Club
              </span>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-extrabold tracking-tight text-text leading-[1.05] uppercase mb-3">
              Challenge JAR 2026, Rosario
            </h2>
            <p className="font-body text-[.98rem] text-text2 leading-[1.7] mb-6 max-w-lg">
              El AIR Club UdeSA presenta un desafío de comportamiento autónomo con robots móviles en la Jornada Argentina de Robótica. Desarrollá en Gazebo y competí en pista física.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-text bg-text px-6 py-2.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-bg transition-all hover:bg-crimson hover:border-crimson"
                >
                  Sitio oficial JAR 2026
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              <a
                href="https://forms.gle/2zkW6gwJQptUzbXn6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-text2 hover:text-crimson transition-colors"
              >
                Postular equipo ↗
              </a>
            </div>
          </div>

          {/* Lado derecho: Cronómetro Monumental en Columnas Arquitectónicas (Sin caja redondeada!) */}
          <div className="lg:col-span-6 flex justify-start lg:justify-end">
            <div className="grid grid-cols-4 divide-x divide-border/80 border-y sm:border-x border-border/80 bg-card py-6 px-2 sm:px-6 w-full max-w-xl">
              <Unit value={parts?.d} label="Días" />
              <Unit value={parts?.h} label="Horas" />
              <Unit value={parts?.m} label="Minutos" />
              <Unit value={parts?.s} label="Segundos" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Unit({ value, label }: { value?: number; label: string }) {
  return (
    <div className="text-center px-2 sm:px-4">
      <span className="block font-logo text-[2.8rem] sm:text-[3.6rem] md:text-[4.2rem] font-normal leading-none tracking-tight text-text">
        {value === undefined ? "--" : pad(value)}
      </span>
      <span className="mt-2 block font-mono text-[.64rem] uppercase tracking-[.22em] text-mauve font-semibold">
        {label}
      </span>
    </div>
  );
}
