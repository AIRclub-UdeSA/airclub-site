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
      <section className="border-y border-[#42433d] bg-[#0e100f] text-[#fffce1] px-6 sm:px-8 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="font-display text-[1.2rem] font-bold">🎉 {event.title} está en curso</span>
          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[.82rem] font-semibold uppercase tracking-wider text-[#ff2a6d] hover:underline"
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
    <section
      id="cuenta-regresiva"
      className="relative border-y border-white/10 bg-[#0e0309] text-[#fffce1] overflow-hidden my-16 py-16 sm:py-24"
    >
      {/* Fondo inmersivo 3D ShaderGradient en paleta carmesí/vino auténtica */}
      <ShaderGradientBg />

      {/* Contenido en primer plano */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
          {/* Lado izquierdo: Título, descripción y botones oficiales */}
          <div className="lg:col-span-6 xl:col-span-6">
            <h2 className="font-display text-[clamp(2.4rem,4.2vw,3.6rem)] font-black tracking-tight text-[#fffce1] leading-[0.94] uppercase mb-5">
              Challenge JAR 2026,
              <br />
              <span className="text-[#ff2a6d]">Rosario.</span>
            </h2>

            <p className="font-body text-[1rem] sm:text-[1.08rem] text-[#fffce1]/85 leading-[1.75] mb-8 max-w-lg">
              El AIR Club UdeSA presenta un desafío nacional de comportamiento autónomo con robots móviles en la Jornada Argentina de Robótica. Desarrollá en Gazebo y competí en pista física.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#fffce1] px-7 py-3.5 font-mono text-[.82rem] font-semibold uppercase tracking-[.12em] text-[#fffce1] hover:bg-[#fffce1] hover:text-[#0e100f] transition-all"
                >
                  <span>Sitio oficial JAR 2026</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
              <a
                href="https://forms.gle/2zkW6gwJQptUzbXn6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[.82rem] font-semibold uppercase tracking-[.12em] text-[#fffce1]/70 hover:text-[#ff2a6d] transition-colors"
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
          isLive ? "text-[#ff2a6d]" : "text-[#fffce1]"
        }`}
      >
        {value === undefined ? "--" : pad(value)}
      </span>
      <span
        className={`mt-2 block font-mono text-[.56rem] sm:text-[.64rem] uppercase tracking-[.2em] ${
          isLive ? "text-[#ff2a6d]/90 font-semibold" : "text-[#ddaabc]/80 font-medium"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span className="font-display text-[1.3rem] sm:text-[1.8rem] font-light text-white/25 -translate-y-1.5 select-none">
      :
    </span>
  );
}
