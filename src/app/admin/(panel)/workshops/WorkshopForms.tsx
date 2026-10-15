"use client";

import { useEffect, useRef, useState } from "react";
import { uploadToSignedUrl } from "@/lib/admin/upload-client";
import { PENDING_PREFIX } from "@/lib/upload-rules";
import { FileField } from "../talks/FileField";
import { ListEditor } from "../talks/ListEditor";
import type { LinkItem, MediaItem, SlideItem } from "../talks/types";
import {
  discardWorkshopUploads,
  prepareWorkshopUploads,
  saveGuide,
  saveSession,
  saveTrack,
  validateSessionForm,
  type ActionState,
} from "./actions";
import type { AdminGuide, AdminTrack, AdminWorkshopSession } from "./WorkshopsManager";

const inputClass = "rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text";
const labelClass = "flex flex-1 min-w-[12rem] flex-col gap-1 text-sm text-text2";
const wideLabel = "flex flex-col gap-1 text-sm text-text2";
const legendClass = "font-mono text-xs uppercase tracking-wide text-text3";
const hintClass = "text-xs text-text3";

type FormProps = { onDone: () => void; onSavingChange: (saving: boolean) => void };

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Guardado simple (sin archivos): llama a la acción, muestra el error o cierra el panel. */
function useSave(action: (prev: ActionState, formData: FormData) => Promise<ActionState>, { onDone, onSavingChange }: FormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => onSavingChange(saving), [saving, onSavingChange]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const formData = new FormData(e.currentTarget);
    setSaving(true);
    setError(null);
    try {
      const result = await action({ error: null }, formData);
      if (result.error) setError(result.error);
      else onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, handleSubmit };
}

function StatusField({ value }: { value?: "DRAFT" | "PUBLISHED" }) {
  return (
    <label className="flex items-center gap-2 text-sm text-text2">
      Visibilidad
      <select name="status" defaultValue={value ?? "PUBLISHED"} className={inputClass}>
        <option value="PUBLISHED">Publicado</option>
        <option value="DRAFT">Borrador</option>
      </select>
    </label>
  );
}

function Submit({ saving, label, error, onCancel, note }: { saving: boolean; label: string; error: string | null; onCancel: () => void; note?: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="submit"
        disabled={saving}
        className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
      >
        {saving ? (note ?? "Guardando…") : label}
      </button>
      {!saving && (
        <button type="button" onClick={onCancel} className="text-sm font-medium text-text2 hover:text-crimson-text">
          Cancelar
        </button>
      )}
      {note && note !== "Guardando…" && <p className="text-sm text-text3">No cierres esta pestaña hasta que termine.</p>}
      {error && <p className="text-sm text-crimson">{error}</p>}
    </div>
  );
}

/* ---------- Workshop ---------- */

export function TrackForm({ item, ...props }: FormProps & { item: AdminTrack | null }) {
  const { saving, error, handleSubmit } = useSave(saveTrack, props);
  const keyRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-[var(--r-md)] border border-border bg-card-muted p-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Básico</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Título
            <input
              type="text"
              name="title"
              required
              defaultValue={item?.title ?? ""}
              onChange={(e) => !item && keyRef.current && (keyRef.current.value = slugify(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Clave (va en la URL)
            <input ref={keyRef} type="text" name="key" required readOnly={!!item} defaultValue={item?.key ?? ""} className={`${inputClass} read-only:opacity-60`} />
          </label>
        </div>
        <label className={wideLabel}>
          Resumen (va en la caja y arriba de su página)
          <textarea name="summary" required rows={3} defaultValue={item?.summary ?? ""} className={inputClass} />
        </label>
        <label className={wideLabel}>
          Nota de la caja (opcional)
          <input type="text" name="label" placeholder="Challenge JAR 2026" defaultValue={item?.label ?? ""} className={inputClass} />
        </label>
        <p className={hintClass}>
          La clave queda en la URL (/workshops/<em>clave</em>) y no se puede cambiar después de crearlo. Un workshop nuevo va al
          final; el orden de las cajas se cambia con las flechas.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Para sus guías asincrónicas (opcional)</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Guía de instalación
            <input type="url" name="setupUrl" placeholder="https://…/setup/" defaultValue={item?.setupUrl ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Repositorio a clonar
            <input type="url" name="repoUrl" placeholder="https://github.com/…" defaultValue={item?.repoUrl ?? ""} className={inputClass} />
          </label>
        </div>
        <p className={hintClass}>
          Si están, la ruta enlaza la guía de instalación y los comandos de la primera guía empiezan clonando el repositorio.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Estado</legend>
        <StatusField value={item?.status} />
      </fieldset>

      <Submit saving={saving} label={item ? "Guardar cambios" : "Crear workshop"} error={error} onCancel={props.onDone} />
    </form>
  );
}

/* ---------- Guía asincrónica ---------- */

export function GuideForm({
  trackId,
  trackKey,
  item,
  nextWeek,
  ...props
}: FormProps & { trackId: string; trackKey: string; item: AdminGuide | null; nextWeek: string }) {
  const { saving, error, handleSubmit } = useSave(saveGuide, props);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-[var(--r-md)] border border-border bg-card-muted p-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="trackId" value={trackId} />

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Básico</legend>
        <div className="flex flex-wrap gap-3">
          <label className={`${labelClass} max-w-[8rem] min-w-[6rem]`}>
            Semana
            <input type="text" name="week" required pattern="\d{2}" defaultValue={item?.week ?? nextWeek} className={inputClass} />
          </label>
          <label className={labelClass}>
            Título
            <input type="text" name="title" required defaultValue={item?.title ?? ""} className={inputClass} />
          </label>
        </div>
        <label className={wideLabel}>
          Slug
          <input
            type="text"
            name="slug"
            required
            readOnly={!!item}
            placeholder="semana-10-…"
            defaultValue={item?.slug ?? ""}
            className={`${inputClass} read-only:opacity-60`}
          />
        </label>
        <label className={wideLabel}>
          De qué se trata
          <textarea name="summary" required rows={2} defaultValue={item?.summary ?? ""} className={inputClass} />
        </label>
        <label className={wideLabel}>
          Qué te llevás al terminar
          <textarea name="outcome" required rows={2} placeholder="Vas a poder…" defaultValue={item?.outcome ?? ""} className={inputClass} />
        </label>
        <p className={hintClass}>
          El slug queda en la URL (/workshops/{trackKey}/<em>slug</em>) y es con lo que se guarda quién la hizo: no se puede
          cambiar después de crearla. En las guías del JAR es el nombre de su carpeta.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Datos</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Duración mínima (min)
            <input type="number" name="minutesMin" required min={1} step={1} defaultValue={item?.minutesMin ?? 60} className={inputClass} />
          </label>
          <label className={labelClass}>
            Duración máxima (min)
            <input type="number" name="minutesMax" required min={1} step={1} defaultValue={item?.minutesMax ?? 90} className={inputClass} />
          </label>
          <label className={labelClass}>
            Nivel
            <select name="level" defaultValue={item?.level ?? "INICIAL"} className={inputClass}>
              <option value="INICIAL">Inicial</option>
              <option value="INTERMEDIO">Intermedio</option>
              <option value="AVANZADO">Avanzado</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Requiere (semanas)
            <input type="text" name="requires" placeholder="01, 02" defaultValue={item?.requires.join(", ") ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Paquete ROS 2 (opcional)
            <input type="text" name="ros2Package" defaultValue={item?.ros2Package ?? ""} className={inputClass} />
          </label>
        </div>
        <p className={hintClass}>Con paquete, la página de la guía muestra los comandos para compilarlo.</p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Links</legend>
        <label className={wideLabel}>
          La guía completa
          <input type="url" name="guideUrl" required placeholder="https://airclub-udesa.github.io/jar_site/workshops/…/" defaultValue={item?.guideUrl ?? ""} className={inputClass} />
        </label>
        <label className={wideLabel}>
          El código (opcional)
          <input type="url" name="codeUrl" placeholder="https://github.com/…/tree/main/…" defaultValue={item?.codeUrl ?? ""} className={inputClass} />
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Estado</legend>
        <StatusField value={item?.status} />
      </fieldset>

      <Submit saving={saving} label={item ? "Guardar cambios" : "Crear guía"} error={error} onCancel={props.onDone} />
    </form>
  );
}

/* ---------- Taller presencial ---------- */

const PENDING_PATTERN = new RegExp(`${PENDING_PREFIX}[0-9a-f-]{36}`, "g");

// Argentina no tiene horario de verano: offset fijo, alcanza restar 3 h (como en TalkForm).
function toDatePart(date: Date | null): string {
  if (!date) return "";
  return new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function toTimePart(date: Date | null): string {
  if (!date) return "";
  const time = new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(11, 16);
  return time === "00:00" || time === "23:59" ? "" : time;
}

/** Copia del FormData con cada marcador de archivo pendiente reemplazado por su URL ya subida. */
function withUploadedUrls(formData: FormData, urls: Map<string, string>): FormData {
  const next = new FormData();
  for (const [key, value] of formData) {
    next.append(key, typeof value === "string" ? value.replace(PENDING_PATTERN, (p) => urls.get(p) ?? p) : value);
  }
  return next;
}

export function SessionForm({
  trackId,
  item,
  storagePrefix,
  onDone,
  onSavingChange,
}: FormProps & { trackId: string; item: AdminWorkshopSession | null; storagePrefix: string | null }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const pendingFiles = useRef(new Map<string, File>());
  const slugRef = useRef<HTMLInputElement>(null);

  useEffect(() => onSavingChange(saving), [saving, onSavingChange]);
  useEffect(() => {
    if (!saving) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saving]);

  function pickFile(file: File): string {
    const placeholder = `${PENDING_PREFIX}${crypto.randomUUID()}`;
    pendingFiles.current.set(placeholder, file);
    return placeholder;
  }
  const pendingFile = (placeholder: string) => pendingFiles.current.get(placeholder);

  // Como en TalkForm: validar, recién ahí subir los archivos (directo a Storage) y por último guardar. Si algo falla
  // después de subir, se borra lo recién subido.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const formData = new FormData(e.currentTarget);
    setSaving(true);
    setError(null);

    let uploadedUrls: string[] = [];
    try {
      const check = await validateSessionForm(formData);
      if (check.error) return setError(check.error);

      const values = [...formData.values()].filter((v): v is string => typeof v === "string");
      const placeholders = [...new Set(values.flatMap((v) => v.match(PENDING_PATTERN) ?? []))].filter((p) => pendingFiles.current.has(p));
      const files = placeholders.map((p) => pendingFiles.current.get(p)!);
      const urls = new Map<string, string>();

      if (files.length > 0) {
        const prepared = await prepareWorkshopUploads(files.map((f) => ({ type: f.type, size: f.size })));
        if ("error" in prepared) return setError(prepared.error);
        for (const [i, file] of files.entries()) {
          const { signedUrl, publicUrl } = prepared.uploads[i];
          await uploadToSignedUrl(signedUrl, file, (fraction) =>
            setProgress(`Subiendo archivo ${i + 1} de ${files.length}… ${Math.round(fraction * 100)}%`),
          );
          uploadedUrls.push(publicUrl);
          urls.set(placeholders[i], publicUrl);
        }
        setProgress("Guardando…");
      }

      const result = await saveSession({ error: null }, withUploadedUrls(formData, urls));
      if (result.error) return setError(result.error);
      uploadedUrls = []; // guardado: los archivos ya están en uso
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el taller.");
    } finally {
      if (uploadedUrls.length > 0) void discardWorkshopUploads(uploadedUrls);
      setSaving(false);
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-[var(--r-md)] border border-border bg-card-muted p-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="trackId" value={trackId} />

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Básico</legend>
        <label className={wideLabel}>
          Título
          <input
            type="text"
            name="title"
            required
            defaultValue={item?.title ?? ""}
            onChange={(e) => !item && slugRef.current && (slugRef.current.value = slugify(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className={wideLabel}>
          Slug
          <input ref={slugRef} type="text" name="slug" required readOnly={!!item} defaultValue={item?.slug ?? ""} className={`${inputClass} read-only:opacity-60`} />
        </label>
        <label className={wideLabel}>
          Resumen corto (va en su tarjeta, adentro del workshop)
          <textarea name="summary" required rows={2} defaultValue={item?.summary ?? ""} className={inputClass} />
        </label>
        <label className={wideLabel}>
          Qué se vio (va en la pestaña Resumen de su página; opcional)
          <textarea name="description" rows={6} defaultValue={item?.description ?? ""} className={inputClass} />
        </label>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Aula
            <input type="text" name="location" placeholder="Aula 203, Campus Victoria" defaultValue={item?.location ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            A cargo de
            <input type="text" name="instructor" defaultValue={item?.instructor ?? ""} className={inputClass} />
          </label>
        </div>
        <p className={hintClass}>
          El slug va en la URL y es con lo que se guarda quién vino: no se puede cambiar después de crearlo. Si no hay
          &ldquo;qué se vio&rdquo;, la página muestra el resumen corto. Un renglón en blanco separa párrafos.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Fecha</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Día
            <input type="date" name="date" defaultValue={toDatePart(item?.startsAt ?? null)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Hora de inicio (opcional)
            <input type="time" name="startTime" defaultValue={toTimePart(item?.startsAt ?? null)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Hora de fin (opcional)
            <input type="time" name="endTime" defaultValue={toTimePart(item?.endsAt ?? null)} className={inputClass} />
          </label>
        </div>
        <label className={wideLabel}>
          Etiqueta de fecha (opcional: reemplaza a la fecha en el sitio)
          <input type="text" name="dateLabel" defaultValue={item?.dateLabel ?? ""} className={inputClass} />
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Inscripción (antes del taller)</legend>
        <label className="flex items-center gap-2 text-sm text-text2">
          <input type="checkbox" name="registrationOpen" defaultChecked={item?.registrationOpen ?? false} />
          Inscripción propia del sitio
        </label>
        <label className={`${labelClass} max-w-[16rem]`}>
          Cupo
          <input type="number" name="capacity" min={1} step={1} placeholder="Sin límite" defaultValue={item?.capacity ?? ""} className={inputClass} />
        </label>
        <p className={hintClass}>
          Con fecha futura, el taller aparece en &ldquo;Próximos talleres&rdquo; de /workshops y en /eventos; con la inscripción abierta,
          con el botón &ldquo;Inscribirme&rdquo;. Cuando termina, a quien se inscribió le aparece hecho solo, y el taller pasa a los ya
          hechos, donde se le suman fotos y diapositivas. Los inscriptos se ven en /admin/comunidad.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Fotos y videos (la primera foto es la de su tarjeta)</legend>
        <ListEditor<MediaItem>
          name="media"
          initialItems={item?.media ?? []}
          makeEmpty={() => ({ type: "IMAGE", src: "", poster: "" })}
          addLabel="+ Agregar foto/video"
          emptyLabel="Sin fotos ni videos todavía: el sitio muestra la trama diagonal."
          renderRow={(m, update) => (
            <>
              <select value={m.type} onChange={(e) => update({ type: e.target.value === "VIDEO" ? "VIDEO" : "IMAGE" })} className={inputClass}>
                <option value="IMAGE">Foto</option>
                <option value="VIDEO">Video</option>
              </select>
              <FileField
                kind={m.type === "VIDEO" ? "video" : "image"}
                required
                value={m.src}
                onChange={(src) => update({ src })}
                pickLabel={m.type === "VIDEO" ? "Elegir video" : "Elegir foto"}
                placeholder="URL de la foto/video"
                storagePrefix={storagePrefix}
                pickFile={pickFile}
                pendingFile={pendingFile}
              />
              {m.type === "VIDEO" && (
                <FileField
                  kind="image"
                  required
                  value={m.poster}
                  onChange={(poster) => update({ poster })}
                  pickLabel="Elegir poster"
                  placeholder="URL del poster (miniatura)"
                  storagePrefix={storagePrefix}
                  pickFile={pickFile}
                  pendingFile={pendingFile}
                />
              )}
            </>
          )}
        />
        <p className={hintClass}>Los archivos elegidos se suben al guardar. Las fotos tienen que elegirse desde tu compu.</p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Diapositivas</legend>
        <ListEditor<SlideItem>
          name="slides"
          initialItems={item?.slides ?? []}
          makeEmpty={() => ({ title: "", embedUrl: "", openUrl: "" })}
          addLabel="+ Agregar diapositivas"
          emptyLabel="Sin diapositivas todavía."
          renderRow={(s, update) => (
            <>
              <input type="text" required placeholder="Título" value={s.title} onChange={(e) => update({ title: e.target.value })} className={`${inputClass} flex-1`} />
              <input type="url" required placeholder="URL del embed" value={s.embedUrl} onChange={(e) => update({ embedUrl: e.target.value })} className={`${inputClass} flex-1`} />
              <input type="url" required placeholder="URL para abrir en otra pestaña" value={s.openUrl} onChange={(e) => update({ openUrl: e.target.value })} className={`${inputClass} flex-1`} />
            </>
          )}
        />
        <p className={hintClass}>
          Google Slides: Archivo → Compartir → Publicar en la Web → Insertar. Canva: Compartir → Más → Insertar, con &ldquo;cualquier
          persona con el link puede ver&rdquo; (nunca el link de edición).
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Grabación</legend>
        <label className={wideLabel}>
          Link del video completo en YouTube
          <input type="url" name="recordingUrl" placeholder="https://www.youtube.com/watch?v=…" defaultValue={item?.recordingUrl ?? ""} className={inputClass} />
        </label>
        <p className={hintClass}>Si está, la página del taller suma la pestaña &ldquo;Video&rdquo;.</p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Links de interés</legend>
        <ListEditor<LinkItem>
          name="links"
          initialItems={item?.links ?? []}
          makeEmpty={() => ({ label: "", url: "" })}
          addLabel="+ Agregar link"
          emptyLabel="Sin links todavía."
          renderRow={(l, update) => (
            <>
              <input type="text" required placeholder="Texto del link" value={l.label} onChange={(e) => update({ label: e.target.value })} className={`${inputClass} flex-1`} />
              <input type="url" required placeholder="URL" value={l.url} onChange={(e) => update({ url: e.target.value })} className={`${inputClass} flex-1`} />
            </>
          )}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className={legendClass}>Estado</legend>
        <StatusField value={item?.status} />
      </fieldset>

      <Submit saving={saving} label={item ? "Guardar cambios" : "Crear taller"} error={error} onCancel={onDone} note={progress} />
    </form>
  );
}
