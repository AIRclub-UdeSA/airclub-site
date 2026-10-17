"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { getMyWorkshopProgressAction, setWorkshopDoneAction } from "@/app/workshops/progress-actions";

type Progress = {
  /** `loading` mientras carga la sesión o el progreso; `anon` sin sesión. */
  status: "loading" | "anon" | "ready";
  completed: ReadonlySet<string>;
  setDone: (slug: string, done: boolean) => Promise<void>;
  /** Login con Google que vuelve a `back` (pasando por /perfil/completar si falta el perfil). */
  login: (back: string) => void;
};

const EMPTY: ReadonlySet<string> = new Set();
const ProgressContext = createContext<Progress | null>(null);

/**
 * Lo que la persona marcó como hecho, para toda la página: se pide una sola vez cuando hay sesión. Las páginas de
 * /workshops son estáticas (ISR), así que esto vive en el cliente y no les rompe el cacheo.
 */
export function WorkshopProgressProvider({ children }: { children: React.ReactNode }) {
  const { status: sessionStatus } = useSession();
  const [completed, setCompleted] = useState<ReadonlySet<string> | null>(null);
  const [anon, setAnon] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    let cancelled = false;
    getMyWorkshopProgressAction()
      .then((r) => {
        if (cancelled) return;
        if (r.signedIn) setCompleted(new Set(r.completed));
        else setAnon(true);
      })
      // Si falla (red, base caída), la página sigue andando sin progreso en vez de quedarse cargando.
      .catch(() => {
        if (!cancelled) setCompleted(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [sessionStatus]);

  const setDone = useCallback(async (slug: string, done: boolean) => {
    const r = await setWorkshopDoneAction(slug, done);
    if (r.signedIn) setCompleted(new Set(r.completed));
    else setAnon(true);
  }, []);

  const login = useCallback((back: string) => {
    signIn("google", { redirectTo: `/bienvenida?next=${encodeURIComponent(back)}` });
  }, []);

  const value = useMemo<Progress>(() => {
    const status =
      sessionStatus === "unauthenticated" || anon ? "anon" : sessionStatus === "loading" || !completed ? "loading" : "ready";
    return { status, completed: status === "ready" && completed ? completed : EMPTY, setDone, login };
  }, [sessionStatus, anon, completed, setDone, login]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useWorkshopProgress(): Progress {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useWorkshopProgress necesita un WorkshopProgressProvider más arriba.");
  return ctx;
}
