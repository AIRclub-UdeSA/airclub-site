"use client";

import { useActionState, useRef, useState } from "react";
import { formatEventDate } from "@/lib/dates";
import { deleteTalk, toggleConfirmed, type ActionState } from "./actions";
import { TalkForm, type EditingTalk } from "./TalkForm";

const initialState: ActionState = { error: null };

function formatTalkDate(talk: { startsAt: Date | null; dateLabel: string | null }): string {
  // dateLabel es el texto curado a mano para cuando el día/horario exacto no está cerrado
  // (ej. "Semana del 12 al 16 de octubre") — más preciso que formatear el startsAt crudo.
  if (talk.dateLabel) return talk.dateLabel;
  if (talk.startsAt) return formatEventDate(talk.startsAt);
  return "Sin fecha";
}

function ToggleConfirmedButton({ id, confirmed }: { id: string; confirmed: boolean }) {
  const [state, formAction, pending] = useActionState(toggleConfirmed, initialState);
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="confirmed" value={String(!confirmed)} />
      <button
        type="submit"
        disabled={pending}
        className={confirmed ? "text-xs text-text3 hover:text-crimson-text" : "text-xs font-semibold text-crimson-text hover:underline"}
      >
        {pending ? "…" : confirmed ? "Marcar a confirmar" : "Marcar confirmada"}
      </button>
      {state.error && <p className="text-xs text-crimson">{state.error}</p>}
    </form>
  );
}

function RemoveTalkButton({ id, title }: { id: string; title: string }) {
  const [state, formAction, pending] = useActionState(deleteTalk, initialState);
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(`¿Borrar "${title}"? Esta acción no se puede deshacer.`)) e.preventDefault();
        }}
        className="text-sm font-medium text-crimson-text hover:underline disabled:opacity-60"
      >
        {pending ? "Borrando…" : "Borrar"}
      </button>
      {state.error && <p className="max-w-[16rem] text-right text-xs text-crimson">{state.error}</p>}
    </form>
  );
}

export function TalksManager({ talks }: { talks: EditingTalk[] }) {
  const [editingTalk, setEditingTalk] = useState<EditingTalk | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function startEditing(talk: EditingTalk) {
    setEditingTalk(talk);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-8">
      <div ref={formRef}>
        <TalkForm key={editingTalk?.id ?? "__new__"} editingTalk={editingTalk} onDone={() => setEditingTalk(null)} />
      </div>

      {talks.length === 0 ? (
        <p className="text-sm text-text3">Todavía no hay charlas cargadas.</p>
      ) : (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {talks.map((talk) => (
            <li key={talk.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium text-text">{talk.title}</p>
                <p className="font-mono text-xs text-text3">
                  {talk.slug} · {formatTalkDate(talk)} · {talk.media.length} media · {talk.slides.length} slides · {talk.links.length} links
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs uppercase tracking-wide text-text2">
                  {talk.status === "PUBLISHED" ? "Publicada" : "Borrador"}
                </span>
                <ToggleConfirmedButton id={talk.id} confirmed={talk.confirmed} />
                <button type="button" onClick={() => startEditing(talk)} className="text-sm font-medium text-text2 hover:text-crimson-text">
                  Editar
                </button>
                <RemoveTalkButton id={talk.id} title={talk.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
