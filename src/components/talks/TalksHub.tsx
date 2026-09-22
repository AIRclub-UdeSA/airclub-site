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

      {/* 2. Slideshow y Cronograma de Sesiones */}
      <section className="overflow-hidden pb-12 pt-6">
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
