"use client";

import { TalkModal, type TalkSection } from "@/components/talks/TalkModal";
import type { CalendarActivity } from "@/lib/calendar-types";
import type { TimelineTalk } from "@/components/talks/TalksTimeline";
import type { RegistrationState } from "@/components/talks/RegisterButton";

export type EventSection = TalkSection;

interface EventDetailModalProps {
  activity: CalendarActivity | null;
  activities?: CalendarActivity[];
  isOpen: boolean;
  initialSection?: EventSection;
  onClose: () => void;
  onSelectActivity?: (slug: string, section?: EventSection) => void;
  /** Charlas con inscripción propia (#50): mismo botón y mismo diálogo que /talks (ver EventsHub). */
  onRegister: (slug: string) => void;
  registrationOf: (slug: string) => RegistrationState;
}

/**
 * Modal de Detalle de Eventos y Calendario.
 * Utiliza exactamente el mismo componente canónico TalkModal que /talks, garantizando
 * estructura formalizada, idéntica presentación, imágenes, slides y soporte multi-orador.
 */
export function EventDetailModal({
  activity,
  activities = [],
  isOpen,
  initialSection = "overview",
  onClose,
  onSelectActivity,
  onRegister,
  registrationOf,
}: EventDetailModalProps) {
  return (
    <TalkModal
      talk={activity as unknown as TimelineTalk}
      talks={activities as unknown as TimelineTalk[]}
      isOpen={isOpen}
      initialSection={initialSection}
      onClose={onClose}
      onSelectTalk={(slug, sec) => onSelectActivity?.(slug, sec)}
      onRegister={(talk) => onRegister(talk.slug)}
      registrationOf={registrationOf}
    />
  );
}
