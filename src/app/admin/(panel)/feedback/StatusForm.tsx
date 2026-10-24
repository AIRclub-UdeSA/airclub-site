"use client";

import { startTransition, useActionState } from "react";
import { FEEDBACK_STATUS_LABELS, FEEDBACK_STATUSES, type FeedbackStatusId } from "@/lib/feedback/rules";
import { updateFeedbackStatusAction, type UpdateStatusState } from "./actions";

const initialState: UpdateStatusState = { error: null, saved: false };

export function StatusForm({ id, status }: { id: string; status: FeedbackStatusId }) {
  const [state, formAction, pending] = useActionState(updateFeedbackStatusAction, initialState);

  return (
    <form
      // onSubmit y no `action`: con `action`, React resetea el formulario al terminar y el select vuelve al estado viejo.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <label className="flex flex-col gap-1 text-sm text-text2">
        Estado
        <select
          name="status"
          defaultValue={status}
          className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text"
        >
          {FEEDBACK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {FEEDBACK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
      <p aria-live="polite" className="text-sm">
        {state.error ? <span className="text-crimson-text">{state.error}</span> : state.saved && !pending ? <span className="text-text3">Guardado.</span> : null}
      </p>
    </form>
  );
}
