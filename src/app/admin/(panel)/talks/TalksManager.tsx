"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentProps } from "react";
import { Plus, X } from "lucide-react";
import { TalksHub } from "@/components/talks/TalksHub";
import { deleteTalk } from "./actions";
import { TalkForm, type EditingTalk } from "./TalkForm";
import { PencilButton } from "../PencilButton";

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

type HubProps = Omit<ComponentProps<typeof TalksHub>, "edit">;

/** "Agregar" con la forma de una tarjeta del cronograma todavía sin datos (la trama de "a confirmar"). */
function AddTalk({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-1 flex-col border border-dashed border-text bg-card text-left transition-colors hover:border-crimson"
    >
      <span className="talk-hatch flex aspect-[4/3] items-center justify-center border-b border-dashed border-text text-text group-hover:text-crimson-text">
        <Plus size={64} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="flex flex-col p-5">
        <span className="font-display text-[1.3rem] font-bold leading-[1.15] tracking-tight text-text transition-colors group-hover:text-crimson-text">
          Agregar charla
        </span>
        <span className="mt-2 text-[.92rem] leading-snug text-text3">Arranca como &ldquo;a confirmar&rdquo;: alcanza con la fecha.</span>
      </span>
    </button>
  );
}

export function TalksManager({
  hub,
  talks,
  showLogsLink,
  storagePrefix,
}: {
  hub: HubProps;
  talks: EditingTalk[];
  showLogsLink: boolean;
  storagePrefix: string | null;
}) {
  // null = cerrado; { talk: null } = charla nueva.
  const [editing, setEditing] = useState<{ talk: EditingTalk | null } | null>(null);
  const bySlug = new Map(talks.map((t) => [t.slug, t]));

  return (
    <>
      <TalksHub
        {...hub}
        edit={{
          controls: (t) => {
            const talk = bySlug.get(t.slug);
            if (!talk) return null;
            return (
              <PencilButton
                label={`Editar "${t.title}"`}
                onClick={() => setEditing({ talk })}
                className="left-3 top-3"
              />
            );
          },
          add: <AddTalk onClick={() => setEditing({ talk: null })} />,
        }}
      />

      {editing && (
        <TalkDrawer
          key={editing.talk?.id ?? "new"}
          talk={editing.talk}
          showLogsLink={showLogsLink}
          storagePrefix={storagePrefix}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

/** Panel lateral con el formulario de una charla (o de una nueva), más borrar e historial. */
function TalkDrawer({
  talk,
  showLogsLink,
  storagePrefix,
  onClose,
}: {
  talk: EditingTalk | null;
  showLogsLink: boolean;
  storagePrefix: string | null;
  onClose: () => void;
}) {
  const [blank, setBlank] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function remove(target: EditingTalk) {
    if (!confirm(`¿Borrar "${target.title}"? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.set("id", target.id);
    try {
      const result = await deleteTalk({ error: null }, formData);
      if (result.error) setError(result.error);
      else onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la charla.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end" role="dialog" aria-modal="true" aria-label={talk ? `Editar "${talk.title}"` : "Agregar charla"}>
      <button type="button" aria-label="Cerrar" onClick={() => !busy && onClose()} className="absolute inset-0 bg-black/40" />

      <div className="relative flex h-full w-full max-w-2xl flex-col gap-5 overflow-y-auto border-l border-border bg-bg p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-text">{talk ? talk.title : "Agregar charla"}</h3>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar" className="text-text3 hover:text-crimson-text">
            <X size={20} />
          </button>
        </div>

        {!talk && (
          <p className="text-sm text-text2">
            {blank ? "Formulario en blanco." : "Arranca como “Charla a confirmar”: completá la fecha y guardá; el resto se carga cuando se confirme."}{" "}
            <button type="button" disabled={busy} onClick={() => setBlank(!blank)} className="font-medium text-crimson-text hover:underline">
              {blank ? "Usar la plantilla “a confirmar”" : "Empezar en blanco"}
            </button>
          </p>
        )}

        <TalkForm
          key={blank ? "blank" : "template"}
          editingId={talk?.id}
          initialValues={talk ?? (blank ? null : NEW_TBD_TEMPLATE)}
          storagePrefix={storagePrefix}
          onDone={onClose}
          onSavingChange={setBusy}
        />

        {talk && (
          <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-4">
            {error && <p className="mr-auto text-sm text-crimson">{error}</p>}
            {showLogsLink && (
              <Link href={`/admin/logs?entityId=${talk.id}`} className="text-sm font-medium text-text2 hover:text-crimson-text">
                Historial
              </Link>
            )}
            <button type="button" disabled={busy} onClick={() => remove(talk)} className="text-sm font-medium text-crimson-text hover:underline disabled:opacity-60">
              Borrar charla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
