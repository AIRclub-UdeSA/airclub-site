"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { TalkSlide } from "@/lib/talks";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

// El material de una charla, fuera del modal: lo comparten TalkModal y la página de un taller presencial de /workshops,
// que se muestra con el mismo formato (Resumen / Diapositivas / Video).

export const TEXT_LINK =
  "inline-flex items-center gap-1.5 font-mono text-[.76rem] uppercase tracking-[.12em] text-crimson-text underline decoration-crimson-text/40 underline-offset-[6px] transition-colors hover:decoration-crimson-text";

/** Pestañas Resumen / Diapositivas / Video: subrayado carmesí en la activa. */
export function TalkTabs<T extends string>({
  tabs,
  active,
  onSelect,
  label,
  className,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onSelect: (id: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex gap-7 overflow-x-auto overflow-y-hidden border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-current={active === tab.id ? "true" : undefined}
          onClick={() => onSelect(tab.id)}
          className={cn(
            "relative shrink-0 cursor-pointer pb-3 font-mono text-[.78rem] uppercase tracking-[.14em] transition-colors",
            "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-crimson after:transition-opacity",
            active === tab.id ? "text-text after:opacity-100" : "text-text3 after:opacity-0 hover:text-text",
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

/** Diapositivas incrustadas; con más de una, los títulos arriba para elegir cuál ver. */
export function TalkSlides({ slides, className }: { slides: TalkSlide[]; className?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = slides[activeIndex] ?? slides[0];

  return (
    <div className={cn("space-y-4", className)}>
      {slides.length > 1 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {slides.map((s, idx) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-current={idx === activeIndex ? "true" : undefined}
              className={cn(
                "cursor-pointer text-left text-[.95rem] underline-offset-[6px] transition-colors",
                idx === activeIndex ? "font-semibold text-text underline decoration-crimson decoration-2" : "text-text3 hover:text-text",
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}
      {current && (
        <>
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <iframe src={current.embedUrl} title={current.title} className="h-full w-full border-0" allowFullScreen loading="lazy" />
          </div>
          <a href={current.openUrl} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
            Abrir a pantalla completa
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </>
      )}
    </div>
  );
}

/** Grabación completa: el video de YouTube incrustado y el enlace para verlo allá. */
export function TalkRecording({ url, title, className }: { url: string; title: string; className?: string }) {
  const embedUrl = getYoutubeEmbedUrl(url);
  return (
    <div className={cn("space-y-4", className)}>
      {embedUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
        Ver en YouTube
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

/** Links de interés, uno por fila entre líneas de 1px. */
export function TalkLinks({ links }: { links: { label: string; url: string }[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 py-3.5 text-[.98rem] text-text transition-colors hover:text-crimson-text"
          >
            <span>{link.label}</span>
            <ExternalLink size={15} aria-hidden="true" className="shrink-0 text-text3 transition-colors group-hover:text-crimson-text" />
          </a>
        </li>
      ))}
    </ul>
  );
}
