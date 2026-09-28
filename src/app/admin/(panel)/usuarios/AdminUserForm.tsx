"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addOrUpdateAdminUser, type ActionState } from "./actions";
import { SectionsPicker } from "./SectionsPicker";

const initialState: ActionState = { error: null };

export type EditingUser = { email: string; role: "ADMIN" | "EDITOR"; sections: string[] };

export function AdminUserForm({ editingUser, onDone }: { editingUser: EditingUser | null; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(addOrUpdateAdminUser, initialState);
  const [role, setRole] = useState<"EDITOR" | "ADMIN">(editingUser?.role ?? "EDITOR");
  const wasPending = useRef(false);

  // Una vez que la accion termina sin error, se considera guardado: si se estaba editando,
  // vuelve al formulario en blanco (listo para la proxima persona).
  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onDone();
    wasPending.current = pending;
  }, [pending, state.error, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-[var(--r-md)] border border-border bg-card-muted p-5 sm:flex-row sm:items-end sm:flex-wrap">
      <label className="flex flex-1 min-w-[14rem] flex-col gap-1 text-sm text-text2">
        Email @udesa.edu.ar
        <input
          type="email"
          name="email"
          required
          readOnly={!!editingUser}
          defaultValue={editingUser?.email ?? ""}
          placeholder="persona@udesa.edu.ar"
          className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-text read-only:text-text3"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-text2">
        Rol
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value === "ADMIN" ? "ADMIN" : "EDITOR")}
          className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-text"
        >
          <option value="EDITOR">Editor</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      <div className="flex flex-1 min-w-[14rem] flex-col gap-1 text-sm text-text2">
        Secciones
        {role === "EDITOR" ? (
          <SectionsPicker initialSelected={editingUser?.sections} />
        ) : (
          <p className="rounded-[var(--r-sm)] border border-dashed border-border px-3 py-2 text-text3">No aplica (rol Admin)</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
        >
          {pending ? "Guardando…" : editingUser ? "Guardar cambios" : "Agregar"}
        </button>
        {editingUser && (
          <button type="button" onClick={onDone} className="text-sm font-medium text-text2 hover:text-crimson-text">
            Cancelar
          </button>
        )}
      </div>
      {state.error && <p className="w-full text-sm text-crimson">{state.error}</p>}
    </form>
  );
}
