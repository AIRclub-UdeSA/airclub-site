"use client";

import { Suspense, useState } from "react";
import type { TalksEdit, TimelineTalk } from "./TalksTimeline";
import { TalksHero } from "./TalksHero";
import { TalksTimeline } from "./TalksTimeline";
import { CallForSpeakers } from "./CallForSpeakers";
import { TalkModal, type TalkSection } from "./TalkModal";
import { TalkRegisterDialog } from "./TalkRegisterDialog";
import { RegisterDeepLink, useRegistrationFlow } from "./registration-flow";
import { getMyTalkRegistrationsAction } from "@/app/talks/register-actions";

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
  const { registrationOf, request, dialog } = useRegistrationFlow({
    items: talks,
    canRegister: (t) => t.registrationOpen && Boolean(t.isUpcoming),
    fetchMine: getMyTalkRegistrationsAction,
    returnTo: (slug) => `/talks?inscribir=${encodeURIComponent(slug)}`,
  });

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

  const handleRegister = (talk: TimelineTalk) => request(talk.slug);

  return (
    <>
      <Suspense fallback={null}>
        <RegisterDeepLink onRequest={request} />
      </Suspense>

      <TalksHero
        latest={latest}
        next={next}
        todayIso={todayIso}
        daysUntilNext={daysUntilNext}
        onOpenTalk={handleOpenTalk}
        onRegister={handleRegister}
        registrationOf={registrationOf}
      />

      <TalksTimeline
        talks={talks}
        nextSlug={nextSlug}
        onOpenTalk={handleOpenTalk}
        onRegister={handleRegister}
        registrationOf={registrationOf}
        edit={edit}
      />

      <CallForSpeakers />

      <TalkModal
        talk={selectedTalk}
        talks={talks}
        isOpen={isModalOpen}
        initialSection={activeSection}
        onClose={() => setIsModalOpen(false)}
        onSelectTalk={handleSelectTalk}
        onRegister={handleRegister}
        registrationOf={registrationOf}
      />

      <TalkRegisterDialog {...dialog} />
    </>
  );
}
