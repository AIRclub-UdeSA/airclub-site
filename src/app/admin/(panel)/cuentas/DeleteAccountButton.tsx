"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, type DeleteAccountState } from "./actions";

const initialState: DeleteAccountState = { error: null };

/** Borrado en dos pasos: el primer clic explica qué se pierde, el segundo borra. */
export function DeleteAccountButton({ id, email }: { id: string; email: string }) {
  const [state, formAction, pending] = useActionState(deleteAccountAction, initialState);
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      {confirming ? (
        <div role="alert" className="flex flex-col gap-3 border border-crimson/40 p-4">
          <p className="text-sm text-text2">
            Vas a borrar el perfil de <strong className="text-text">{email}</strong> y todas sus inscripciones a charlas. No se puede deshacer; queda registrado en los logs.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
            >
              {pending ? "Borrando…" : "Sí, borrar la cuenta"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="text-sm text-text2 hover:text-text">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="w-fit text-sm font-medium text-crimson-text hover:underline">
          Borrar cuenta
        </button>
      )}
      {state.error && <p className="text-xs text-crimson-text">{state.error}</p>}
    </form>
  );
}
