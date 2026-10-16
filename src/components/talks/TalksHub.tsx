"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TalksEdit, TimelineTalk } from "./TalksTimeline";
import { TalksHero } from "./TalksHero";
import { TalksTimeline } from "./TalksTimeline";
import { CallForSpeakers } from "./CallForSpeakers";
import { TalkModal, type TalkSection } from "./TalkModal";
import { TalkRegisterDialog } from "./TalkRegisterDialog";
import { useMyRegistrations } from "./use-my-registrations";
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
  const [registeringSlug, setRegisteringSlug] = useState<string | null>(null);
  // Pedido de inscripción (botón o "?inscribir=") que espera a que termine de cargar la sesión.
  const [requestedSlug, setRequestedSlug] = useState<string | null>(null);
  const [loginSlug, setLoginSlug] = useState<string | null>(null);
  const { session, registrationOf, onResult } = useMyRegistrations(getMyTalkRegistrationsAction);

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

  const handleRegister = (talk: TimelineTalk) => setRequestedSlug(talk.slug);

  // "Inscribirme" y "?inscribir=<slug>" pasan por acá. Se espera a que cargue la sesión (si no,
  // un clic temprano se perdía) y, con sesión, a saber si ya está inscripta (si no, el diálogo
  // abría en "confirm" aunque lo estuviera). Solo se sigue si la charla acepta inscripciones (mismo
  // criterio que muestra el botón; el servidor lo vuelve a chequear). Con sesión, abre el diálogo; sin
  // sesión, pasa a loginSlug para disparar el login (ver el efecto de abajo). Se ajusta el estado
  // durante el render, igual que TalkRegisterDialog con su charla activa.
  if (requestedSlug && registrationOf(requestedSlug) !== "loading") {
    const talk = talks.find((t) => t.slug === requestedSlug);
    setRequestedSlug(null);
    if (talk?.registrationOpen && talk.isUpcoming) {
      if (session?.user?.email) setRegisteringSlug(talk.slug);
      else setLoginSlug(talk.slug);
    }
  }

  // Al volver del login de Google, bienvenida/page.tsx manda de nuevo a "/talks?inscribir=<slug>"
  // (pasando por /perfil/completar si falta el perfil) en vez de perderse en la home.
  useEffect(() => {
    if (!loginSlug) return;
    const back = encodeURIComponent(`/talks?inscribir=${encodeURIComponent(loginSlug)}`);
    signIn("google", { redirectTo: `/bienvenida?next=${back}` });
  }, [loginSlug]);

  return (
    <>
      {/* useSearchParams() exige su propio limite de Suspense (si no, next build falla) — se
          aisla en un componente aparte que no renderiza nada, para no suspender el resto. */}
      <Suspense fallback={null}>
        <RegisterDeepLink onRequest={setRequestedSlug} />
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

      <TalkRegisterDialog
        talk={registeringTalk}
        isOpen={registeringSlug !== null}
        alreadyRegistered={registeringTalk ? registrationOf(registeringTalk.slug) === "registered" : false}
        onClose={() => setRegisteringSlug(null)}
        onResult={onResult}
      />
    </>
  );
}

// Lee "?inscribir=<slug>" (lo deja bienvenida/page.tsx al volver de loguearse o completar el
// perfil), pide la inscripción a esa charla y limpia el parámetro para que un refresh no la
// repita. Se queda en la ruta actual: TalksHub también se usa en /admin/talks.
function RegisterDeepLink({ onRequest }: { onRequest: (slug: string) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const slug = searchParams.get("inscribir");
    if (!slug) return;
    onRequest(slug);
    const params = new URLSearchParams(searchParams);
    params.delete("inscribir");
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }, [searchParams, pathname, router, onRequest]);

  return null;
}
