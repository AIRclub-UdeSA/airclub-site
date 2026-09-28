"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTalk, updateTalk, type ActionState } from "./actions";
import { ListEditor } from "./ListEditor";
import type { MediaItem, SlideItem, LinkItem } from "./types";

const initialState: ActionState = { error: null };

export type EditingTalk = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  topic: string | null;
  location: string | null;
  speakerName: string | null;
  speakerRole: string | null;
  speakerAffiliation: string | null;
  speakerAvatar: string | null;
  speakerLinkedin: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  dateLabel: string | null;
  recordingUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  confirmed: boolean;
  status: "DRAFT" | "PUBLISHED";
  media: MediaItem[];
  slides: SlideItem[];
  links: LinkItem[];
};

const inputClass = "rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text";
const labelClass = "flex flex-1 min-w-[12rem] flex-col gap-1 text-sm text-text2";

// Argentina no tiene horario de verano: offset fijo, alcanza restar 3hs para el valor de un
// <input type="datetime-local"> (que espera hora local sin offset).
function toDateTimeLocalValue(date: Date | null): string {
  if (!date) return "";
  const local = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TalkForm({ editingTalk, onDone }: { editingTalk: EditingTalk | null; onDone: () => void }) {
  const action = editingTalk ? updateTalk : createTalk;
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);
  const slugTouched = useRef(!!editingTalk);
  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);

  // Igual que AdminUserForm: al terminar de guardar sin error, si estaba editando vuelve al
  // formulario en blanco (listo para la próxima charla).
  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onDone();
    wasPending.current = pending;
  }, [pending, state.error, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-6 rounded-[var(--r-md)] border border-border bg-card-muted p-5">
      {editingTalk && <input type="hidden" name="id" value={editingTalk.id} />}

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Básico</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Título
            <input
              ref={titleRef}
              type="text"
              name="title"
              required
              defaultValue={editingTalk?.title ?? ""}
              onChange={(e) => {
                if (!slugTouched.current && slugRef.current) slugRef.current.value = slugify(e.target.value);
              }}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Subtítulo
            <input type="text" name="subtitle" required defaultValue={editingTalk?.subtitle ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Slug
            <input
              ref={slugRef}
              type="text"
              name="slug"
              required
              pattern="[a-z0-9\-]+"
              title="Solo minúsculas, números y guiones"
              defaultValue={editingTalk?.slug ?? ""}
              onChange={() => {
                slugTouched.current = true;
              }}
              className={inputClass}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm text-text2">
          Resumen
          <textarea name="abstract" required rows={3} defaultValue={editingTalk?.abstract ?? ""} className={inputClass} />
        </label>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Tema
            <input type="text" name="topic" defaultValue={editingTalk?.topic ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Lugar
            <input type="text" name="location" defaultValue={editingTalk?.location ?? ""} className={inputClass} />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Fecha</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Empieza
            <input type="datetime-local" name="startsAt" defaultValue={toDateTimeLocalValue(editingTalk?.startsAt ?? null)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Termina
            <input type="datetime-local" name="endsAt" defaultValue={toDateTimeLocalValue(editingTalk?.endsAt ?? null)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Etiqueta de fecha (si no hay día cerrado)
            <input
              type="text"
              name="dateLabel"
              placeholder="Semana del 12 al 16 de octubre"
              defaultValue={editingTalk?.dateLabel ?? ""}
              className={inputClass}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Orador</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Nombre
            <input type="text" name="speakerName" defaultValue={editingTalk?.speakerName ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Rol
            <input type="text" name="speakerRole" defaultValue={editingTalk?.speakerRole ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Afiliación
            <input type="text" name="speakerAffiliation" defaultValue={editingTalk?.speakerAffiliation ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Foto (URL)
            <input type="url" name="speakerAvatar" defaultValue={editingTalk?.speakerAvatar ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            LinkedIn
            <input type="url" name="speakerLinkedin" defaultValue={editingTalk?.speakerLinkedin ?? ""} className={inputClass} />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Estado</legend>
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-text2">
            <input type="checkbox" name="confirmed" defaultChecked={editingTalk?.confirmed ?? false} />
            Confirmada
          </label>
          <label className="flex items-center gap-2 text-sm text-text2">
            Visibilidad
            <select name="status" defaultValue={editingTalk?.status ?? "PUBLISHED"} className={inputClass}>
              <option value="PUBLISHED">Publicada</option>
              <option value="DRAFT">Borrador</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Fotos y videos (la primera es la portada)</legend>
        <ListEditor<MediaItem>
          name="media"
          initialItems={editingTalk?.media ?? []}
          makeEmpty={() => ({ type: "IMAGE", src: "", poster: "" })}
          addLabel="+ Agregar foto/video"
          emptyLabel="Sin fotos ni videos todavía."
          renderRow={(item, update) => (
            <>
              <select
                value={item.type}
                onChange={(e) => update({ type: e.target.value === "VIDEO" ? "VIDEO" : "IMAGE" })}
                className={inputClass}
              >
                <option value="IMAGE">Foto</option>
                <option value="VIDEO">Video</option>
              </select>
              <input
                type="url"
                required
                placeholder="URL de la foto/video"
                value={item.src}
                onChange={(e) => update({ src: e.target.value })}
                className={`${inputClass} flex-1`}
              />
              {item.type === "VIDEO" && (
                <input
                  type="url"
                  placeholder="URL del poster (miniatura)"
                  value={item.poster}
                  onChange={(e) => update({ poster: e.target.value })}
                  className={`${inputClass} flex-1`}
                />
              )}
            </>
          )}
        />
        <p className="text-xs text-text3">
          Por ahora se pega un link ya subido a algún lado (ej. Supabase Storage cargado a mano) — todavía no hay botón de subida directa
          acá.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Slides</legend>
        <ListEditor<SlideItem>
          name="slides"
          initialItems={editingTalk?.slides ?? []}
          makeEmpty={() => ({ title: "", embedUrl: "", openUrl: "" })}
          addLabel="+ Agregar slide"
          emptyLabel="Sin slides todavía."
          renderRow={(item, update) => (
            <>
              <input
                type="text"
                required
                placeholder="Título"
                value={item.title}
                onChange={(e) => update({ title: e.target.value })}
                className={`${inputClass} flex-1`}
              />
              <input
                type="url"
                required
                placeholder="URL del embed"
                value={item.embedUrl}
                onChange={(e) => update({ embedUrl: e.target.value })}
                className={`${inputClass} flex-1`}
              />
              <input
                type="url"
                required
                placeholder="URL para abrir en otra pestaña"
                value={item.openUrl}
                onChange={(e) => update({ openUrl: e.target.value })}
                className={`${inputClass} flex-1`}
              />
            </>
          )}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Links de interés</legend>
        <ListEditor<LinkItem>
          name="links"
          initialItems={editingTalk?.links ?? []}
          makeEmpty={() => ({ label: "", url: "" })}
          addLabel="+ Agregar link"
          emptyLabel="Sin links todavía."
          renderRow={(item, update) => (
            <>
              <input
                type="text"
                required
                placeholder="Texto del link"
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
                className={`${inputClass} flex-1`}
              />
              <input
                type="url"
                required
                placeholder="URL"
                value={item.url}
                onChange={(e) => update({ url: e.target.value })}
                className={`${inputClass} flex-1`}
              />
            </>
          )}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Grabación y botón principal</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Grabación completa (YouTube)
            <input type="url" name="recordingUrl" defaultValue={editingTalk?.recordingUrl ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Texto del botón
            <input type="text" name="ctaLabel" defaultValue={editingTalk?.ctaLabel ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            URL del botón
            <input type="url" name="ctaUrl" defaultValue={editingTalk?.ctaUrl ?? ""} className={inputClass} />
          </label>
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
        >
          {pending ? "Guardando…" : editingTalk ? "Guardar cambios" : "Crear charla"}
        </button>
        {editingTalk && (
          <button type="button" onClick={onDone} className="text-sm font-medium text-text2 hover:text-crimson-text">
            Cancelar
          </button>
        )}
        {state.error && <p className="text-sm text-crimson">{state.error}</p>}
      </div>
    </form>
  );
}
