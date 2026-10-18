"use client";

import { createContext, Suspense, useContext, useId } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { TalkRegisterDialog } from "@/components/talks/TalkRegisterDialog";
import { RESTRICTED_BUTTON, RESTRICTED_NOTE, type RegistrationState } from "@/components/talks/RegisterButton";
import { RegisterDeepLink, useRegistrationFlow } from "@/components/talks/registration-flow";
import {
  cancelWorkshopRegistrationAction,
  getMyWorkshopRegistrationsAction,
  registerForWorkshopAction,
} from "@/app/workshops/register-actions";

/** Un próximo taller del panel con la inscripción abierta (#70). */
export type RegistrableWorkshop = {
  slug: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  description?: string;
  location?: string;
};

const RegistrationContext = createContext<{
  request: (slug: string) => void;
  registrationOf: (slug: string) => RegistrationState;
} | null>(null);

/**
 * La inscripción a los talleres presenciales, con el mismo diálogo y el mismo recorrido que la de charlas
 * (registration-flow.tsx): el botón (o "?inscribir=<slug>", al volver del login o de completar el perfil) espera a que
 * cargue la sesión; con sesión abre el diálogo y sin sesión lleva al login de Google, que vuelve a
 * la misma página (/workshops o la de su workshop) con ?inscribir=<slug>. Con sesión, el botón
 * sabe si ya está inscripta o si el cupo está lleno (#72), y el diálogo abre directo en "Ya estás inscripto/a".
 */
export function WorkshopRegistration({ workshops, children }: { workshops: RegistrableWorkshop[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const { registrationOf, request, dialog } = useRegistrationFlow({
    items: workshops,
    // La lista ya trae solo los que tienen la inscripción abierta (el servidor lo vuelve a chequear).
    canRegister: () => true,
    fetchMine: getMyWorkshopRegistrationsAction,
    returnTo: (slug) => `${pathname}?inscribir=${encodeURIComponent(slug)}`,
  });

  return (
    <RegistrationContext.Provider value={{ request, registrationOf }}>
      <Suspense fallback={null}>
        <RegisterDeepLink onRequest={request} />
      </Suspense>
      {children}
      <TalkRegisterDialog
        {...dialog}
        kind="taller"
        register={registerForWorkshopAction}
        cancel={cancelWorkshopRegistrationAction}
      />
    </RegistrationContext.Provider>
  );
}

const BUTTON =
  "inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] transition-colors";

// Mismos estados que el botón de /talks (RegisterButton.tsx): sobre el panel carmesí del próximo taller el botón es
// blanco; sobre los demás, carmesí.
const STYLES: Record<RegistrationState, { crimson: string; plain: string }> = {
  open: {
    crimson: "cursor-pointer bg-white text-crimson hover:bg-[#f5e8ec]",
    plain: "cursor-pointer bg-crimson text-white hover:bg-crimson-hover",
  },
  registered: {
    crimson: "cursor-pointer border-[1.5px] border-white text-white hover:bg-white/15",
    plain: "cursor-pointer border-[1.5px] border-crimson text-crimson-text hover:bg-crimson/10",
  },
  full: {
    crimson: "cursor-not-allowed border-[1.5px] border-white/50 text-white/70",
    plain: "cursor-not-allowed border-[1.5px] border-text3/50 text-text3",
  },
  restricted: {
    crimson: "cursor-not-allowed border-[1.5px] border-white/50 text-white/70",
    plain: "cursor-not-allowed border-[1.5px] border-text3/50 text-text3",
  },
  // Neutro: mismo tamaño que "Inscribirme" (el texto queda invisible), sin decir nada todavía.
  loading: {
    crimson: "bg-white/40 animate-pulse motion-reduce:animate-none",
    plain: "bg-text/10 animate-pulse motion-reduce:animate-none",
  },
};

/** "Inscribirme" de un próximo taller del panel. Fuera de WorkshopRegistration no se muestra. */
export function RegisterButton({ slug, onCrimson }: { slug: string; onCrimson: boolean }) {
  const ctx = useContext(RegistrationContext);
  const noteId = useId();
  if (!ctx) return null;
  const state = ctx.registrationOf(slug);
  const className = `${BUTTON} ${STYLES[state][onCrimson ? "crimson" : "plain"]}`;

  if (state === "loading") {
    return (
      <button type="button" disabled aria-busy="true" aria-label="Inscribirme" className={className}>
        <span aria-hidden="true" className="invisible">
          Inscribirme
        </span>
        <ArrowRight size={15} aria-hidden="true" className="invisible" />
      </button>
    );
  }

  if (state === "full") {
    return (
      <button type="button" disabled className={className}>
        Cupo completo
      </button>
    );
  }

  if (state === "restricted") {
    return (
      <span className="inline-flex flex-col items-start gap-1.5">
        <button type="button" disabled aria-describedby={noteId} className={className}>
          {RESTRICTED_BUTTON}
        </button>
        <span id={noteId} className={`font-body text-[.82rem] ${onCrimson ? "text-white/80" : "text-text3"}`}>
          {RESTRICTED_NOTE}
        </span>
      </span>
    );
  }

  return (
    <button type="button" onClick={() => ctx.request(slug)} className={className}>
      {state === "registered" ? (
        <>
          <Check size={15} aria-hidden="true" />
          <span>Inscripto/a</span>
        </>
      ) : (
        <>
          <span>Inscribirme</span>
          <ArrowRight size={15} aria-hidden="true" />
        </>
      )}
    </button>
  );
}
