"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { TiltCard } from "@/components/shared/TiltCard";
import type { TeamMemberItem } from "@/lib/team";
import { cn } from "@/lib/utils";

// Tamaño en píxeles de la foto grupal original; los recortes de cada silueta se ubican en porcentajes de este marco.
const PHOTO = { src: "/equipo.jpg", w: 960, h: 1280 };
// Puntos (en píxeles del recorte) que se consultan alrededor del cursor al detectar si está sobre una persona.
const NEIGHBORHOOD: [number, number][] = [
  [0, 0],
  [-4, 0],
  [4, 0],
  [0, -4],
  [0, 4],
];

/**
 * Foto grupal + lista de nombres, conectadas en los dos sentidos: al pasar el mouse (o enfocar / tocar) el nombre de
 * alguien con silueta, esa persona se "enciende" en la foto y el resto se oscurece; y al pasar el mouse por la
 * silueta en la foto, se enciende también su nombre.
 */
export function FoundersShowcase({ team, caption }: { team: TeamMemberItem[]; caption: string }) {
  const [active, setActive] = useState<string | null>(null);
  const lit = useMemo(() => team.filter((m) => m.silhouette), [team]);

  // Transparencia de cada recorte (por nombre), para saber si el mouse está sobre la persona y no sobre el fondo.
  const alphaMaps = useRef<Record<string, ImageData>>({});
  useEffect(() => {
    let cancelled = false;
    for (const m of lit) {
      const img = new window.Image();
      img.onload = () => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        alphaMaps.current[m.name] = ctx.getImageData(0, 0, canvas.width, canvas.height);
      };
      img.src = m.silhouette!.src;
    }
    return () => {
      cancelled = true;
    };
  }, [lit]);

  /** Nombre de la persona bajo el punto (fx, fy), en fracciones del marco de la foto, o null si es fondo. */
  function personAt(fx: number, fy: number): string | null {
    const px = fx * PHOTO.w;
    const py = fy * PHOTO.h;
    for (const m of lit) {
      const s = m.silhouette!;
      const map = alphaMaps.current[m.name];
      if (!map) continue;
      const lx = px - s.box.x;
      const ly = py - s.box.y;
      if (lx < 0 || ly < 0 || lx >= s.box.w || ly >= s.box.h) continue;
      const ix = Math.floor((lx / s.box.w) * map.width);
      const iy = Math.floor((ly / s.box.h) * map.height);
      // Se mira también un entorno de unos píxeles para que los bordes y los huecos chicos no hagan parpadear el efecto.
      let alpha = 0;
      for (const [dx, dy] of NEIGHBORHOOD) {
        const x = Math.min(map.width - 1, Math.max(0, ix + dx));
        const y = Math.min(map.height - 1, Math.max(0, iy + dy));
        alpha = Math.max(alpha, map.data[(y * map.width + x) * 4 + 3]);
      }
      if (s.fadeBottom) {
        // La parte que se desvanece deja de contar como "la persona".
        const start = 1 - s.fadeBottom;
        const t = ly / s.box.h;
        if (t > start) alpha *= Math.max(0, 1 - (t - start) / s.fadeBottom);
      }
      if (alpha > 60) return m.name;
    }
    return null;
  }

  /** Posición del puntero dentro de la capa de detección, como fracción de su tamaño (ya descontando la inclinación 3D). */
  function fractionsOf(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    return { fx: e.nativeEvent.offsetX / el.clientWidth, fy: e.nativeEvent.offsetY / el.clientHeight };
  }

  return (
    <div className="mt-10 grid grid-cols-2 items-start gap-12 max-lg:grid-cols-1">
      <TiltCard max={5} scale={1.02} lift={0} className="rounded-card">
        <div className="border-trail-hover relative overflow-hidden rounded-card border-[1.5px] border-border bg-card">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={PHOTO.src}
              alt="Fundadores del AIR Club UdeSA con sus robots"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
            {/* Velo oscuro sobre todo el fondo */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 bg-[#0e0407] transition-opacity duration-500 ease-club",
                active ? "opacity-[0.78]" : "opacity-0",
              )}
            />
            {/* Siluetas encendidas */}
            {lit.map((m) => {
              const s = m.silhouette!;
              const on = active === m.name;
              const fade = s.fadeBottom
                ? `linear-gradient(to bottom, #000 ${(1 - s.fadeBottom) * 100}%, transparent 100%)`
                : undefined;
              return (
                <div
                  key={m.name}
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute transition-[opacity,filter] duration-500 ease-club",
                    on ? "opacity-100" : "opacity-0",
                  )}
                  style={{
                    left: `${(s.box.x / PHOTO.w) * 100}%`,
                    top: `${(s.box.y / PHOTO.h) * 100}%`,
                    width: `${(s.box.w / PHOTO.w) * 100}%`,
                    height: `${(s.box.h / PHOTO.h) * 100}%`,
                    filter: on ? "drop-shadow(0 0 7px rgba(255,42,109,.5)) brightness(1.08)" : "none",
                    ...(s.fadeBottom
                      ? {
                          WebkitMaskImage: fade,
                          maskImage: fade,
                        }
                      : {}),
                  }}
                >
                  <Image src={s.src} alt="" fill sizes="240px" className="object-contain" />
                </div>
              );
            })}
            {/* Capa de detección: pasar el mouse por una silueta enciende a esa persona y a su nombre */}
            {lit.length > 0 && (
              <div
                aria-hidden
                className={cn("absolute inset-0", active && "cursor-pointer")}
                onPointerMove={(e) => {
                  if (e.pointerType === "touch") return;
                  const { fx, fy } = fractionsOf(e);
                  setActive(personAt(fx, fy));
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType !== "touch") setActive(null);
                }}
                onClick={(e) => {
                  // En pantallas táctiles no hay "pasar por encima": tocar la silueta la enciende / apaga.
                  if ((e.nativeEvent as PointerEvent).pointerType !== "touch") return;
                  const { fx, fy } = fractionsOf(e);
                  const hit = personAt(fx, fy);
                  setActive((cur) => (hit && cur !== hit ? hit : null));
                }}
              />
            )}
          </div>
          <p className="border-t border-border px-5 py-3.5 font-mono text-[.7rem] font-semibold uppercase tracking-[.16em] text-text3">
            {caption}
          </p>
        </div>
      </TiltCard>
      <div>
        <p className="mb-6 max-w-[46ch] text-[.98rem] leading-[1.75] text-text2">
          Un grupo chico que sostiene todo lo que hace el club: desde armar el JAR 2026 hasta programar cada robot que
          ves acá.
        </p>
        <ul className="columns-2 max-md:columns-1">
          {team.map((member) => {
            const interactive = Boolean(member.silhouette);
            return (
              <li
                key={member.name}
                tabIndex={interactive ? 0 : undefined}
                onMouseEnter={interactive ? () => setActive(member.name) : undefined}
                onMouseLeave={interactive ? () => setActive(null) : undefined}
                onFocus={interactive ? () => setActive(member.name) : undefined}
                onBlur={interactive ? () => setActive(null) : undefined}
                onClick={interactive ? () => setActive((cur) => (cur === member.name ? null : member.name)) : undefined}
                className={cn(
                  "break-inside-avoid border-b border-dashed border-border py-3.5 font-display text-[1.2rem] font-bold tracking-tight transition-[color,padding-left] hover:pl-1.5 hover:text-crimson-text",
                  interactive &&
                    "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson-text",
                  active === member.name ? "pl-1.5 text-crimson-text" : "text-text",
                )}
              >
                {member.name}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
