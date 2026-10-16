"use client";

import { useState, useTransition } from "react";
import { deleteMyAccountAction } from "@/app/perfil/actions";

/** Borrar la propia cuenta, en dos pasos: el primer clic explica qué se pierde, el segundo borra. */
export function DeleteMyAccount() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <section className="flex flex-col gap-3 border-t border-border/60 pt-8">
      <h2 className="font-display text-lg font-bold text-text">Borrar mi cuenta</h2>
      <p className="max-w-[52ch] font-body text-[.92rem] leading-[1.7] text-text3">
        Se borran tu perfil y tus inscripciones a charlas, y se cierra tu sesión. Si volvés a entrar, podés crear el perfil de nuevo.
      </p>
      {confirming ? (
        <div role="alert" className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => deleteMyAccountAction())}
            className="rounded-[var(--r-pill)] border-[1.5px] border-crimson bg-crimson px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
          >
            {pending ? "Borrando…" : "Sí, borrar mi cuenta"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="font-mono text-[.76rem] uppercase tracking-[.1em] text-text2 transition-colors hover:text-crimson-text"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-fit font-mono text-[.76rem] uppercase tracking-[.1em] text-text3 underline underline-offset-4 transition-colors hover:text-crimson-text"
        >
          Borrar mi cuenta
        </button>
      )}
    </section>
  );
}
