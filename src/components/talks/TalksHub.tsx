"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { TalksEdit, TimelineTalk } from "./TalksTimeline";
import { TalksHero } from "./TalksHero";
import { TalksTimeline } from "./TalksTimeline";
import { CallForSpeakers } from "./CallForSpeakers";
import { TalkModal, type TalkSection } from "./TalkModal";
import { TalkRegisterDialog } from "./TalkRegisterDialog";

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
  const [registeringSlug, setRegisteringSlug] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const latest = talks.find((t) => t.slug === latestPastSlug);
  const next = talks.find((t) => t.slug === nextSlug);
  const selectedTalk = talks.find((t) => t.slug === selectedSlug) ?? null;
  const registeringTalk = talks.find((t) => t.slug === registeringSlug) ?? null;

  const handleOpenTalk = (slug: string, section: TalkSection = "overview") => {
    setSelectedSlug(slug);
    setActiveSection(section);
    setIsModalOpen(true);
  };

  const handleSelectTalk = (slug: string, section?: TalkSection) => {
    setSelectedSlug(slug);
    if (section) setActiveSection(section);
  };

  // "Inscribirme": sin sesion, dispara el login de Google y, al volver, bienvenida/page.tsx
  // manda de nuevo a "/talks?inscribir=<slug>" (ver el useEffect de abajo) en vez de perderse
  // en la home. Con sesion, abre el dialogo directo.
  const handleRegister = (talk: TimelineTalk) => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      const next = encodeURIComponent(`/talks?inscribir=${talk.slug}`);
      signIn("google", { redirectTo: `/bienvenida?next=${next}` });
      return;
    }
    setRegisteringSlug(talk.slug);
  };

  return (
    <>
      {/* useSearchParams() exige su propio limite de Suspense (si no, next build falla) — se
          aisla en un componente aparte que no renderiza nada, para no suspender el resto. */}
      <Suspense fallback={null}>
        <RegisterDeepLink onOpen={setRegisteringSlug} />
      </Suspense>

      <TalksHero
        latest={latest}
        next={next}
        todayIso={todayIso}
        daysUntilNext={daysUntilNext}
        onOpenTalk={handleOpenTalk}
        onRegister={handleRegister}
      />

      <TalksTimeline
        talks={talks}
        nextSlug={nextSlug}
        onOpenTalk={handleOpenTalk}
        onRegister={handleRegister}
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
      />

      <TalkRegisterDialog talk={registeringTalk} isOpen={registeringSlug !== null} onClose={() => setRegisteringSlug(null)} />
    </>
  );
}

// Lee "?inscribir=<slug>" (lo deja bienvenida/page.tsx al volver de loguearse o completar el
// perfil), abre el dialogo de esa charla y limpia el parametro para que un refresh no lo reabra.
function RegisterDeepLink({ onOpen }: { onOpen: (slug: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const slug = searchParams.get("inscribir");
    if (!slug) return;
    onOpen(slug);
    const params = new URLSearchParams(searchParams);
    params.delete("inscribir");
    router.replace(params.size ? `/talks?${params.toString()}` : "/talks", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
