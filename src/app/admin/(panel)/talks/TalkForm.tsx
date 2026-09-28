"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createTalk, updateTalk, type ActionState } from "./actions";
import { ListEditor } from "./ListEditor";
import { UploadButton } from "./UploadButton";
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

// Argentina no tiene horario de verano: offset fijo, alcanza restar 3hs para separar
// fecha/hora locales de un Date en UTC.
function toDatePart(date: Date | null): string {
  if (!date) return "";
  const local = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function toTimePart(date: Date | null): string {
  if (!date) return "";
  const local = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().slice(11, 16);
}

function isDifferentDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return toDatePart(a) !== toDatePart(b);
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function TalkForm({
  editingId,
  initialValues,
  onDone,
}: {
  /** Presente sólo cuando se edita una charla existente (dispara updateTalk en vez de createTalk). */
  editingId?: string;
  /** Valores para precargar el form: la charla completa al editar, o una plantilla parcial al crear. */
  initialValues: Omit<EditingTalk, "id"> | null;
  onDone: () => void;
}) {
  const isEditing = !!editingId;
  const values = initialValues;
  const action = isEditing ? updateTalk : createTalk;
  const [state, formAction, pending] = useActionState(action, initialState);
  const wasPending = useRef(false);
  const slugTouched = useRef(isEditing);
  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const speakerAvatarRef = useRef<HTMLInputElement>(null);
  const [multiDay, setMultiDay] = useState(() => isDifferentDay(values?.startsAt ?? null, values?.endsAt ?? null));

  // Igual que AdminUserForm: al terminar de guardar sin error, si estaba editando vuelve al
  // formulario en blanco (listo para la próxima charla).
  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onDone();
    wasPending.current = pending;
  }, [pending, state.error, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-6 rounded-[var(--r-md)] border border-border bg-card-muted p-5">
      {isEditing && <input type="hidden" name="id" value={editingId} />}

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
              defaultValue={values?.title ?? ""}
              onChange={(e) => {
                if (!slugTouched.current && slugRef.current) slugRef.current.value = slugify(e.target.value);
              }}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Subtítulo
            <input type="text" name="subtitle" required defaultValue={values?.subtitle ?? ""} className={inputClass} />
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
              defaultValue={values?.slug ?? ""}
              onChange={() => {
                slugTouched.current = true;
              }}
              className={inputClass}
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm text-text2">
          Resumen
          <textarea name="abstract" required rows={3} defaultValue={values?.abstract ?? ""} className={inputClass} />
        </label>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Tema
            <input type="text" name="topic" defaultValue={values?.topic ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Lugar
            <input type="text" name="location" defaultValue={values?.location ?? ""} className={inputClass} />
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Fecha</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Día
            <input type="date" name="date" defaultValue={toDatePart(values?.startsAt ?? null)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Hora de inicio (opcional)
            <input type="time" name="startTime" defaultValue={toTimePart(values?.startsAt ?? null)} className={inputClass} />
          </label>
          {multiDay ? (
            <label className={labelClass}>
              Día de fin
              <input type="date" name="endDate" defaultValue={toDatePart(values?.endsAt ?? null)} className={inputClass} />
            </label>
          ) : (
            <label className={labelClass}>
              Hora de fin (opcional)
              <input type="time" name="endTime" defaultValue={toTimePart(values?.endsAt ?? null)} className={inputClass} />
            </label>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs text-text2">
          <input type="checkbox" checked={multiDay} onChange={(e) => setMultiDay(e.target.checked)} />
          Dura más de un día (ej. una ventana tipo &ldquo;semana del 12 al 16&rdquo;)
        </label>
        <label className="flex flex-col gap-1 text-sm text-text2">
          Etiqueta de fecha (lo que se muestra en el sitio si el día/horario todavía no está cerrado)
          <input
            type="text"
            name="dateLabel"
            placeholder="Semana del 12 al 16 de octubre"
            defaultValue={values?.dateLabel ?? ""}
            className={inputClass}
          />
        </label>
        <p className="text-xs text-text3">
          Si cargás un día pero dejás las horas vacías, se guarda como charla de todo el día (para cuando todavía no hay horario
          cerrado). La etiqueta de arriba es el texto que en verdad ven las visitas cuando la fecha no está 100% cerrada.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Orador</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Nombre
            <input type="text" name="speakerName" defaultValue={values?.speakerName ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Rol
            <input
              type="text"
              name="speakerRole"
              placeholder="Investigador LINAR y Docente UdeSA"
              defaultValue={values?.speakerRole ?? ""}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Afiliación
            <input
              type="text"
              name="speakerAffiliation"
              placeholder="Laboratorio de Inteligencia Artificial y Robótica (LINAR)"
              defaultValue={values?.speakerAffiliation ?? ""}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Foto
            <input
              ref={speakerAvatarRef}
              type="url"
              name="speakerAvatar"
              placeholder="https://…"
              defaultValue={values?.speakerAvatar ?? ""}
              className={inputClass}
            />
            <UploadButton
              accept="image/*"
              label="Subir foto"
              onUploaded={(url) => {
                if (speakerAvatarRef.current) speakerAvatarRef.current.value = url;
              }}
            />
          </label>
          <label className={labelClass}>
            LinkedIn
            <input type="url" name="speakerLinkedin" defaultValue={values?.speakerLinkedin ?? ""} className={inputClass} />
          </label>
        </div>
        <p className="text-xs text-text3">
          Rol = el cargo/título de la persona (se ve en rojo debajo del nombre). Afiliación = a qué institución/laboratorio/empresa
          pertenece (se ve más chico, debajo del rol) — es opcional, se puede dejar vacío.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Estado</legend>
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-text2">
            <input type="checkbox" name="confirmed" defaultChecked={values?.confirmed ?? false} />
            Confirmada
          </label>
          <label className="flex items-center gap-2 text-sm text-text2">
            Visibilidad
            <select name="status" defaultValue={values?.status ?? "PUBLISHED"} className={inputClass}>
              <option value="PUBLISHED">Publicada</option>
              <option value="DRAFT">Borrador</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-text3">
          <strong>Confirmada</strong> solo prende el cartel &ldquo;CONFIRMADA&rdquo; en la línea de tiempo pública — no afecta si la
          charla se ve o no. <strong>Visibilidad</strong> es lo que sí controla eso: en Borrador la charla no aparece en /talks para
          nadie (útil mientras estás cargando los datos).
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Fotos y videos (la primera es la portada)</legend>
        <ListEditor<MediaItem>
          name="media"
          initialItems={values?.media ?? []}
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
              <div className="flex flex-1 flex-col gap-1">
                <input
                  type="url"
                  required
                  placeholder="URL de la foto/video"
                  value={item.src}
                  onChange={(e) => update({ src: e.target.value })}
                  className={inputClass}
                />
                <UploadButton
                  accept={item.type === "VIDEO" ? "video/*" : "image/*"}
                  label={item.type === "VIDEO" ? "Subir video" : "Subir foto"}
                  onUploaded={(url) => update({ src: url })}
                />
              </div>
              {item.type === "VIDEO" && (
                <div className="flex flex-1 flex-col gap-1">
                  <input
                    type="url"
                    placeholder="URL del poster (miniatura)"
                    value={item.poster}
                    onChange={(e) => update({ poster: e.target.value })}
                    className={inputClass}
                  />
                  <UploadButton accept="image/*" label="Subir poster" onUploaded={(url) => update({ poster: url })} />
                </div>
              )}
            </>
          )}
        />
        <p className="text-xs text-text3">
          También podés pegar directamente un link ya alojado en otro lado (ej. una imagen ya subida a Storage por otro medio).
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Slides</legend>
        <ListEditor<SlideItem>
          name="slides"
          initialItems={values?.slides ?? []}
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
          initialItems={values?.links ?? []}
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
            <input type="url" name="recordingUrl" defaultValue={values?.recordingUrl ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Texto del botón
            <input type="text" name="ctaLabel" defaultValue={values?.ctaLabel ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            URL del botón
            <input type="url" name="ctaUrl" defaultValue={values?.ctaUrl ?? ""} className={inputClass} />
          </label>
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear charla"}
        </button>
        {(isEditing || values) && (
          <button type="button" onClick={onDone} className="text-sm font-medium text-text2 hover:text-crimson-text">
            Cancelar
          </button>
        )}
        {state.error && <p className="text-sm text-crimson">{state.error}</p>}
      </div>
    </form>
  );
}
