"use client";

import { useEffect, useRef, useState } from "react";
import { createTalk, discardTalkUploads, prepareTalkUploads, updateTalk, validateTalkForm } from "./actions";
import { FileField } from "./FileField";
import { ListEditor } from "./ListEditor";
import { uploadToSignedUrl } from "@/lib/admin/upload-client";
import type { MediaItem, SlideItem, LinkItem } from "./types";
import { PENDING_PREFIX } from "@/lib/upload-rules";

const PENDING_PATTERN = new RegExp(`${PENDING_PREFIX}[0-9a-f-]{36}`, "g");

/** Copia del FormData con cada marcador de archivo pendiente reemplazado por su URL ya subida
 * (los marcadores aparecen sueltos, como en speakerAvatar, o dentro del JSON de media). */
function withUploadedUrls(formData: FormData, urls: Map<string, string>): FormData {
  const next = new FormData();
  for (const [key, value] of formData) {
    next.append(key, typeof value === "string" ? value.replace(PENDING_PATTERN, (placeholder) => urls.get(placeholder) ?? placeholder) : value);
  }
  return next;
}

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
  speakerBio: string | null;
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
  storagePrefix,
  onDone,
}: {
  /** Presente sólo cuando se edita una charla existente (dispara updateTalk en vez de createTalk). */
  editingId?: string;
  /** Valores para precargar el form: la charla completa al editar, o una plantilla parcial al crear. */
  initialValues: Omit<EditingTalk, "id"> | null;
  /** Prefijo de las URLs públicas de nuestro bucket, para avisar cuando se pega un link de foto de otro sitio. */
  storagePrefix: string | null;
  onDone: () => void;
}) {
  const isEditing = !!editingId;
  const values = initialValues;
  const action = isEditing ? updateTalk : createTalk;
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  // Archivos elegidos pero todavía no subidos, por marcador (ver FileField).
  const pendingFiles = useRef(new Map<string, File>());
  const slugTouched = useRef(isEditing);
  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const [speakerAvatar, setSpeakerAvatar] = useState(values?.speakerAvatar ?? "");
  const [multiDay, setMultiDay] = useState(() => isDifferentDay(values?.startsAt ?? null, values?.endsAt ?? null));

  // Mientras sube, cerrar la pestaña cortaría la subida a la mitad: el navegador pide confirmación.
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

  const fileName = (placeholder: string) => pendingFiles.current.get(placeholder)?.name;

  // Orden: validar los datos, recién ahí subir los archivos (directo a Storage) y por último guardar.
  // Si algo falla después de subir, se borra lo recién subido para no dejar archivos sueltos.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const formData = new FormData(e.currentTarget);
    setSaving(true);
    setError(null);

    let uploadedUrls: string[] = [];
    try {
      const check = await validateTalkForm(formData);
      if (check.error) return setError(check.error);

      const values = [...formData.values()].filter((v): v is string => typeof v === "string");
      const placeholders = [...new Set(values.flatMap((v) => v.match(PENDING_PATTERN) ?? []))].filter((p) => pendingFiles.current.has(p));
      const files = placeholders.map((p) => pendingFiles.current.get(p)!);
      const urls = new Map<string, string>();

      if (files.length > 0) {
        const prepared = await prepareTalkUploads(files.map((f) => ({ type: f.type, size: f.size })));
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

      const result = await action({ error: null }, withUploadedUrls(formData, urls));
      if (result.error) return setError(result.error);

      uploadedUrls = []; // guardado: los archivos ya están en uso
      // Igual que AdminUserForm: al terminar de guardar vuelve al formulario en blanco.
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la charla.");
    } finally {
      if (uploadedUrls.length > 0) void discardTalkUploads(uploadedUrls);
      setSaving(false);
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-[var(--r-md)] border border-border bg-card-muted p-5">
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
          <div className={labelClass}>
            Foto
            <FileField
              name="speakerAvatar"
              kind="image"
              value={speakerAvatar}
              onChange={setSpeakerAvatar}
              pickLabel="Elegir foto"
              placeholder="https://…"
              storagePrefix={storagePrefix}
              pickFile={pickFile}
              fileName={fileName}
            />
          </div>
          <label className={labelClass}>
            LinkedIn
            <input type="url" name="speakerLinkedin" defaultValue={values?.speakerLinkedin ?? ""} className={inputClass} />
          </label>
          <label className="flex w-full flex-col gap-1 text-sm text-text2">
            Bio del orador
            <textarea
              name="speakerBio"
              rows={3}
              defaultValue={values?.speakerBio ?? ""}
              placeholder="Trayectoria o resumen biográfico del orador..."
              className={inputClass}
            />
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
              <FileField
                kind={item.type === "VIDEO" ? "video" : "image"}
                required
                value={item.src}
                onChange={(src) => update({ src })}
                pickLabel={item.type === "VIDEO" ? "Elegir video" : "Elegir foto"}
                placeholder="URL de la foto/video"
                storagePrefix={storagePrefix}
                pickFile={pickFile}
                fileName={fileName}
              />
              {item.type === "IMAGE" && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-text2">
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={Boolean(item.lightBg)}
                      onChange={(e) => update({ lightBg: e.target.checked })}
                    />
                    Fondo claro
                  </label>
                  <label className="flex items-center gap-1.5">
                    Ajuste:
                    <select
                      value={item.objectFit ?? "cover"}
                      onChange={(e) => update({ objectFit: e.target.value as "contain" | "cover" })}
                      className="rounded border border-border bg-card px-1.5 py-0.5 text-xs text-text"
                    >
                      <option value="cover">Cubrir (recorta)</option>
                      <option value="contain">Contener (completo)</option>
                    </select>
                  </label>
                </div>
              )}
              {item.type === "VIDEO" && (
                <FileField
                  kind="image"
                  required
                  value={item.poster}
                  onChange={(poster) => update({ poster })}
                  pickLabel="Elegir poster"
                  placeholder="URL del poster (miniatura)"
                  storagePrefix={storagePrefix}
                  pickFile={pickFile}
                  fileName={fileName}
                />
              )}
            </>
          )}
        />
        <p className="text-xs text-text3">
          Los archivos elegidos se suben al guardar. Las fotos tienen que elegirse desde tu compu: un link pegado de otro sitio
          (LinkedIn, Drive, etc.) no se ve en /talks. Los videos sí pueden ser un link externo.
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
          disabled={saving}
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
        >
          {saving ? (progress ?? "Guardando…") : isEditing ? "Guardar cambios" : "Crear charla"}
        </button>
        {(isEditing || values) && !saving && (
          <button type="button" onClick={onDone} className="text-sm font-medium text-text2 hover:text-crimson-text">
            Cancelar
          </button>
        )}
        {progress && progress !== "Guardando…" && <p className="text-sm text-text3">No cierres esta pestaña hasta que termine.</p>}
        {error && <p className="text-sm text-crimson">{error}</p>}
      </div>
    </form>
  );
}
