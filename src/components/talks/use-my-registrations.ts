"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { CancelResult, MyRegistrationsResult, RegisterResult } from "@/app/talks/register-actions";
import type { RegistrationState } from "./RegisterButton";

/**
 * Qué sabe el cliente de la cuenta logueada frente a lo que se inscribe con TalkRegisterDialog: charlas (TalksHub y
 * EventsHub) o talleres presenciales (WorkshopRegistration). /talks, /eventos y /workshops son estáticas (ISR), así que
 * se pide acá, con sesión. Lo usa registration-flow.tsx.
 *
 * `registrationOf` da el estado del botón de cada slug y `onResult` lo actualiza después de inscribirse o cancelar, sin
 * recargar.
 */
export function useMyRegistrations(fetchMine: () => Promise<MyRegistrationsResult>) {
  const { data: session, status } = useSession();
  // null = todavía no se sabe.
  const [mine, setMine] = useState<{ email: string; registered: Set<string>; full: Set<string>; restricted: Set<string> } | null>(null);
  const sessionEmail = session?.user?.email?.toLowerCase() ?? null;

  useEffect(() => {
    if (!sessionEmail) return;
    let cancelled = false;
    fetchMine()
      .then((res) => {
        if (cancelled) return;
        // El servidor puede no ver la sesión que ve el cliente (venció o falló al validarla): sin
        // esto los botones quedarían en "loading" para siempre. Se trata igual que un error.
        const own = res.signedIn ? res : { registered: [], full: [], restricted: [] };
        setMine({ email: sessionEmail, registered: new Set(own.registered), full: new Set(own.full), restricted: new Set(own.restricted) });
      })
      // Sin la consulta no se puede saber: el botón vuelve a "Inscribirme" y el servidor decide al confirmar.
      .catch(() => {
        if (!cancelled) setMine({ email: sessionEmail, registered: new Set(), full: new Set(), restricted: new Set() });
      });
    return () => {
      cancelled = true;
    };
  }, [sessionEmail, fetchMine]);

  // Sin sesión no hay nada que consultar. Con sesión, "loading" hasta que llegue la respuesta de esta cuenta.
  const registrationOf = (slug: string): RegistrationState => {
    if (status === "loading") return "loading";
    if (!sessionEmail) return "open";
    if (!mine || mine.email !== sessionEmail) return "loading";
    if (mine.registered.has(slug)) return "registered";
    if (mine.restricted.has(slug)) return "restricted";
    return mine.full.has(slug) ? "full" : "open";
  };

  const onResult = (slug: string, result: RegisterResult["status"] | CancelResult["status"]) => {
    setMine((prev) => {
      if (!prev) return prev;
      const registered = new Set(prev.registered);
      const full = new Set(prev.full);
      const restricted = new Set(prev.restricted);
      if (result === "registered" || result === "already") registered.add(slug);
      else if (result === "cancelled") registered.delete(slug);
      else if (result === "full") full.add(slug);
      else if (result === "restricted") restricted.add(slug);
      return { ...prev, registered, full, restricted };
    });
  };

  return { session, registrationOf, onResult };
}
