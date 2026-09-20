"use client";

import { useState } from "react";
import type { TimelineTalk } from "./TalksTimeline";
import { TalkFeaturedShowcase } from "./TalkFeaturedShowcase";
import { TalksTimeline } from "./TalksTimeline";
import { CallForSpeakers } from "./CallForSpeakers";
import { TalkFloatingWindow, type FloatingWindowTab } from "./TalkFloatingWindow";

interface TalksHubProps {
  talks: TimelineTalk[];
  nextSlug: string | null;
  latestPastSlug: string | null;
}

export function TalksHub({ talks, nextSlug, latestPastSlug }: TalksHubProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FloatingWindowTab>("slides");
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const latestPastTalk = talks.find((t) => t.slug === latestPastSlug) ?? talks[0];
  const nextUpcomingTalk = talks.find((t) => t.slug === nextSlug);
  const selectedTalk = talks.find((t) => t.slug === selectedSlug) ?? null;

  const handleOpenTalk = (slug: string, tab: FloatingWindowTab = "slides") => {
    setSelectedSlug(slug);
    setActiveTab(tab);
    setIsWindowOpen(true);
  };

  const handleClose = () => {
    setIsWindowOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* 1. Bloque de Afiche Superior: Última Charla Realizada & Próxima Charla */}
      <TalkFeaturedShowcase
        latestPastTalk={latestPastTalk}
        nextUpcomingTalk={nextUpcomingTalk}
        onOpenTalk={handleOpenTalk}
      />

      {/* 2. Línea de Tiempo de Charlas */}
      <section className="overflow-hidden pb-12 pt-6">
        <div className="mx-auto max-w-7xl px-6 pb-6 sm:px-8 md:px-12">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div className="flex items-center gap-2 font-mono text-[.74rem] font-semibold uppercase tracking-[.2em] text-crimson-text">
              <span className="size-2 rounded-full bg-crimson shadow-[0_0_8px_rgba(164,12,76,0.8)]" />
              <span>Cronograma Completo</span>
            </div>
            <span className="font-mono text-[.7rem] uppercase tracking-wider text-text3">
              Deslizá para explorar el historial
            </span>
          </div>
        </div>

        <TalksTimeline talks={talks} nextSlug={nextSlug} onOpenTalk={handleOpenTalk} />
      </section>

      {/* 3. Convocatoria Continua (Call for Speakers) */}
      <CallForSpeakers />

      {/* 4. Ventana Flotante Interactiva (Slides, Fotos/Videos, Resumen) */}
      <TalkFloatingWindow
        talk={selectedTalk}
        isOpen={isWindowOpen}
        initialTab={activeTab}
        onClose={handleClose}
      />
    </div>
  );
}
