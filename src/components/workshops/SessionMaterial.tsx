"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { PastWorkshop } from "@/lib/workshops";
import { TalkSlideshow } from "@/components/talks/TalkSlideshow";
import { TalkLinks, TalkRecording, TalkSlides, TalkTabs } from "@/components/talks/TalkMaterial";
import { textParagraphs } from "@/lib/talk-format";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type Section = "overview" | "slides" | "recording";

/**
 * El material de un taller presencial que ya pasó, con el formato del detalle de una charla de /talks (las mismas piezas):
 * fotos que avanzan solas arriba y pestañas Resumen / Diapositivas / Video, solo las que tienen algo. Sin fotos, la trama
 * diagonal de "lugar reservado".
 */
export function SessionMaterial({ workshop: w }: { workshop: PastWorkshop }) {
  const [active, setActive] = useState<Section>("overview");
  const hasSlides = w.slides.length > 0;
  const hasRecording = Boolean(w.recordingUrl && getYoutubeEmbedUrl(w.recordingUrl));

  const tabs: { id: Section; label: string }[] = [
    { id: "overview", label: "Resumen" },
    ...(hasSlides ? [{ id: "slides" as const, label: "Diapositivas" }] : []),
    ...(hasRecording ? [{ id: "recording" as const, label: "Video" }] : []),
  ];

  return (
    <div className="min-w-0">
      <div className="overflow-hidden border border-text">
        {w.media.length > 0 ? (
          <TalkSlideshow media={w.media} title={w.title} />
        ) : (
          <div className="relative aspect-[16/9] bg-bg2 sm:aspect-[2/1]">
            <div className="talk-hatch absolute inset-0 text-text" aria-hidden="true" />
          </div>
        )}
      </div>

      {tabs.length > 1 && (
        <TalkTabs tabs={tabs} active={active} onSelect={setActive} label="Secciones del taller" className="mt-8" />
      )}

      {active === "overview" && (
        <div className="mt-8 space-y-8">
          <div className="space-y-4 text-[1.1rem] leading-[1.7] text-text2">
            {textParagraphs(w.description ?? w.summary).map((paragraph, i) => (
              <p key={i} className="max-w-[62ch]">
                {paragraph}
              </p>
            ))}
          </div>
          {w.links.length > 0 && <TalkLinks links={w.links} />}
          {w.url && (
            <a
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-text px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-text transition-colors hover:border-crimson hover:bg-crimson hover:text-white"
            >
              <span>{w.urlLabel ?? "Material del taller"}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          )}
        </div>
      )}

      {active === "slides" && hasSlides && <TalkSlides slides={w.slides} className="mt-8" />}

      {active === "recording" && w.recordingUrl && (
        <TalkRecording url={w.recordingUrl} title={`Grabación del taller ${w.title}`} className="mt-8" />
      )}
    </div>
  );
}
