// Bloques del contenido propio de una guía (#69): se arman en /admin/workshops y se dibujan con componentes del sitio
// (src/components/workshops/GuideContent.tsx), así quien carga no tiene que saber de diseño. Sin dependencias de
// servidor: lo usan el panel, las server actions y la página.
//
// En el texto de los bloques se puede usar un formato mínimo, el mismo en todos: `código`, **negrita** y
// [texto del enlace](https://…). Un renglón en blanco separa párrafos.

export const CODE_LANGUAGES = ["bash", "python", "c", "cpp", "yaml", "text"] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

export type GuideBlock =
  /** Subtítulo de una sección de la guía. */
  | { type: "heading"; text: string }
  /** Uno o más párrafos. */
  | { type: "text"; body: string }
  /** Pasos en orden, numerados 01, 02… */
  | { type: "steps"; items: { title: string; body: string }[] }
  /** Bloque de código o de terminal, con su lenguaje y una línea opcional arriba. */
  | { type: "code"; language: CodeLanguage; code: string; caption?: string }
  /** Imagen (subida al bucket o en public/), con texto alternativo obligatorio. */
  | { type: "image"; src: string; alt: string; caption?: string }
  /** Aviso: "Ojo con…" (warning) o un dato al margen (info). */
  | { type: "callout"; tone: "info" | "warning"; title?: string; body: string }
  /** Cómo saber que vas bien antes de seguir. */
  | { type: "checkpoint"; body: string };

export type GuideBlockType = GuideBlock["type"];

export const BLOCK_LABELS: Record<GuideBlockType, string> = {
  heading: "Subtítulo",
  text: "Texto",
  steps: "Pasos",
  code: "Código",
  image: "Imagen",
  callout: "Aviso",
  checkpoint: "Checkpoint",
};

export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  bash: "bash",
  python: "Python",
  c: "C",
  cpp: "C++",
  yaml: "YAML",
  text: "Texto",
};

export function emptyBlock(type: GuideBlockType): GuideBlock {
  switch (type) {
    case "heading":
      return { type, text: "" };
    case "text":
      return { type, body: "" };
    case "steps":
      return { type, items: [{ title: "", body: "" }] };
    case "code":
      return { type, language: "bash", code: "" };
    case "image":
      return { type, src: "", alt: "" };
    case "callout":
      return { type, tone: "warning", body: "" };
    case "checkpoint":
      return { type, body: "" };
  }
}

const MAX_BLOCKS = 200;
// Tope de tamaño de una guía entera (unas 30.000 palabras): evita que un pegado accidental llene la base.
const MAX_CONTENT_CHARS = 200_000;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
// El código conserva la sangría: solo se sacan los renglones vacíos de los bordes.
const code = (v: unknown) => (typeof v === "string" ? v.replace(/^\s*\n|\n\s*$/g, "") : "");
const opt = (v: unknown) => str(v) || undefined;

/**
 * Normaliza lo que llega del form (o de la base) a bloques válidos, o devuelve el primer error en castellano para
 * mostrar en el panel. Los bloques totalmente vacíos se descartan sin error: son los que se agregaron y no se usaron.
 */
export function parseGuideBlocks(input: unknown): { blocks: GuideBlock[] } | { error: string } {
  if (input == null || input === "") return { blocks: [] };
  if (!Array.isArray(input)) return { error: "El contenido de la guía no tiene un formato válido." };
  if (input.length > MAX_BLOCKS) return { error: `Máximo ${MAX_BLOCKS} bloques por guía.` };

  const blocks: GuideBlock[] = [];
  for (const [i, raw] of input.entries()) {
    const b = (raw ?? {}) as Record<string, unknown>;
    const n = `Bloque ${i + 1}`;
    let block: GuideBlock | null;

    switch (b.type) {
      case "heading":
        block = str(b.text) ? { type: "heading", text: str(b.text) } : null;
        break;
      case "text":
        block = str(b.body) ? { type: "text", body: str(b.body) } : null;
        break;
      case "steps": {
        const items = (Array.isArray(b.items) ? b.items : [])
          .map((it) => ({ title: str((it as Record<string, unknown>)?.title), body: str((it as Record<string, unknown>)?.body) }))
          .filter((it) => it.title || it.body);
        if (items.some((it) => !it.title)) return { error: `${n} (pasos): cada paso necesita un título.` };
        block = items.length ? { type: "steps", items } : null;
        break;
      }
      case "code": {
        const language = (CODE_LANGUAGES as readonly string[]).includes(String(b.language)) ? (b.language as CodeLanguage) : "text";
        block = code(b.code) ? { type: "code", language, code: code(b.code), caption: opt(b.caption) } : null;
        break;
      }
      case "image":
        if (!str(b.src) && !str(b.alt)) {
          block = null;
          break;
        }
        if (!str(b.src)) return { error: `${n} (imagen): falta la imagen.` };
        if (!str(b.alt)) return { error: `${n} (imagen): falta el texto alternativo (qué se ve en la imagen).` };
        block = { type: "image", src: str(b.src), alt: str(b.alt), caption: opt(b.caption) };
        break;
      case "callout":
        block = str(b.body) ? { type: "callout", tone: b.tone === "info" ? "info" : "warning", title: opt(b.title), body: str(b.body) } : null;
        break;
      case "checkpoint":
        block = str(b.body) ? { type: "checkpoint", body: str(b.body) } : null;
        break;
      default:
        return { error: `${n}: tipo de bloque desconocido.` };
    }

    if (block) blocks.push(block);
  }

  if (JSON.stringify(blocks).length > MAX_CONTENT_CHARS) return { error: "El contenido de la guía es demasiado largo." };
  return { blocks };
}

/**
 * Los bloques guardados en la base. Ya pasaron por parseGuideBlocks al cargarlos; si igual algo no cierra, la guía se
 * muestra sin contenido en vez de romper la página.
 */
export function storedGuideBlocks(json: unknown): GuideBlock[] {
  const parsed = parseGuideBlocks(json);
  return "blocks" in parsed ? parsed.blocks : [];
}

/** Las imágenes de los bloques: para subir los archivos elegidos y limpiar el bucket al editar o borrar. */
export function guideBlockImageUrls(blocks: GuideBlock[]): string[] {
  return blocks.flatMap((b) => (b.type === "image" ? [b.src] : []));
}

/* ---------- Formato mínimo en el texto ---------- */

export type InlinePart =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "link"; value: string; href: string };

// `código`, **negrita** o [texto](https://… o /ruta). Lo demás es texto tal cual (nunca HTML).
const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g;

export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) parts.push({ kind: "text", value: text.slice(last, m.index) });
    if (m[1] !== undefined) parts.push({ kind: "code", value: m[1] });
    else if (m[2] !== undefined) parts.push({ kind: "strong", value: m[2] });
    else parts.push({ kind: "link", value: m[3], href: m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}

/** Párrafos de un texto: separados por un renglón en blanco. */
export const paragraphsOf = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
