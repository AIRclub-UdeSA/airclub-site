"use client";

import { createContext, Suspense, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Check } from "lucide-react";
import { TalkRegisterDialog } from "@/components/talks/TalkRegisterDialog";
import type { RegistrationState } from "@/components/talks/RegisterButton";
import { useMyRegistrations } from "@/components/talks/use-my-registrations";
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
 * La inscripción a los talleres presenciales, con el mismo diálogo y el mismo recorrido que la de charlas (TalksHub): el
 * botón (o "?inscribir=<slug>", al volver del login o de completar el perfil) espera a que cargue la sesión; con sesión
 * abre el diálogo y sin sesión lleva al login de Google, que vuelve a la misma página (/workshops o la de su workshop) con ?inscribir=<slug>. Con sesión, el botón
 * sabe si ya está inscripta o si el cupo está lleno (#72), y el diálogo abre directo en "Ya estás inscripto/a".
 */
export function WorkshopRegistration({ workshops, children }: { workshops: RegistrableWorkshop[]; children: React.ReactNode }) {
  const { session, registrationOf, onResult } = useMyRegistrations(getMyWorkshopRegistrationsAction);
  const [requestedSlug, setRequestedSlug] = useState<string | null>(null);
  const [registeringSlug, setRegisteringSlug] = useState<string | null>(null);
  const [loginSlug, setLoginSlug] = useState<string | null>(null);
  const pathname = usePathname();
  const registering = workshops.find((w) => w.slug === registeringSlug) ?? null;

  // Se ajusta el estado durante el render, como TalksHub: espera a la sesión y, con sesión, a saber si ya está inscripta.
  // Solo se sigue si el taller acepta inscripciones (el servidor lo vuelve a chequear).
  if (requestedSlug && registrationOf(requestedSlug) !== "loading") {
    const workshop = workshops.find((w) => w.slug === requestedSlug);
    setRequestedSlug(null);
    if (workshop) {
      if (session?.user?.email) setRegisteringSlug(workshop.slug);
      else setLoginSlug(workshop.slug);
    }
  }

  useEffect(() => {
    if (!loginSlug) return;
    const back = encodeURIComponent(`${pathname}?inscribir=${encodeURIComponent(loginSlug)}`);
    signIn("google", { redirectTo: `/bienvenida?next=${back}` });
  }, [loginSlug, pathname]);

  return (
    <RegistrationContext.Provider value={{ request: setRequestedSlug, registrationOf }}>
      {/* useSearchParams() pide su propio límite de Suspense (si no, next build falla). */}
      <Suspense fallback={null}>
        <RegisterDeepLink onRequest={setRequestedSlug} />
      </Suspense>
      {children}
      <TalkRegisterDialog
        kind="taller"
        talk={registering}
        isOpen={registeringSlug !== null}
        alreadyRegistered={registering ? registrationOf(registering.slug) === "registered" : false}
        onClose={() => setRegisteringSlug(null)}
        onResult={onResult}
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
  // Neutro: mismo tamaño que "Inscribirme" (el texto queda invisible), sin decir nada todavía.
  loading: {
    crimson: "bg-white/40 animate-pulse motion-reduce:animate-none",
    plain: "bg-text/10 animate-pulse motion-reduce:animate-none",
  },
};

/** "Inscribirme" de un próximo taller del panel. Fuera de WorkshopRegistration no se muestra. */
export function RegisterButton({ slug, onCrimson }: { slug: string; onCrimson: boolean }) {
  const ctx = useContext(RegistrationContext);
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

// Lee "?inscribir=<slug>", pide la inscripción a ese taller y limpia el parámetro para que un refresh no la repita.
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
