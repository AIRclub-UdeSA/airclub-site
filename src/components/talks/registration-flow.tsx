"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MyRegistrationsResult } from "@/app/talks/register-actions";
import { useMyRegistrations } from "./use-my-registrations";

interface RegistrationFlowOptions<T extends { slug: string }> {
  /** Lo que se puede abrir en el diálogo; se busca por slug. */
  items: T[];
  /** Si ese item acepta inscripciones ahora (mismo criterio que muestra el botón; el servidor lo vuelve a chequear). */
  canRegister: (item: T) => boolean;
  /** Qué tiene la cuenta logueada (ver useMyRegistrations). Tiene que ser estable: una server action importada. */
  fetchMine: () => Promise<MyRegistrationsResult>;
  /** A dónde volver después del login de Google para retomar la inscripción a ese slug (con "?inscribir=<slug>"). */
  returnTo: (slug: string) => string;
}

/**
 * El recorrido de "Inscribirme", igual en /talks, /workshops y /eventos: el botón (o "?inscribir=<slug>", al volver del
 * login o de completar el perfil) pide la inscripción con `request`. Se espera a que cargue la sesión (si no, un clic
 * temprano se perdía) y, con sesión, a saber si ya está inscripta (si no, el diálogo abría en "confirm" aunque lo
 * estuviera). Con sesión abre el diálogo; sin sesión lleva al login de Google, que vuelve a `returnTo(slug)` (pasando por
 * /perfil/completar si falta el perfil, ver bienvenida/page.tsx).
 *
 * `dialog` son las props de TalkRegisterDialog; quien usa el hook lo dibuja, junto con <RegisterDeepLink onRequest={request} />.
 */
export function useRegistrationFlow<T extends { slug: string }>({
  items,
  canRegister,
  fetchMine,
  returnTo,
}: RegistrationFlowOptions<T>) {
  const { session, registrationOf, onResult } = useMyRegistrations(fetchMine);
  const [requestedSlug, setRequestedSlug] = useState<string | null>(null);
  const [registeringSlug, setRegisteringSlug] = useState<string | null>(null);
  const [loginTarget, setLoginTarget] = useState<string | null>(null);
  const registering = items.find((i) => i.slug === registeringSlug) ?? null;

  // Se ajusta el estado durante el render, igual que TalkRegisterDialog con su charla activa.
  if (requestedSlug && registrationOf(requestedSlug) !== "loading") {
    const item = items.find((i) => i.slug === requestedSlug);
    setRequestedSlug(null);
    if (item && canRegister(item)) {
      if (session?.user?.email) setRegisteringSlug(item.slug);
      else setLoginTarget(returnTo(item.slug));
    }
  }

  useEffect(() => {
    if (!loginTarget) return;
    signIn("google", { redirectTo: `/bienvenida?next=${encodeURIComponent(loginTarget)}` });
  }, [loginTarget]);

  return {
    registrationOf,
    request: setRequestedSlug,
    dialog: {
      talk: registering,
      isOpen: registeringSlug !== null,
      alreadyRegistered: registering ? registrationOf(registering.slug) === "registered" : false,
      onClose: () => setRegisteringSlug(null),
      onResult,
    },
  };
}

/**
 * Lee "?inscribir=<slug>" (lo deja bienvenida/page.tsx al volver de loguearse o completar el perfil), pide la
 * inscripción y limpia el parámetro para que un refresh no la repita. Se queda en la ruta actual (TalksHub también se usa
 * en /admin/talks) y conserva los demás parámetros (en /eventos, "?evento=" deja abierto el modal de la actividad).
 *
 * useSearchParams() exige su propio límite de Suspense (si no, next build falla): va envuelto en <Suspense fallback={null}>.
 */
export function RegisterDeepLink({ onRequest }: { onRequest: (slug: string) => void }) {
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
