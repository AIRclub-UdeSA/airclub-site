"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useWorkshopProgress } from "./WorkshopProgress";

/**
 * Panel de la página de un workshop para marcarlo como hecho. Sin sesión, invita a ingresar (y vuelve a esta misma
 * página). Ya hecho, pasa a gris claro, como en la ruta, y ofrece seguir con el siguiente.
 */
export function CompletionPanel({
  slug,
  href,
  next,
  question = "¿Ya lo hiciste?",
}: {
  slug: string;
  href: string;
  /** El siguiente de la línea, para seguir de corrido: "02 · Zigzag mecanum". */
  next?: { href: string; label: string };
  question?: string;
}) {
  const { status, completed, setDone, login } = useWorkshopProgress();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const done = completed.has(slug);

  const toggle = (value: boolean) =>
    startTransition(async () => {
      setError(false);
      try {
        await setDone(slug, value);
      } catch {
        setError(true);
      }
    });

  if (status === "loading") return <div className="min-h-[13rem] border border-text/15" aria-hidden="true" />;

  if (status === "anon") {
    return (
      <section className="border border-text p-6 sm:p-8">
        <h2 className="font-display text-[1.45rem] font-bold leading-[1.15] tracking-tight text-text">Llevá tu recorrido</h2>
        <p className="mt-3 max-w-[46ch] text-[.98rem] leading-[1.65] text-text2">
          Ingresá con tu cuenta @udesa.edu.ar para marcar los workshops que hiciste y verlos en tu perfil.
        </p>
        <button
          type="button"
          onClick={() => login(href)}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
        >
          Ingresar
        </button>
      </section>
    );
  }

  if (done) {
    return (
      <section className="border border-text/15 p-6 text-text3 sm:p-8">
        <p className="inline-flex -rotate-3 items-center gap-1 border border-text/30 px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em] text-text2">
          <Check size={11} aria-hidden="true" /> Hecho
        </p>
        <p className="mt-4 max-w-[46ch] text-[.98rem] leading-[1.65]">Ya cuenta en tu aprendizaje.</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {next && (
            <Link
              href={next.href}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase leading-tight tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
            >
              <span>Seguir con la {next.label}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
          <Link
            href="/perfil/aprendizaje"
            className="font-mono text-[.74rem] uppercase tracking-[.12em] text-text underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text"
          >
            Mi aprendizaje
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={() => toggle(false)}
            className="cursor-pointer font-mono text-[.74rem] uppercase tracking-[.12em] underline decoration-current/35 underline-offset-[6px] transition-colors hover:text-text disabled:cursor-wait disabled:opacity-60"
          >
            Desmarcar
          </button>
        </div>
        {error && <p className="mt-4 text-[.9rem] text-crimson-text">No se pudo guardar. Probá de nuevo.</p>}
      </section>
    );
  }

  return (
    <section className="border border-text p-6 sm:p-8">
      <h2 className="font-display text-[1.45rem] font-bold leading-[1.15] tracking-tight text-text">{question}</h2>
      <p className="mt-3 max-w-[46ch] text-[.98rem] leading-[1.65] text-text2">
        Marcalo como hecho y lo vas a ver en tu perfil, en Aprendizaje.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle(true)}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover disabled:cursor-wait disabled:opacity-70"
      >
        <Check size={15} aria-hidden="true" />
        {pending ? "Guardando…" : "Marcar como hecho"}
      </button>
      {error && <p className="mt-4 text-[.9rem] text-crimson-text">No se pudo guardar. Probá de nuevo.</p>}
    </section>
  );
}
