"use client";

import { useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import type { TalkMedia } from "@/lib/talks";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const IMAGE_SECONDS = 5;

interface TalkSlideshowProps {
  media: TalkMedia[];
  title: string;
  /** Contenido superpuesto abajo a la izquierda (la fecha). No intercepta clics. */
  overlay?: React.ReactNode;
}

// Fotos que avanzan solas: la barra de arriba muestra cuánto falta, tocar una barra salta a esa foto,
// y tocar la foto pasa a la siguiente. El cursor encima la pausa. Con "menos movimiento" no hay auto-avance.
export function TalkSlideshow({ media, title, overlay }: TalkSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [videoSeconds, setVideoSeconds] = useState<Record<number, number>>({});
  const reducedMotion = usePrefersReducedMotion();

  const count = media.length;
  const active = media[index];
  const isVideo = active.type === "video";
  const goNext = () => setIndex((i) => (i + 1) % count);

  return (
    <div className="talk-progress relative aspect-[16/9] w-full overflow-hidden bg-black text-white sm:aspect-[2/1]">
      {active.type === "image" ? (
        <Image
          key={active.src}
          src={active.src}
          alt={`${title}, foto ${index + 1} de ${count}`}
          fill
          sizes="(min-width: 1024px) 992px, 100vw"
          className="object-cover"
        />
      ) : (
        <video
          key={active.src}
          ref={(el) => {
            if (el) el.muted = muted;
          }}
          src={active.src}
          poster={active.poster}
          muted
          autoPlay={!reducedMotion}
          controls={reducedMotion}
          loop={count === 1}
          playsInline
          onLoadedMetadata={(e) => {
            const seconds = e.currentTarget.duration;
            if (Number.isFinite(seconds)) setVideoSeconds((prev) => ({ ...prev, [index]: seconds }));
          }}
          onEnded={count > 1 ? goNext : undefined}
          className="h-full w-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />

      {count > 1 && !(isVideo && reducedMotion) && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Foto siguiente"
          className="absolute inset-0 cursor-pointer"
        />
      )}

      {count > 1 && (
        <div className="absolute inset-x-0 top-0 z-10 flex gap-1.5 px-4 pt-2 sm:px-6">
          {media.map((m, i) => (
            <button
              key={m.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1} de ${count}`}
              aria-current={i === index ? "true" : undefined}
              className="flex-1 cursor-pointer py-2.5"
            >
              <span className="relative block h-[3px] overflow-hidden bg-white/35">
                {i < index && <span className="absolute inset-0 bg-white" />}
                {i === index && (
                  <span
                    key={index}
                    className="talk-progress-bar absolute inset-0 origin-left bg-white"
                    style={
                      {
                        "--dur": `${m.type === "video" ? (videoSeconds[i] ?? IMAGE_SECONDS) : IMAGE_SECONDS}s`,
                      } as React.CSSProperties
                    }
                    // Las fotos avanzan cuando se llena la barra; los videos, cuando terminan de reproducirse.
                    onAnimationEnd={m.type === "image" ? goNext : undefined}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      {isVideo && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
          className="absolute bottom-4 right-4 z-10 flex size-11 cursor-pointer items-center justify-center border border-white/60 bg-black/50 text-white transition-colors hover:bg-black/70 sm:bottom-6 sm:right-6"
        >
          {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
      )}

      {overlay && <div className="pointer-events-none absolute bottom-5 left-5 z-[5] sm:bottom-7 sm:left-8">{overlay}</div>}
    </div>
  );
}
