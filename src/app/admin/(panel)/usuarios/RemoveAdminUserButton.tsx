"use client";

import { useActionState } from "react";
import { removeAdminUser, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export function RemoveAdminUserButton({ id, email }: { id: string; email: string }) {
  const [state, formAction, pending] = useActionState(removeAdminUser, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(`¿Sacar el acceso de ${email}?`)) e.preventDefault();
        }}
        className="text-sm font-medium text-crimson-text hover:underline disabled:opacity-60"
      >
        {pending ? "Borrando…" : "Sacar acceso"}
      </button>
      {state.error && <p className="max-w-[16rem] text-right text-xs text-crimson">{state.error}</p>}
    </form>
  );
}
