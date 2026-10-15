"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, EyeOff, Pencil, Plus, X } from "lucide-react";
import { deleteWorkshopEntity, moveWorkshopEntity, type WorkshopEntity } from "./actions";
import { GuideForm, SessionForm, TrackForm } from "./WorkshopForms";
import type { LinkItem, MediaItem, SlideItem } from "../talks/types";
import type { GuideBlock } from "@/lib/guide-blocks";

type Status = "DRAFT" | "PUBLISHED";

export type AdminGuide = {
  id: string;
  trackId: string;
  slug: string;
  week: string;
  title: string;
  summary: string;
  outcome: string;
  minutesMin: number;
  minutesMax: number;
  level: "INICIAL" | "INTERMEDIO" | "AVANZADO";
  ros2Package: string | null;
  requires: string[];
  guideUrl: string | null;
  codeUrl: string | null;
  content: GuideBlock[];
  status: Status;
};

export type AdminWorkshopSession = {
  id: string;
  trackId: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  dateLabel: string | null;
  location: string | null;
  instructor: string | null;
  recordingUrl: string | null;
  status: Status;
  media: MediaItem[];
  slides: SlideItem[];
  links: LinkItem[];
};

export type AdminTrack = {
  id: string;
  key: string;
  title: string;
  label: string | null;
  summary: string;
  setupUrl: string | null;
  repoUrl: string | null;
  status: Status;
  guides: AdminGuide[];
  sessions: AdminWorkshopSession[];
};

/** Lo que está abierto en el panel lateral: un workshop, una guía o un taller, existente (con id) o nuevo. */
type Editing =
  | { entity: "track"; item: AdminTrack | null }
  | { entity: "guide"; trackId: string; item: AdminGuide | null; nextWeek: string }
  | { entity: "session"; trackId: string; item: AdminWorkshopSession | null };

const pad = (n: number) => String(n).padStart(2, "0");
const ROW = "flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/70 py-2.5 last:border-b-0";
const ICON_BUTTON = "flex size-8 items-center justify-center rounded-full text-text3 transition-colors hover:text-crimson-text disabled:opacity-30";
const ADD = "inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text2 hover:text-crimson-text";

export function WorkshopsManager({
  tracks,
  showLogsLink,
  storagePrefix,
}: {
  tracks: AdminTrack[];
  showLogsLink: boolean;
  storagePrefix: string | null;
}) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function move(entity: WorkshopEntity, id: string, direction: -1 | 1) {
    setBusy(true);
    setError(null);
    const result = await moveWorkshopEntity(entity, id, direction).catch(() => ({ error: "No se pudo cambiar el orden." }));
    if (result.error) setError(result.error);
    setBusy(false);
  }

  return (
    <>
      {error && <p className="text-sm text-crimson">{error}</p>}

      <ol className="flex flex-col gap-4">
        {tracks.map((t, i) => (
          <li key={t.id} className="rounded-[var(--r-card)] border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-wide text-text3">
                  Workshop {pad(i + 1)} · /workshops/{t.key}
                </p>
                <h2 className="mt-1 flex flex-wrap items-center gap-3 font-display text-xl font-bold text-text">
                  {t.title}
                  <StatusPill status={t.status} />
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <MoveButtons disabled={busy} first={i === 0} last={i === tracks.length - 1} onMove={(d) => move("track", t.id, d)} />
                <button type="button" onClick={() => setEditing({ entity: "track", item: t })} className={ICON_BUTTON} aria-label={`Editar "${t.title}"`}>
                  <Pencil size={16} />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="font-mono text-xs uppercase tracking-wide text-text3">Guías asincrónicas (la ruta)</h3>
                <ul className="mt-2">
                  {t.guides.map((g, j) => (
                    <li key={g.id} className={ROW}>
                      <span className="min-w-0 flex-1 text-sm text-text">
                        <span className="mr-2 font-mono text-text3">{g.week}</span>
                        {g.title}
                      </span>
                      <StatusPill status={g.status} />
                      <span className="flex items-center gap-1">
                        <MoveButtons disabled={busy} first={j === 0} last={j === t.guides.length - 1} onMove={(d) => move("guide", g.id, d)} />
                        <button
                          type="button"
                          onClick={() => setEditing({ entity: "guide", trackId: t.id, item: g, nextWeek: g.week })}
                          className={ICON_BUTTON}
                          aria-label={`Editar "${g.title}"`}
                        >
                          <Pencil size={16} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setEditing({ entity: "guide", trackId: t.id, item: null, nextWeek: pad(t.guides.length + 1) })}
                  className={`${ADD} mt-2`}
                >
                  <Plus size={15} /> Agregar guía
                </button>
              </section>

              <section>
                <h3 className="font-mono text-xs uppercase tracking-wide text-text3">Talleres presenciales que ya pasaron</h3>
                <ul className="mt-2">
                  {t.sessions.map((s, j) => (
                    <li key={s.id} className={ROW}>
                      <span className="min-w-0 flex-1 text-sm text-text">{s.title}</span>
                      <StatusPill status={s.status} />
                      <span className="flex items-center gap-1">
                        <MoveButtons disabled={busy} first={j === 0} last={j === t.sessions.length - 1} onMove={(d) => move("session", s.id, d)} />
                        <button
                          type="button"
                          onClick={() => setEditing({ entity: "session", trackId: t.id, item: s })}
                          className={ICON_BUTTON}
                          aria-label={`Editar "${s.title}"`}
                        >
                          <Pencil size={16} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => setEditing({ entity: "session", trackId: t.id, item: null })} className={`${ADD} mt-2`}>
                  <Plus size={15} /> Agregar taller presencial
                </button>
              </section>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => setEditing({ entity: "track", item: null })}
        className="flex items-center justify-center gap-2 rounded-[var(--r-card)] border border-dashed border-text p-6 text-sm font-medium text-text transition-colors hover:border-crimson hover:text-crimson-text"
      >
        <Plus size={18} /> Agregar workshop
      </button>

      {editing && (
        <EditDrawer key={editingKey(editing)} editing={editing} tracks={tracks} showLogsLink={showLogsLink} storagePrefix={storagePrefix} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

const editingKey = (e: Editing) => `${e.entity}-${e.item?.id ?? "new"}`;

function StatusPill({ status }: { status: Status }) {
  if (status === "PUBLISHED") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-[.66rem] uppercase tracking-wide text-text3">
      <EyeOff size={11} aria-hidden="true" /> Borrador
    </span>
  );
}

function MoveButtons({ first, last, disabled, onMove }: { first: boolean; last: boolean; disabled: boolean; onMove: (d: -1 | 1) => void }) {
  return (
    <>
      <button type="button" disabled={disabled || first} onClick={() => onMove(-1)} className={ICON_BUTTON} aria-label="Subir">
        <ArrowUp size={16} />
      </button>
      <button type="button" disabled={disabled || last} onClick={() => onMove(1)} className={ICON_BUTTON} aria-label="Bajar">
        <ArrowDown size={16} />
      </button>
    </>
  );
}

const ENTITY_NAME: Record<WorkshopEntity, { one: string; new: string }> = {
  track: { one: "workshop", new: "Agregar workshop" },
  guide: { one: "guía", new: "Agregar guía" },
  session: { one: "taller", new: "Agregar taller presencial" },
};

/** Panel lateral con el formulario (como el de /admin/talks), más borrar e historial. */
function EditDrawer({
  editing,
  tracks,
  showLogsLink,
  storagePrefix,
  onClose,
}: {
  editing: Editing;
  tracks: AdminTrack[];
  showLogsLink: boolean;
  storagePrefix: string | null;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const item = editing.item;
  const name = ENTITY_NAME[editing.entity];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function remove() {
    if (!item) return;
    const warning =
      editing.entity === "track"
        ? `¿Borrar el workshop "${item.title}" con todas sus guías y talleres? Esta acción no se puede deshacer.`
        : `¿Borrar "${item.title}"? Esta acción no se puede deshacer.`;
    if (!confirm(warning)) return;
    setBusy(true);
    setError(null);
    try {
      const result = await deleteWorkshopEntity(editing.entity, item.id);
      if (result.error) setError(result.error);
      else onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar.");
    } finally {
      setBusy(false);
    }
  }

  let form: ReactNode;
  if (editing.entity === "track") {
    form = <TrackForm item={editing.item} onDone={onClose} onSavingChange={setBusy} />;
  } else if (editing.entity === "guide") {
    const track = tracks.find((t) => t.id === editing.trackId);
    form = <GuideForm trackId={editing.trackId} trackKey={track?.key ?? ""} item={editing.item} nextWeek={editing.nextWeek} storagePrefix={storagePrefix} onDone={onClose} onSavingChange={setBusy} />;
  } else {
    form = <SessionForm trackId={editing.trackId} item={editing.item} storagePrefix={storagePrefix} onDone={onClose} onSavingChange={setBusy} />;
  }

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end" role="dialog" aria-modal="true" aria-label={item ? `Editar "${item.title}"` : name.new}>
      <button type="button" aria-label="Cerrar" onClick={() => !busy && onClose()} className="absolute inset-0 bg-black/40" />

      <div className="relative flex h-full w-full max-w-2xl flex-col gap-5 overflow-y-auto border-l border-border bg-bg p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-text">{item ? item.title : name.new}</h3>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar" className="text-text3 hover:text-crimson-text">
            <X size={20} />
          </button>
        </div>

        {form}

        {item && (
          <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-4">
            {error && <p className="mr-auto text-sm text-crimson">{error}</p>}
            {showLogsLink && (
              <Link href={`/admin/logs?entityId=${item.id}`} className="text-sm font-medium text-text2 hover:text-crimson-text">
                Historial
              </Link>
            )}
            <button type="button" disabled={busy} onClick={remove} className="text-sm font-medium text-crimson-text hover:underline disabled:opacity-60">
              Borrar {name.one}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
