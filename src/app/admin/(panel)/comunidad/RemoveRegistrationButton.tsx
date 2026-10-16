"use client";

import { useActionState, useState } from "react";
import { removeRegistrationAction, type RemoveRegistrationState } from "./actions";

const initialState: RemoveRegistrationState = { error: null };

/** Baja en dos pasos: el primer clic pide confirmación en el lugar, el segundo da de baja. */
export function RemoveRegistrationButton({ id, email }: { id: string; email: string }) {
  const [state, formAction, pending] = useActionState(removeRegistrationAction, initialState);
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1 sm:items-end">
      <input type="hidden" name="id" value={id} />
      {confirming ? (
        <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-text2">¿Dar de baja a {email}?</span>
          <button type="submit" disabled={pending} className="font-semibold text-crimson-text hover:underline disabled:opacity-60">
            {pending ? "Dando de baja…" : "Sí, dar de baja"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="text-text2 hover:text-text">
            No
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-crimson-text hover:underline">
          Dar de baja
        </button>
      )}
      {state.error && <p className="max-w-[16rem] text-xs text-crimson-text">{state.error}</p>}
    </form>
  );
}
