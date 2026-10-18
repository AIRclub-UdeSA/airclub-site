"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import {
  BLOCK_LABELS,
  CODE_LANGUAGE_LABELS,
  CODE_LANGUAGES,
  emptyBlock,
  type CodeLanguage,
  type GuideBlock,
  type GuideBlockType,
} from "@/lib/guide-blocks";
import { FileField } from "../talks/FileField";

const inputClass = "rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text";
const fieldLabel = "flex flex-col gap-1 text-xs text-text2";
const ICON_BUTTON = "flex size-7 items-center justify-center rounded-full text-text3 transition-colors hover:text-crimson-text disabled:opacity-30";

/**
 * El contenido de una guía, armado con bloques (#69): cada bloque tiene sus campos y se puede subir, bajar o sacar. Viaja
 * en el form como JSON en un input oculto (`content`); las imágenes elegidas quedan como marcador hasta guardar, igual
 * que las fotos de los talleres (ver FileField).
 */
export function BlockEditor({
  initialBlocks,
  storagePrefix,
  pickFile,
  pendingFile,
}: {
  initialBlocks: GuideBlock[];
  storagePrefix: string | null;
  pickFile: (file: File) => string;
  pendingFile: (placeholder: string) => File | undefined;
}) {
  const [blocks, setBlocks] = useState<GuideBlock[]>(initialBlocks);

  const update = (i: number, block: GuideBlock) => setBlocks((prev) => prev.map((b, j) => (j === i ? block : b)));
  const remove = (i: number) => setBlocks((prev) => prev.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) =>
    setBlocks((prev) => {
      const to = i + d;
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[to]] = [next[to], next[i]];
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      {blocks.length === 0 && <p className="text-xs text-text3">Sin contenido propio: la guía es solo el link a otro sitio.</p>}

      {blocks.map((block, i) => (
        <div key={i} className="rounded-[var(--r-sm)] border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[.7rem] uppercase tracking-wide text-text3">
              {String(i + 1).padStart(2, "0")} · {BLOCK_LABELS[block.type]}
            </span>
            <span className="flex items-center">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={ICON_BUTTON} aria-label="Subir bloque">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className={ICON_BUTTON} aria-label="Bajar bloque">
                <ArrowDown size={14} />
              </button>
              <button type="button" onClick={() => remove(i)} className={ICON_BUTTON} aria-label="Sacar bloque">
                <X size={14} />
              </button>
            </span>
          </div>
          <BlockFields block={block} onChange={(b) => update(i, b)} storagePrefix={storagePrefix} pickFile={pickFile} pendingFile={pendingFile} />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="text-text3">Agregar:</span>
        {(Object.keys(BLOCK_LABELS) as GuideBlockType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setBlocks((prev) => [...prev, emptyBlock(type)])}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text2 transition-colors hover:border-crimson hover:text-crimson-text"
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
      <p className="text-xs text-text3">
        En los textos se puede usar <code>`código`</code>, <code>**negrita**</code> y <code>[texto](https://…)</code>. Un renglón en blanco separa
        párrafos. Los bloques vacíos no se guardan.
      </p>
    </div>
  );
}

function BlockFields({
  block: b,
  onChange,
  storagePrefix,
  pickFile,
  pendingFile,
}: {
  block: GuideBlock;
  onChange: (block: GuideBlock) => void;
  storagePrefix: string | null;
  pickFile: (file: File) => string;
  pendingFile: (placeholder: string) => File | undefined;
}) {
  switch (b.type) {
    case "heading":
      return <input type="text" value={b.text} onChange={(e) => onChange({ ...b, text: e.target.value })} placeholder="Subtítulo de la sección" className={`${inputClass} w-full font-semibold`} />;

    case "text":
      return <textarea value={b.body} onChange={(e) => onChange({ ...b, body: e.target.value })} rows={4} placeholder="Texto" className={`${inputClass} w-full`} />;

    case "steps":
      return (
        <div className="flex flex-col gap-2">
          {b.items.map((item, j) => (
            <div key={j} className="flex items-start gap-2">
              <span className="pt-2 font-mono text-xs text-text3">{String(j + 1).padStart(2, "0")}</span>
              <div className="flex flex-1 flex-col gap-1">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => onChange({ ...b, items: b.items.map((it, k) => (k === j ? { ...it, title: e.target.value } : it)) })}
                  placeholder="Título del paso"
                  className={inputClass}
                />
                <textarea
                  value={item.body}
                  onChange={(e) => onChange({ ...b, items: b.items.map((it, k) => (k === j ? { ...it, body: e.target.value } : it)) })}
                  rows={2}
                  placeholder="Qué hay que hacer (opcional)"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...b, items: b.items.filter((_, k) => k !== j) })}
                className={ICON_BUTTON}
                aria-label="Sacar paso"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => onChange({ ...b, items: [...b.items, { title: "", body: "" }] })} className="w-fit text-xs font-medium text-text2 hover:text-crimson-text">
            + Agregar paso
          </button>
        </div>
      );

    case "code":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <label className={fieldLabel}>
              Lenguaje
              <select value={b.language} onChange={(e) => onChange({ ...b, language: e.target.value as CodeLanguage })} className={inputClass}>
                {CODE_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {CODE_LANGUAGE_LABELS[l]}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${fieldLabel} flex-1`}>
              Línea de arriba (opcional)
              <input type="text" value={b.caption ?? ""} onChange={(e) => onChange({ ...b, caption: e.target.value })} placeholder="diagnostico.sh" className={inputClass} />
            </label>
          </div>
          <textarea
            value={b.code}
            onChange={(e) => onChange({ ...b, code: e.target.value })}
            rows={6}
            spellCheck={false}
            placeholder={b.language === "bash" ? "sudo apt update  # actualiza el índice de paquetes" : "Código"}
            className={`${inputClass} w-full font-mono text-[.82rem]`}
          />
        </div>
      );

    case "image":
      return (
        <div className="flex flex-col gap-2">
          <FileField
            kind="image"
            value={b.src}
            onChange={(src) => onChange({ ...b, src })}
            pickLabel="Elegir imagen"
            placeholder="URL de la imagen"
            storagePrefix={storagePrefix}
            pickFile={pickFile}
            pendingFile={pendingFile}
          />
          <input type="text" value={b.alt} onChange={(e) => onChange({ ...b, alt: e.target.value })} placeholder="Qué se ve en la imagen (para quien no la ve)" className={inputClass} />
          <input type="text" value={b.caption ?? ""} onChange={(e) => onChange({ ...b, caption: e.target.value })} placeholder="Epígrafe (opcional)" className={inputClass} />
        </div>
      );

    case "callout":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <label className={fieldLabel}>
              Tipo
              <select value={b.tone} onChange={(e) => onChange({ ...b, tone: e.target.value === "info" ? "info" : "warning" })} className={inputClass}>
                <option value="warning">Ojo (advertencia)</option>
                <option value="info">Dato</option>
              </select>
            </label>
            <label className={`${fieldLabel} flex-1`}>
              Título (opcional)
              <input type="text" value={b.title ?? ""} onChange={(e) => onChange({ ...b, title: e.target.value })} placeholder={b.tone === "info" ? "Dato" : "Ojo"} className={inputClass} />
            </label>
          </div>
          <textarea value={b.body} onChange={(e) => onChange({ ...b, body: e.target.value })} rows={3} placeholder="Texto del aviso" className={`${inputClass} w-full`} />
        </div>
      );

    case "checkpoint":
      return (
        <textarea
          value={b.body}
          onChange={(e) => onChange({ ...b, body: e.target.value })}
          rows={2}
          placeholder="Qué tiene que pasar para saber que vas bien antes de seguir"
          className={`${inputClass} w-full`}
        />
      );
  }
}
