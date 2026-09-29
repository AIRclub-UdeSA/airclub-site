"use client";

import { useRef, useState } from "react";
import { isSiteImageUrl } from "@/lib/storage-url";
import { isPendingUpload, uploadError } from "@/lib/upload-rules";

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
  fileName,
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
  /** Nombre del archivo detrás de un marcador, para mostrarlo. */
  fileName: (placeholder: string) => string | undefined;
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

  return (
    <div className="flex flex-1 flex-col gap-1">
      {pending ? (
        <>
          {name && <input type="hidden" name={name} value={value} />}
          <p className="flex items-center gap-2 rounded-[var(--r-sm)] border border-dashed border-border bg-card px-3 py-2 text-sm text-text">
            <span className="truncate">📎 {fileName(value) ?? "archivo"}</span>
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
  );
}
