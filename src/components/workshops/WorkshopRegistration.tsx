"use client";

import { createContext, Suspense, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { TalkRegisterDialog } from "@/components/talks/TalkRegisterDialog";
import { cancelWorkshopRegistrationAction, registerForWorkshopAction } from "@/app/workshops/register-actions";

/** Un próximo taller del panel con la inscripción abierta (#70). */
export type RegistrableWorkshop = {
  slug: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  description?: string;
  location?: string;
};

const RequestContext = createContext<((slug: string) => void) | null>(null);

/**
 * La inscripción a los talleres presenciales, con el mismo diálogo y el mismo recorrido que la de charlas (TalksHub): el
 * botón (o "?inscribir=<slug>", al volver del login o de completar el perfil) espera a que cargue la sesión; con sesión
 * abre el diálogo y sin sesión lleva al login de Google, que vuelve a /workshops?inscribir=<slug>.
 */
export function WorkshopRegistration({ workshops, children }: { workshops: RegistrableWorkshop[]; children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [requestedSlug, setRequestedSlug] = useState<string | null>(null);
  const [registeringSlug, setRegisteringSlug] = useState<string | null>(null);
  const [loginSlug, setLoginSlug] = useState<string | null>(null);

  // Se ajusta el estado durante el render, como TalksHub: solo se sigue si el taller acepta inscripciones (el servidor lo
  // vuelve a chequear).
  if (requestedSlug && status !== "loading") {
    const workshop = workshops.find((w) => w.slug === requestedSlug);
    setRequestedSlug(null);
    if (workshop) {
      if (session?.user?.email) setRegisteringSlug(workshop.slug);
      else setLoginSlug(workshop.slug);
    }
  }

  useEffect(() => {
    if (!loginSlug) return;
    const back = encodeURIComponent(`/workshops?inscribir=${encodeURIComponent(loginSlug)}`);
    signIn("google", { redirectTo: `/bienvenida?next=${back}` });
  }, [loginSlug]);

  return (
    <RequestContext.Provider value={setRequestedSlug}>
      {/* useSearchParams() pide su propio límite de Suspense (si no, next build falla). */}
      <Suspense fallback={null}>
        <RegisterDeepLink onRequest={setRequestedSlug} />
      </Suspense>
      {children}
      <TalkRegisterDialog
        kind="taller"
        talk={workshops.find((w) => w.slug === registeringSlug) ?? null}
        isOpen={registeringSlug !== null}
        onClose={() => setRegisteringSlug(null)}
        register={registerForWorkshopAction}
        cancel={cancelWorkshopRegistrationAction}
      />
    </RequestContext.Provider>
  );
}

/** "Inscribirme" de un próximo taller del panel. Fuera de WorkshopRegistration no se muestra. */
export function RegisterButton({ slug, className, children }: { slug: string; className: string; children?: React.ReactNode }) {
  const request = useContext(RequestContext);
  if (!request) return null;
  return (
    <button type="button" onClick={() => request(slug)} className={className}>
      <span>{children ?? "Inscribirme"}</span>
      <ArrowRight size={15} aria-hidden="true" />
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
