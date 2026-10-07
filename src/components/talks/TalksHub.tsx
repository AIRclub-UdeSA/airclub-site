"use client";

import { useState } from "react";
import type { TalksEdit, TimelineTalk } from "./TalksTimeline";
import { TalksHero } from "./TalksHero";
import { TalksTimeline } from "./TalksTimeline";
import { CallForSpeakers } from "./CallForSpeakers";
import { TalkModal, type TalkSection } from "./TalkModal";

interface TalksHubProps {
  talks: TimelineTalk[];
  nextSlug: string | null;
  latestPastSlug: string | null;
  /** ISO del momento del render en el servidor; alimenta el marcador HOY. */
  todayIso: string;
  daysUntilNext: string | null;
  /** Solo /admin/talks: lápices y "agregar" sobre el cronograma (ver TalksEdit). */
  edit?: TalksEdit;
}

export function TalksHub({ talks, nextSlug, latestPastSlug, todayIso, daysUntilNext, edit }: TalksHubProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<TalkSection>("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const latest = talks.find((t) => t.slug === latestPastSlug);
  const next = talks.find((t) => t.slug === nextSlug);
  const selectedTalk = talks.find((t) => t.slug === selectedSlug) ?? null;

  const handleOpenTalk = (slug: string, section: TalkSection = "overview") => {
    setSelectedSlug(slug);
    setActiveSection(section);
    setIsModalOpen(true);
  };

  const handleSelectTalk = (slug: string, section?: TalkSection) => {
    setSelectedSlug(slug);
    if (section) setActiveSection(section);
  };

  return (
    <>
      <TalksHero
        latest={latest}
        next={next}
        todayIso={todayIso}
        daysUntilNext={daysUntilNext}
        onOpenTalk={handleOpenTalk}
      />

      <TalksTimeline talks={talks} nextSlug={nextSlug} onOpenTalk={handleOpenTalk} edit={edit} />

      <CallForSpeakers />

      <TalkModal
        talk={selectedTalk}
        talks={talks}
        isOpen={isModalOpen}
        initialSection={activeSection}
        onClose={() => setIsModalOpen(false)}
        onSelectTalk={handleSelectTalk}
      />
    </>
  );
}
