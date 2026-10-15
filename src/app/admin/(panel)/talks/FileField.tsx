"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isSiteImageUrl } from "@/lib/storage-url";
import { isPendingUpload, uploadError } from "@/lib/upload-rules";

const THUMB = "size-16 shrink-0 rounded-[var(--r-sm)] border border-border object-cover";

/** Miniatura de lo que se va a publicar. Si no carga (ej. un link de YouTube), queda el recuadro vacío. */
function Thumb({ kind, src }: { kind: "image" | "video"; src: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <span className={`${THUMB} border-dashed bg-card`} aria-hidden="true" />;
  if (kind === "video") {
    return <video src={src} muted playsInline preload="metadata" onError={() => setBroken(true)} className={`${THUMB} bg-black`} aria-hidden="true" />;
  }
  // <img> y no next/image: también tiene que mostrar archivos recién elegidos (blob:) y links de otros sitios.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" onError={() => setBroken(true)} className={`${THUMB} bg-card`} />;
}

/**
 * Campo para una foto o video: se puede pegar un link o elegir un archivo. El archivo NO se sube al
 * elegirlo: queda en el navegador y el campo guarda un marcador (`pending:…`) que TalkForm reemplaza
 * por la URL pública al guardar. Así, elegir un archivo y cancelar no deja nada en Storage.
 */
export function FileField({
  value,
  onChange,
  kind,
  pickLabel,
  placeholder,
  required,
  storagePrefix,
  pickFile,
  pendingFile,
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  kind: "image" | "video";
  pickLabel: string;
  placeholder: string;
  required?: boolean;
  storagePrefix: string | null;
  /** Registra el archivo elegido en TalkForm y devuelve el marcador a guardar en el campo. */
  pickFile: (file: File) => string;
  /** Archivo detrás de un marcador, para mostrar su nombre y su miniatura. */
  pendingFile: (placeholder: string) => File | undefined;
  /** Si está, el valor viaja en el form como un input con este nombre. */
  name?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    // `accept` solo filtra la ventana de elegir archivo: con "Todos los archivos" se puede elegir otra cosa.
    const wrongKind = !file.type.startsWith(`${kind}/`) && (kind === "image" ? "Acá va una foto, no un video." : "Acá va un video, no una foto.");
    const invalid = wrongKind || uploadError(file);
    setError(invalid);
    if (!invalid) onChange(pickFile(file));
  }

  const pending = isPendingUpload(value);
  const file = pending ? pendingFile(value) : undefined;
  const blobUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (blobUrl && URL.revokeObjectURL(blobUrl)), [blobUrl]);
  const preview = pending ? (blobUrl ?? "") : value;

  return (
    <div className="flex flex-1 items-start gap-3">
      <Thumb key={preview} kind={kind} src={preview} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {pending ? (
          <>
            {name && <input type="hidden" name={name} value={value} />}
            <p className="flex items-center gap-2 rounded-[var(--r-sm)] border border-dashed border-border bg-card px-3 py-2 text-sm text-text">
              <span className="truncate">📎 {file?.name ?? "archivo"}</span>
              <span className="shrink-0 text-xs text-text3">se sube al guardar</span>
            </p>
            <button type="button" onClick={() => onChange("")} className="w-fit text-xs font-medium text-crimson-text hover:underline">
              Quitar archivo
            </button>
          </>
        ) : (
          <>
            <input
              type="url"
              name={name}
              required={required}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text"
            />
            {kind === "image" && !isSiteImageUrl(value, storagePrefix) && (
              // next/image solo acepta nuestro bucket (ver next.config.ts): un link de otro sitio se vería roto en /talks.
              <p className="max-w-[20rem] text-xs text-crimson">Esta foto no se va a ver en el sitio. Descargala y usá el botón de abajo.</p>
            )}
            <label className="w-fit cursor-pointer text-xs font-medium text-text2 hover:text-crimson-text">
              {pickLabel}
              <input ref={inputRef} type="file" accept={kind === "video" ? "video/mp4,video/webm" : "image/*"} onChange={handleChange} className="hidden" />
            </label>
          </>
        )}
        {error && <p className="max-w-[16rem] text-xs text-crimson">{error}</p>}
      </div>
    </div>
  );
}
