"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import type { TalkMedia } from "@/lib/talks";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

const IMAGE_SECONDS = 5;

interface TalkSlideshowProps {
  media: TalkMedia[];
  title: string;
  /** Contenido superpuesto abajo a la izquierda (la fecha). No intercepta clics. */
  overlay?: React.ReactNode;
}

// Fotos que avanzan solas: los puntos de arriba marcan la actual (más ancha) y se va llenando de carmesí hasta
// que toca cambiar. Tocar un punto salta a esa foto y tocar la foto pasa a la siguiente. El avance no se pausa
// con el cursor encima. Con "menos movimiento" no hay auto-avance.
export function TalkSlideshow({ media, title, overlay }: TalkSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoFillRef = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const count = media.length;
  const active = media[index];
  const isVideo = active.type === "video";
  const isLight = active.type === "image" && Boolean(active.lightBg);
  const goTo = (i: number) => setIndex(i);
  const goNext = () => goTo((index + 1) % count);

  // El punto de un video se llena leyendo el tiempo en cada frame: `timeupdate` solo dispara unas 4 veces por
  // segundo y la barra avanzaba a saltos, mientras que la de las fotos es una animación CSS fluida.
  useEffect(() => {
    if (!isVideo) return;
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      const fill = videoFillRef.current;
      if (video && fill && video.duration > 0) {
        fill.style.transform = `scaleX(${video.currentTime / video.duration})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isVideo, index]);

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden sm:aspect-[2/1]",
        isLight ? "bg-white text-text border-b border-border" : "bg-black text-white",
      )}
    >
      {active.type === "image" ? (
        <Image
          key={active.src}
          src={active.src}
          alt={`${title}, foto ${index + 1} de ${count}`}
          fill
          sizes="(min-width: 1024px) 992px, 100vw"
          className={cn(
            active.objectFit === "contain"
              ? "object-contain p-3 sm:p-5"
              : "object-cover",
          )}
        />
      ) : (
        <video
          key={active.src}
          ref={(el) => {
            videoRef.current = el;
            if (el) el.muted = muted;
          }}
          src={active.src}
          poster={active.poster}
          muted
          autoPlay={!reducedMotion}
          controls={reducedMotion}
          loop={count === 1}
          playsInline
          onEnded={count > 1 ? goNext : undefined}
          className="h-full w-full object-cover"
        />
      )}

      {!isLight && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
        </>
      )}

      {count > 1 && !(isVideo && reducedMotion) && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Foto siguiente"
          className="absolute inset-0 cursor-pointer"
        />
      )}

      {/* Cada botón mide 40 px de alto y 32 de ancho aunque el punto se vea chico. */}
      {count > 1 && (
        <div className="absolute right-3 top-3 z-10 flex items-center rounded-full border border-white/30 bg-black/75 px-2 shadow-lg backdrop-blur-sm sm:right-5 sm:top-4">
          {media.map((m, i) => (
            <button
              key={m.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1} de ${count}`}
              aria-current={i === index ? "true" : undefined}
              className="group/dot flex h-10 min-w-8 cursor-pointer items-center justify-center px-1 focus-visible:outline-none"
            >
              <span
                className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 group-focus-visible/dot:ring-2 group-focus-visible/dot:ring-white ${
                  i === index ? "w-14 bg-white/35" : "w-2.5 bg-white/80 group-hover/dot:bg-white"
                }`}
              >
                {i === index &&
                  (m.type === "image" ? (
                    // Las fotos avanzan cuando se llena; los videos, cuando terminan (se llena según van por su duración).
                    <span
                      key={index}
                      className="talk-dot-fill absolute inset-0 origin-left bg-crimson"
                      style={{ "--dur": `${IMAGE_SECONDS}s` } as React.CSSProperties}
                      onAnimationEnd={goNext}
                    />
                  ) : (
                    <span
                      ref={videoFillRef}
                      className="absolute inset-0 origin-left bg-crimson"
                      style={{ transform: "scaleX(0)" }}
                    />
                  ))}
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

      {overlay && !isLight && <div className="pointer-events-none absolute bottom-5 left-5 z-[5] sm:bottom-7 sm:left-8">{overlay}</div>}
    </div>
  );
}
