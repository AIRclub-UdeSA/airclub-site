import { ArrowUpRight } from "lucide-react";
import type { ContactReason } from "@/lib/contact";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/**
 * Los paneles toman "tinta" y "papel" de su sección (--ink / --paper, ver IntentSection). El tipo de destino se lee por
 * forma: relleno = formulario (otra pestaña), contorno = mail (tu programa de correo).
 */
function KindTag({ kind, tilted = false }: { kind: ContactReason["kind"]; tilted?: boolean }) {
  const form = kind === "form";
  return (
    <span
      className={`inline-flex items-center gap-1 border border-current px-2 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.16em] ${
        form ? "bg-[var(--tag-bg,var(--ink))] text-[var(--tag-fg,var(--paper))]" : ""
      } ${tilted ? "-rotate-3" : ""}`}
    >
      {form ? (
        <>
          Formulario <ArrowUpRight size={11} aria-hidden="true" />
        </>
      ) : (
        "Mail"
      )}
    </span>
  );
}

/** Lo que va a pasar al tocar: a dónde va y, si es un mail, con qué asunto. */
function Destination({ reason }: { reason: ContactReason }) {
  return (
    <p className="font-mono text-[.72rem] leading-[1.6] text-current/75 [overflow-wrap:anywhere]">
      <span aria-hidden="true">→ </span>
      {reason.destination}
      {reason.kind === "mail" && reason.subject ? ` · Asunto: ${reason.subject}` : ""}
    </p>
  );
}

/**
 * Motivo: un panel recto de 1px que es un solo enlace, relleno con el color de su intención (--paper, texto --ink).
 * `outline` lo deja solo con contorno (se rellena al acercarse); `featured` es la acción principal de la página, con su
 * botón píldora; `strip` lo acomoda en una línea en desktop. Al acercarse, sube 2px y toma el contorno del texto.
 */
export function ReasonPanel({
  reason,
  featured = false,
  outline = false,
  strip = false,
  className = "",
}: {
  reason: ContactReason;
  featured?: boolean;
  outline?: boolean;
  strip?: boolean;
  className?: string;
}) {
  const external = reason.external;
  const linkProps = {
    href: reason.href,
    target: external ? "_blank" : undefined,
    rel: external ? "noopener noreferrer" : undefined,
  };

  const body = (
    <>
      <div className={strip ? "flex" : "flex items-start justify-between gap-4"}>
        <KindTag kind={reason.kind} tilted={featured} />
      </div>

      <div>
        <h3
          className={`font-display font-bold leading-[1.1] tracking-tight ${
            featured ? "text-[clamp(1.6rem,3vw,2.8rem)]" : "text-[clamp(1.4rem,2.3vw,2.1rem)]"
          }`}
        >
          {reason.title}
        </h3>
        <p className="mt-3 max-w-[48ch] text-[.98rem] leading-[1.65] text-current/85">{reason.desc}</p>
        <div className="mt-3">
          <Destination reason={reason} />
        </div>
      </div>
    </>
  );

  if (featured) {
    // El botón es el único enlace del panel (no anidamos enlaces).
    return (
      <article
        className={`flex min-h-[18rem] flex-col justify-between gap-8 border border-[var(--paper)] bg-[var(--paper)] p-6 text-[var(--ink)] [--tag-bg:var(--ink)] [--tag-fg:var(--paper)] sm:p-8 lg:p-10 ${className}`}
      >
        {body}
        <a
          {...linkProps}
          className="inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase leading-tight tracking-[.14em] text-[var(--paper)] transition-opacity hover:opacity-85"
        >
          <span>{reason.action}</span>
          <ArrowUpRight size={15} aria-hidden="true" />
          {external && NEW_TAB_HINT}
        </a>
      </article>
    );
  }

  const look = outline
    ? "border-[var(--paper)] text-text [--tag-bg:var(--paper)] [--tag-fg:var(--ink)] hover:bg-[var(--paper)] hover:text-[var(--ink)] hover:[--tag-bg:var(--ink)] hover:[--tag-fg:var(--paper)]"
    : "border-[var(--paper)] bg-[var(--paper)] text-[var(--ink)] [--tag-bg:var(--ink)] [--tag-fg:var(--paper)] hover:border-text";

  return (
    <a
      {...linkProps}
      className={`group flex flex-col gap-8 border p-6 transition-[transform,background-color,color,border-color] duration-200 ease-club hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8 ${look} ${
        strip ? "lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10" : "min-h-[16rem] justify-between"
      } ${className}`}
    >
      {body}
      <span className="inline-flex items-center gap-1.5 font-mono text-[.76rem] font-semibold uppercase tracking-[.14em]">
        {reason.action}
        <ArrowUpRight
          size={14}
          className="transition-transform duration-200 ease-club group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
        {external && NEW_TAB_HINT}
      </span>
    </a>
  );
}
