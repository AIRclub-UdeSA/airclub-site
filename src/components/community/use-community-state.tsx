"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getMyCommunityStatusAction } from "@/app/perfil/actions";

/**
 * Dónde está la persona frente a "Sumarme a la comunidad": `guest` sin sesión, `incomplete` con sesión pero el perfil
 * sin completar (cuenta nueva o anterior a nombre y consentimiento) y `member` con el perfil completo. `loading` hasta
 * saberlo: las páginas públicas son estáticas (ISR), así que se resuelve en el cliente, igual que RegisterButton.
 *
 * La consulta al servidor la hace una sola vez `CommunityStateProvider` (en el RootLayout, junto al Nav); el Nav, el
 * botón de /contacto y el de /equipo leen el mismo resultado con `useCommunityState`.
 */
export type CommunityState = "loading" | "guest" | "incomplete" | "member";

const CommunityStateContext = createContext<CommunityState | null>(null);

export function CommunityStateProvider({ children }: { children: React.ReactNode }) {
  return <CommunityStateContext.Provider value={useResolveCommunityState()}>{children}</CommunityStateContext.Provider>;
}

export function useCommunityState(): CommunityState {
  const state = useContext(CommunityStateContext);
  if (state === null) throw new Error("useCommunityState necesita un CommunityStateProvider arriba (ver RootLayout).");
  return state;
}

function useResolveCommunityState(): CommunityState {
  const { data: session, status } = useSession();
  // null = todavía no se sabe; guarda el email para no mostrar el resultado de otra cuenta.
  const [mine, setMine] = useState<{ email: string; complete: boolean } | null>(null);
  const sessionEmail = session?.user?.email?.toLowerCase() ?? null;

  useEffect(() => {
    if (!sessionEmail) return;
    let cancelled = false;
    getMyCommunityStatusAction()
      .then((res) => {
        // Si el servidor no ve la sesión que ve el cliente, se trata como perfil sin completar (no como visitante).
        if (!cancelled) setMine({ email: sessionEmail, complete: res.signedIn && res.complete });
      })
      // Sin la consulta no se sabe: se ofrece completar el perfil, que si ya está completo vuelve enseguida.
      .catch(() => {
        if (!cancelled) setMine({ email: sessionEmail, complete: false });
      });
    return () => {
      cancelled = true;
    };
  }, [sessionEmail]);

  if (status === "loading") return "loading";
  if (!sessionEmail) return "guest";
  if (!mine || mine.email !== sessionEmail) return "loading";
  return mine.complete ? "member" : "incomplete";
}
