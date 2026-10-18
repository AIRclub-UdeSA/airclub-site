import Image from "next/image";
import { CircleCheck, TriangleAlert, Info } from "lucide-react";
import { CODE_LANGUAGE_LABELS, paragraphsOf, parseInline, type GuideBlock } from "@/lib/guide-blocks";

const LABEL = "font-mono text-[.7rem] font-semibold uppercase tracking-[.16em]";
const BODY = "text-[1.05rem] leading-[1.75] text-text2";

/**
 * El contenido propio de una guía (#69): los bloques cargados en /admin/workshops, en orden, con el lenguaje recto del
 * sitio (contorno de 1px, numerales en Anton, etiquetas mono y el bloque de código oscuro de SetupBlock). Nada de HTML
 * cargado a mano: el texto solo admite `código`, **negrita** y enlaces (ver src/lib/guide-blocks.ts).
 */
export function GuideContent({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block: b }: { block: GuideBlock }) {
  switch (b.type) {
    case "heading":
      return (
        <h2 className="mt-6 font-display text-[clamp(1.4rem,2.4vw,2rem)] font-bold leading-[1.15] tracking-tight text-text first:mt-0">
          <Inline text={b.text} />
        </h2>
      );

    case "text":
      return (
        <div className={`flex max-w-[65ch] flex-col gap-4 ${BODY}`}>
          {paragraphsOf(b.body).map((p, i) => (
            <p key={i}>
              <Inline text={p} />
            </p>
          ))}
        </div>
      );

    case "steps":
      return (
        <ol className="grid grid-cols-1 border-t border-text">
          {b.items.map((step, i) => (
            <li key={i} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4 border-b border-text/20 py-5 sm:grid-cols-[4rem_minmax(0,1fr)]">
              <span className="font-logo text-[2.4rem] leading-[0.85] text-crimson-text" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-[1.2rem] font-bold leading-[1.2] tracking-tight text-text">
                  <span className="sr-only">Paso {i + 1}: </span>
                  <Inline text={step.title} />
                </h3>
                {step.body &&
                  paragraphsOf(step.body).map((p, j) => (
                    <p key={j} className={`mt-2 max-w-[62ch] ${BODY}`}>
                      <Inline text={p} />
                    </p>
                  ))}
              </div>
            </li>
          ))}
        </ol>
      );

    case "code":
      return <CodeBlock language={b.language} code={b.code} caption={b.caption} />;

    case "image":
      return (
        <figure className="min-w-0">
          <div className="overflow-hidden border border-text bg-bg2">
            <Image src={b.src} alt={b.alt} width={1600} height={900} sizes="(min-width: 1024px) 58vw, 100vw" className="h-auto w-full" />
          </div>
          {b.caption && <figcaption className="mt-3 text-[.92rem] leading-[1.6] text-text3">{b.caption}</figcaption>}
        </figure>
      );

    case "callout": {
      const warning = b.tone === "warning";
      const Icon = warning ? TriangleAlert : Info;
      return (
        <aside className={`border p-5 sm:p-6 ${warning ? "border-crimson-text" : "border-text/30 bg-bg2"}`}>
          <p className={`flex items-center gap-2 ${LABEL} ${warning ? "text-crimson-text" : "text-text2"}`}>
            <Icon size={14} aria-hidden="true" />
            {b.title ?? (warning ? "Ojo" : "Dato")}
          </p>
          {paragraphsOf(b.body).map((p, i) => (
            <p key={i} className={`mt-2 max-w-[62ch] ${BODY}`}>
              <Inline text={p} />
            </p>
          ))}
        </aside>
      );
    }

    case "checkpoint":
      return (
        <aside className="border border-text p-5 sm:p-6">
          <p className={`flex items-center gap-2 ${LABEL} text-text`}>
            <CircleCheck size={14} aria-hidden="true" />
            Si ves esto, vas bien
          </p>
          {paragraphsOf(b.body).map((p, i) => (
            <p key={i} className={`mt-2 max-w-[62ch] ${BODY}`}>
              <Inline text={p} />
            </p>
          ))}
        </aside>
      );
  }
}

/**
 * Código o terminal en el bloque oscuro fijo de SetupBlock (igual en claro y oscuro). En bash, los comentarios van
 * apagados y el comando, en rosa; el resto del código va tal cual, sin resaltado de sintaxis.
 */
function CodeBlock({ language, code, caption }: { language: keyof typeof CODE_LANGUAGE_LABELS; code: string; caption?: string }) {
  const lines = code.split("\n");
  const isShell = language === "bash";

  return (
    <figure className="min-w-0 border border-[#f5e8ec]/15 bg-[#0e0407] text-[#f5e8ec]">
      <figcaption className="flex items-center justify-between gap-4 border-b border-[#f5e8ec]/15 px-4 py-2.5 font-mono text-[.66rem] uppercase tracking-[.18em] text-[#f5e8ec]/60 sm:px-6">
        <span className="min-w-0 truncate">{caption ?? ""}</span>
        <span className="shrink-0">{CODE_LANGUAGE_LABELS[language]}</span>
      </figcaption>
      {/* Scrollea de costado dentro de un contenedor min-w-0: una línea larga no ensancha la página (DESIGN.md §13). */}
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[.78rem] leading-[1.8] sm:px-6 sm:text-[.84rem]">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block min-h-[1lh] whitespace-pre">
              {isShell ? <ShellLine line={line} /> : line}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

function ShellLine({ line }: { line: string }) {
  if (line.trimStart().startsWith("#")) return <span className="text-[#f5e8ec]/45">{line}</span>;
  // El comentario al final de un comando ("ls -la # lista todo") también va apagado.
  const hash = line.search(/\s#\s/);
  const command = hash >= 0 ? line.slice(0, hash) : line;
  const comment = hash >= 0 ? line.slice(hash) : "";
  const [, indent, cmd, rest] = command.match(/^(\s*)(\S+)(.*)$/) ?? ["", "", command, ""];
  return (
    <>
      {indent}
      <span className="text-[#f0357f]">{cmd}</span>
      {rest}
      {comment && <span className="text-[#f5e8ec]/45">{comment}</span>}
    </>
  );
}

/** El formato mínimo del texto: `código`, **negrita** y enlaces. Los externos se abren en otra pestaña. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => {
        if (part.kind === "code")
          return (
            <code key={i} className="border border-text/15 bg-bg2 px-1.5 py-0.5 font-mono text-[.88em] text-text [overflow-wrap:anywhere]">
              {part.value}
            </code>
          );
        if (part.kind === "strong")
          return (
            <strong key={i} className="font-semibold text-text">
              {part.value}
            </strong>
          );
        if (part.kind === "link") {
          const external = part.href.startsWith("http");
          return (
            <a
              key={i}
              href={part.href}
              {...(external && { target: "_blank", rel: "noopener noreferrer" })}
              className="text-text underline decoration-text/35 underline-offset-4 transition-colors hover:text-crimson-text hover:decoration-crimson-text"
            >
              {part.value}
              {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
            </a>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </>
  );
}
