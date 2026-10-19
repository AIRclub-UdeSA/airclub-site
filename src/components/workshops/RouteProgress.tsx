"use client";

import Link from "next/link";
import type { AsyncWorkshop } from "@/lib/workshops";
import { routeStates } from "@/lib/workshop-progress";
import { useWorkshopProgress } from "./WorkshopProgress";

/**
 * Cuánto lleva la persona del recorrido: la cifra en Anton y un casillero por guía (hecho = gris claro, como en la ruta;
 * el siguiente = carmesí; el resto = contorno). Sin sesión, invita a ingresar para llevar el registro.
 */
export function RouteProgress({ guides, back }: { guides: AsyncWorkshop[]; back: string }) {
  const { status, completed, login } = useWorkshopProgress();

  if (status === "loading") return <div className="mt-8 h-[4.5rem]" aria-hidden="true" />;

  if (status === "anon") {
    return (
      <div className="mt-8 border-t border-text/20 pt-5">
        <p className="max-w-[46ch] text-[.95rem] leading-[1.65] text-text2">
          Ingresá con tu cuenta de UdeSA o, si no tenés, con una de Google para marcar lo que vas haciendo y ver por dónde seguir.
        </p>
        <button
          type="button"
          onClick={() => login(back)}
          className="mt-4 cursor-pointer font-mono text-[.74rem] font-semibold uppercase tracking-[.14em] text-text underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text hover:decoration-crimson-text"
        >
          Ingresar
        </button>
      </div>
    );
  }

  const states = routeStates(
    guides.map((g) => g.slug),
    completed,
  );
  const done = guides.filter((g) => completed.has(g.slug)).length;

  return (
    <div className="mt-8 border-t border-text/20 pt-5">
      <div className="flex items-end gap-4">
        <p className="font-logo text-[3.2rem] leading-[0.8] text-crimson-text">
          {String(done).padStart(2, "0")}
          <span className="text-text3">/{String(guides.length).padStart(2, "0")}</span>
        </p>
        <p className="pb-0.5 font-mono text-[.72rem] uppercase tracking-[.16em] text-text3">
          {done === guides.length ? "Recorrido completo" : "Hechos"}
        </p>
      </div>
      <ol className="mt-4 flex flex-wrap gap-1.5" aria-label="Progreso del recorrido">
        {guides.map((g) => {
          const state = states.get(g.slug);
          return (
            <li key={g.slug}>
              <a
                href={`#semana-${g.week}`}
                title={`${g.week} · ${g.title}`}
                className={`block size-5 border transition-colors ${
                  state === "done"
                    ? "border-text/25 bg-text/20"
                    : state === "next"
                      ? "border-crimson bg-crimson"
                      : "border-text/40 hover:border-crimson-text"
                }`}
              >
                <span className="sr-only">
                  Semana {g.week}: {state === "done" ? "hecho" : state === "next" ? "siguiente" : "pendiente"}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <Link
        href="/perfil/aprendizaje"
        className="mt-4 inline-block font-mono text-[.72rem] uppercase tracking-[.14em] text-text3 underline decoration-text/25 underline-offset-[6px] transition-colors hover:text-crimson-text"
      >
        Mi aprendizaje
      </Link>
    </div>
  );
}
