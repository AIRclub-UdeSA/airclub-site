import { ArrowUpRight } from "lucide-react";
import type { ContactReason } from "@/lib/contact";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/** El color dice a dónde te lleva: carmesí = formulario (otra pestaña), contorno = mail (tu programa de correo). */
function KindTag({ kind, onCrimson = false }: { kind: ContactReason["kind"]; onCrimson?: boolean }) {
  const form = kind === "form";
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.16em] ${
        onCrimson
          ? "border-white bg-white text-crimson"
          : form
            ? "border-crimson bg-crimson text-white"
            : "border-text text-text"
      }`}
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
function Destination({ reason, className = "" }: { reason: ContactReason; className?: string }) {
  return (
    <p className={`font-mono text-[.72rem] leading-[1.6] [overflow-wrap:anywhere] ${className}`}>
      <span aria-hidden="true">→ </span>
      {reason.destination}
      {reason.kind === "mail" && reason.subject ? ` · Asunto: ${reason.subject}` : ""}
    </p>
  );
}

/** La acción que importa para quien llega: carmesí macizo, a todo el ancho, con su botón píldora. */
export function PrimaryReason({ reason }: { reason: ContactReason }) {
  return (
    <article className="relative grid grid-cols-1 gap-10 border border-crimson bg-crimson p-6 text-white sm:p-8 lg:grid-cols-[1.6fr_1fr] lg:gap-16 lg:p-12">
      <div className="flex flex-col justify-between gap-10">
        <p className="font-mono text-[.78rem] uppercase tracking-[.16em] text-white/85">Empezá por acá</p>
        <h3 className="font-display text-[clamp(1.5rem,7vw,3.1rem)] font-black uppercase leading-[0.98] tracking-tight">
          {reason.title}
        </h3>
      </div>

      <div className="flex flex-col justify-between gap-8">
        <div className="flex justify-start lg:justify-end">
          <span className="-rotate-3">
            <KindTag kind={reason.kind} onCrimson />
          </span>
        </div>
        <div>
          <p className="max-w-[46ch] text-[1.02rem] leading-[1.7] text-white/90">{reason.desc}</p>
          <Destination reason={reason} className="mt-4 text-white/75" />
          <a
            href={reason.href}
            target={reason.external ? "_blank" : undefined}
            rel={reason.external ? "noopener noreferrer" : undefined}
            className="mt-7 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase leading-tight tracking-[.14em] text-crimson transition-colors hover:bg-[#f5e8ec]"
          >
            <span>{reason.action}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
            {reason.external && NEW_TAB_HINT}
          </a>
        </div>
      </div>
    </article>
  );
}

/** Motivo secundario: panel recto de 1px que es un solo enlace; `strip` lo acomoda en una línea (desktop). */
export function ReasonPanel({
  reason,
  strip = false,
  className = "",
}: {
  reason: ContactReason;
  strip?: boolean;
  className?: string;
}) {
  return (
    <a
      href={reason.href}
      target={reason.external ? "_blank" : undefined}
      rel={reason.external ? "noopener noreferrer" : undefined}
      className={`group flex flex-col gap-8 border border-text p-6 transition-colors duration-200 ease-club hover:border-crimson sm:p-8 ${
        strip ? "lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10" : "min-h-[16rem] justify-between"
      } ${className}`}
    >
      <div className={strip ? "flex" : "flex items-start justify-between gap-4"}>
        <KindTag kind={reason.kind} />
      </div>

      <div>
        <h3 className="font-display text-[clamp(1.4rem,2.3vw,2.1rem)] font-bold leading-[1.1] tracking-tight text-text transition-colors group-hover:text-crimson-text">
          {reason.title}
        </h3>
        <p className="mt-3 max-w-[48ch] text-[.98rem] leading-[1.65] text-text2">{reason.desc}</p>
        <Destination reason={reason} className="mt-3 text-text3" />
      </div>

      <span className="inline-flex items-center gap-1.5 font-mono text-[.76rem] font-semibold uppercase tracking-[.14em] text-crimson-text">
        {reason.action}
        <ArrowUpRight
          size={14}
          className="transition-transform duration-200 ease-club group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
        {reason.external && NEW_TAB_HINT}
      </span>
    </a>
  );
}
