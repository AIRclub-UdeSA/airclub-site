"use client";

import Link from "next/link";
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

// Plantilla para "nueva charla a confirmar": mismo patrón que las charlas placeholder que ya
// existían (segundo-air-talk/tercer-air-talk) — título/resumen genéricos, sin orador todavía,
// solo falta poner la fecha/etiqueta y (más adelante) confirmar con los datos reales.
const NEW_TBD_TEMPLATE: Omit<EditingTalk, "id"> = {
  slug: "",
  title: "Charla a confirmar",
  subtitle: "Próximo AIR Talk",
  abstract: "Estamos coordinando el tema y el orador invitado de este encuentro. Pronto vamos a confirmar los detalles.",
  topic: null,
  location: null,
  speakerName: null,
  speakerRole: null,
  speakerAffiliation: null,
  speakerAvatar: null,
  speakerLinkedin: null,
  speakerBio: null,
  startsAt: null,
  endsAt: null,
  dateLabel: "",
  recordingUrl: null,
  ctaLabel: null,
  ctaUrl: null,
  confirmed: false,
  status: "PUBLISHED",
  media: [],
  slides: [],
  links: [],
};

type FormSeed = { kind: "blank" } | { kind: "template" } | { kind: "edit"; talk: EditingTalk };

export function TalksManager({
  talks,
  showLogsLink,
  storagePrefix,
}: {
  talks: EditingTalk[];
  showLogsLink: boolean;
  storagePrefix: string | null;
}) {
  const [seed, setSeed] = useState<FormSeed>({ kind: "blank" });
  const formRef = useRef<HTMLDivElement>(null);

  function startEditing(talk: EditingTalk) {
    setSeed({ kind: "edit", talk });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startTemplate() {
    setSeed({ kind: "template" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const editingId = seed.kind === "edit" ? seed.talk.id : undefined;
  const initialValues = seed.kind === "edit" ? seed.talk : seed.kind === "template" ? NEW_TBD_TEMPLATE : null;
  const formKey = seed.kind === "edit" ? seed.talk.id : seed.kind;

  return (
    <div className="flex flex-col gap-8">
      <div ref={formRef} className="flex flex-col gap-3">
        {seed.kind === "blank" && (
          <button type="button" onClick={startTemplate} className="w-fit text-sm font-medium text-text2 hover:text-crimson-text">
            + Nueva charla &ldquo;a confirmar&rdquo; (plantilla, sin llenar todo a mano)
          </button>
        )}
        <TalkForm
          key={formKey}
          editingId={editingId}
          initialValues={initialValues}
          storagePrefix={storagePrefix}
          onDone={() => setSeed({ kind: "blank" })}
        />
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
                {showLogsLink && (
                  <Link href={`/admin/logs?entityId=${talk.id}`} className="text-sm font-medium text-text2 hover:text-crimson-text">
                    Historial
                  </Link>
                )}
                <RemoveTalkButton id={talk.id} title={talk.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
