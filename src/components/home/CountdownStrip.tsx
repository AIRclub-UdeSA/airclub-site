"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import type { EventItem } from "@/lib/events";

// Carga dinámica con SSR deshabilitado para el fondo 3D shadergradient
const ShaderGradientBg = dynamic(
  () => import("./ShaderGradientBg").then((mod) => mod.ShaderGradientBg),
  { ssr: false }
);

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
      <section className="border-y border-border/40 bg-card/60 dark:bg-card/25 text-text px-6 sm:px-8 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-crimson" />
            </span>
            <span className="font-mono text-[.8rem] uppercase tracking-[.18em] font-semibold text-crimson">
              [EN CURSO]
            </span>
            <span className="font-display text-[1.15rem] font-bold text-text">
              {event.title}
            </span>
          </div>
          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[.82rem] font-semibold uppercase tracking-wider text-crimson-text hover:underline"
            >
              <span>Sitio oficial del evento</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="cuenta-regresiva"
      className="relative border-y border-white/10 bg-[#0e0407] text-[#f5e8ec] overflow-hidden my-16 py-16 sm:py-24"
    >
      {/* Fondo inmersivo 3D ShaderGradient en paleta carmesí/vino auténtica */}
      <ShaderGradientBg />

      {/* Contenido en primer plano */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Lado izquierdo: Título, descripción y botones oficiales */}
          <div className="lg:col-span-6 xl:col-span-6">
            <h2 className="font-display text-[clamp(2.4rem,4.2vw,3.6rem)] font-black tracking-tight text-[#f5e8ec] leading-[0.94] uppercase mb-5">
              Challenge JAR 2026,
              <br />
              <span className="text-[#f0357f]">Rosario.</span>
            </h2>

            <p className="font-body text-[1rem] sm:text-[1.08rem] text-[#f5e8ec]/85 leading-[1.75] mb-8 max-w-lg">
              El AIR Club UdeSA presenta un desafío nacional de comportamiento autónomo con robots móviles en la Jornada Argentina de Robótica. Desarrollá en Gazebo y competí en pista física.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#f5e8ec] px-7 py-3.5 font-mono text-[.82rem] font-semibold uppercase tracking-[.12em] text-[#f5e8ec] hover:bg-[#f5e8ec] hover:text-[#0e0407] transition-all"
                >
                  <span>Sitio oficial JAR 2026</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
              <a
                href="https://forms.gle/2zkW6gwJQptUzbXn6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[.82rem] font-semibold uppercase tracking-[.12em] text-[#ddaabc]/80 hover:text-[#f0357f] transition-colors"
              >
                Postular equipo ↗
              </a>
            </div>
          </div>

          {/* Lado derecho: Cronómetro puramente minimalista sin cajas ni bordes */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-center lg:items-end justify-center">
            <div id="cronometro-unidades" className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4.5">
              <Unit value={parts?.d} label="Días" />
              <Sep />
              <Unit value={parts?.h} label="Horas" />
              <Sep />
              <Unit value={parts?.m} label="Minutos" />
              <Sep />
              <Unit value={parts?.s} label="Segundos" isLive />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Unit({ value, label, isLive }: { value?: number; label: string; isLive?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`block font-display text-[clamp(1.8rem,3vw,3rem)] font-extrabold leading-none tracking-tight tabular-nums ${
          isLive ? "text-[#f0357f]" : "text-[#f5e8ec]"
        }`}
      >
        {value === undefined ? "--" : pad(value)}
      </span>
      <span
        className={`mt-2 block font-mono text-[.56rem] sm:text-[.64rem] uppercase tracking-[.2em] ${
          isLive ? "text-[#f0357f]/90 font-semibold" : "text-[#ddaabc]/80 font-medium"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span className="font-display text-[1.3rem] sm:text-[1.8rem] font-light text-white/20 -translate-y-1.5 select-none">
      :
    </span>
  );
}
