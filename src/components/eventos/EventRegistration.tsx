"use client";

import { Suspense, useId } from "react";
import { ArrowRight, Check } from "lucide-react";
import { TeamRegisterDialog } from "./TeamRegisterDialog";
import { TalkRegisterDialog } from "@/components/talks/TalkRegisterDialog";
import { RegisterDeepLink, useRegistrationFlow } from "@/components/talks/registration-flow";
import { RESTRICTED_BUTTON, RESTRICTED_NOTE } from "@/components/talks/RegisterButton";
import { cancelEventRegistrationAction, getMyEventRegistrationsAction, registerForEventAction } from "@/app/eventos/register-actions";

export type RegistrableEvent = {
  slug: string;
  title: string;
  startsAt: string; // ISO
  endsAt?: string;
  /** Dura todo el día: va a la agenda como evento de día entero. */
  allDay?: boolean;
  location?: string;
  description?: string;
  registrationType: "INDIVIDUAL" | "TEAM";
  /** Texto del botón (ver defaultCtaLabel). */
  label: string;
};

const BASE =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-6.5 py-3.5 font-body text-[.88rem] font-medium transition-colors";

/**
 * El botón de inscripción de `/eventos/<slug>` para un evento con inscripción propia (individual o de equipo). Es el mismo recorrido
 * que en el calendario (registration-flow.tsx): sesión, perfil, diálogo y vuelta con "?inscribir=<slug>". La página es
 * estática (ISR): lo que depende de quién mira se pide desde el cliente.
 */
export function EventRegistration({ event }: { event: RegistrableEvent }) {
  const noteId = useId();
  const { registrationOf, request, dialog } = useRegistrationFlow({
    items: [event],
    canRegister: () => true,
    fetchMine: getMyEventRegistrationsAction,
    returnTo: (slug) => `/eventos/${encodeURIComponent(slug)}?inscribir=${encodeURIComponent(slug)}`,
  });
  const state = registrationOf(event.slug);

  return (
    <>
      <Suspense fallback={null}>
        <RegisterDeepLink onRequest={request} />
      </Suspense>

      {state === "loading" ? (
        <button type="button" disabled aria-busy="true" aria-label={event.label} className={`${BASE} animate-pulse border-transparent bg-text/10 motion-reduce:animate-none`}>
          <span aria-hidden="true" className="invisible">
            {event.label}
          </span>
          <ArrowRight size={15} aria-hidden="true" className="invisible" />
        </button>
      ) : state === "full" ? (
        <button type="button" disabled className={`${BASE} cursor-not-allowed border-border-strong/25 text-text3`}>
          Cupo completo
        </button>
      ) : state === "restricted" ? (
        <div className="flex flex-col items-start gap-1.5">
          <button type="button" disabled aria-describedby={noteId} className={`${BASE} cursor-not-allowed border-border-strong/25 text-text3`}>
            {RESTRICTED_BUTTON}
          </button>
          <span id={noteId} className="font-body text-[.82rem] text-text3">
            {RESTRICTED_NOTE}
          </span>
        </div>
      ) : state === "registered" ? (
        <button type="button" onClick={() => request(event.slug)} className={`${BASE} cursor-pointer border-border-strong/25 text-text hover:border-border-strong`}>
          <Check size={15} aria-hidden="true" />
          Inscripto/a
        </button>
      ) : (
        <button
          type="button"
          onClick={() => request(event.slug)}
          className={`${BASE} cursor-pointer border-crimson bg-crimson text-white hover:border-crimson-hover hover:bg-crimson-hover`}
        >
          <span>{event.label}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      )}

      {event.registrationType === "TEAM" ? (
        <TeamRegisterDialog event={dialog.talk} isOpen={dialog.isOpen} onClose={dialog.onClose} onResult={dialog.onResult} />
      ) : (
        <TalkRegisterDialog
          {...dialog}
          kind="evento"
          register={registerForEventAction}
          cancel={cancelEventRegistrationAction}
        />
      )}
    </>
  );
}
