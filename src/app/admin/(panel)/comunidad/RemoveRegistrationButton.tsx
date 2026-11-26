"use client";

import { useActionState, useState } from "react";
import { removeRegistrationAction, removeTeamAction, type RemoveRegistrationState } from "./actions";

const initialState: RemoveRegistrationState = { error: null };

/**
 * Baja en dos pasos: el primer clic pide confirmación en el lugar, el segundo da de baja. Con `team`, `id` es el de un equipo
 * y se baja entero; `email` es lo que se nombra en la confirmación (el del capitán).
 */
export function RemoveRegistrationButton({ id, email, team = false }: { id: string; email: string; team?: boolean }) {
  const [state, formAction, pending] = useActionState(team ? removeTeamAction : removeRegistrationAction, initialState);
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1 sm:items-end">
      <input type="hidden" name="id" value={id} />
      {confirming ? (
        <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="text-text2">{team ? `¿Dar de baja al equipo de ${email}?` : `¿Dar de baja a ${email}?`}</span>
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
