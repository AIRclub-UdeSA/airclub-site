"use client";

import { useEffect, useState } from "react";
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
  // null = "todavia no sabemos" (server) hasta que ya paso el evento; se resuelve
  // recien en el efecto, nunca durante el render, para no leer el reloj (impuro) ahi.
  const [parts, setParts] = useState<ReturnType<typeof diffParts>>(null);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    // El paso del tiempo es un sistema externo a React: sincronizarlo requiere
    // un efecto (setInterval), no es algo derivable de props/estado.
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
      <div className="relative z-[2] flex items-center justify-between gap-5 bg-gradient-to-br from-crimson to-magenta px-15 py-4 text-white max-md:px-5.5">
        <span className="font-display text-[1.1rem] font-bold">🎉 {event.title} está en curso</span>
      </div>
    );
  }

  return (
    <div className="relative z-[2] flex flex-wrap items-center justify-between gap-5 bg-gradient-to-br from-crimson to-magenta px-15 py-4 text-white max-md:px-5.5">
      <div>
        <div className="font-mono text-[.68rem] uppercase tracking-[.15em] opacity-80">Próximo evento</div>
        <div className="font-display text-[1rem] font-bold">{event.title}</div>
        {event.externalUrl && (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[.7rem] uppercase tracking-[.08em] text-white opacity-85 underline underline-offset-[3px]"
          >
            Ver más detalles →
          </a>
        )}
      </div>
      <div className="flex items-center gap-5">
        <Unit value={parts?.d} label="días" />
        <Sep />
        <Unit value={parts?.h} label="horas" />
        <Sep />
        <Unit value={parts?.m} label="min" />
        <Sep />
        <Unit value={parts?.s} label="seg" />
      </div>
    </div>
  );
}

function Unit({ value, label }: { value?: number; label: string }) {
  return (
    <div className="text-center">
      <span className="block font-display text-[1.8rem] font-extrabold leading-none">{value === undefined ? "--" : pad(value)}</span>
      <span className="font-mono text-[.58rem] uppercase tracking-[.1em] opacity-75">{label}</span>
    </div>
  );
}

function Sep() {
  return <div className="-mt-1 text-[1.4rem] font-light opacity-50">:</div>;
}
