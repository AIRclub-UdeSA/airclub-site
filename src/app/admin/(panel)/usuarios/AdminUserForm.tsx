"use client";

import { useActionState } from "react";
import { addOrUpdateAdminUser, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export function AdminUserForm() {
  const [state, formAction, pending] = useActionState(addOrUpdateAdminUser, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-[var(--r-md)] border border-border bg-card-muted p-5 sm:flex-row sm:items-end sm:flex-wrap">
      <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-sm text-text2">
        Email @udesa.edu.ar
        <input
          type="email"
          name="email"
          required
          placeholder="persona@udesa.edu.ar"
          className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-text"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-text2">
        Rol
        <select name="role" defaultValue="EDITOR" className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-text">
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-sm text-text2">
        Secciones (separadas por coma, ignorado para Admin)
        <input
          type="text"
          name="sections"
          placeholder="talks"
          className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-text"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar / actualizar"}
      </button>
      {state.error && <p className="w-full text-sm text-crimson">{state.error}</p>}
    </form>
  );
}
