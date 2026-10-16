"use client";

import { ArrowUpRight, Check } from "lucide-react";
import type { TimelineTalk } from "./TalksTimeline";

/**
 * Lo que sabe el cliente de la cuenta frente a una charla (ver getMyTalkRegistrationsAction):
 * `loading` mientras se resuelve la sesión y la consulta, para no mostrar un estado equivocado.
 */
export type RegistrationState = "loading" | "open" | "registered" | "full";

type Variant = "hero" | "card" | "modal";

// Clases por lugar: son los mismos tres botones que había inline, ahora con un solo componente.
const BASE: Record<Variant, string> = {
  hero: "relative z-10 inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] 2xl:px-6 2xl:tracking-[.14em] transition-colors",
  modal:
    "mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] transition-colors",
  card: "relative z-10 inline-flex items-center gap-1.5 font-mono text-[.74rem] uppercase tracking-[.12em] transition-colors",
};

// Sobre fondo carmesí (hero y modal) el botón es blanco; en la tarjeta es un enlace subrayado.
const OPEN: Record<Variant, string> = {
  hero: "cursor-pointer bg-white text-crimson hover:bg-[#f5e8ec]",
  modal: "cursor-pointer bg-white text-crimson hover:bg-bg2",
  card: "cursor-pointer text-crimson-text underline decoration-crimson-text/40 underline-offset-[6px] hover:decoration-crimson-text",
};

const REGISTERED: Record<Variant, string> = {
  hero: "cursor-pointer border-[1.5px] border-white bg-transparent text-white hover:bg-white/15",
  modal: "cursor-pointer border-[1.5px] border-white bg-transparent text-white hover:bg-white/15",
  card: "cursor-pointer text-text underline decoration-text/40 underline-offset-[6px] hover:decoration-text",
};

const FULL: Record<Variant, string> = {
  hero: "cursor-not-allowed border-[1.5px] border-white/50 bg-transparent text-white/70",
  modal: "cursor-not-allowed border-[1.5px] border-white/50 bg-transparent text-white/70",
  card: "cursor-not-allowed text-text3 line-through decoration-text3/50",
};

// Neutro: mismo tamaño que "Inscribirme" (el texto queda invisible), sin decir nada todavía.
const LOADING: Record<Variant, string> = {
  hero: "bg-white/40",
  modal: "bg-white/40",
  card: "bg-text/10",
};

interface RegisterButtonProps {
  talk: TimelineTalk;
  state: RegistrationState;
  variant: Variant;
  onRegister: (talk: TimelineTalk) => void;
}

export function RegisterButton({ talk, state, variant, onRegister }: RegisterButtonProps) {
  const label = talk.registrationLabel ?? "Inscribirme";
  // Los botones no son del mismo alto en las tres variantes: el de la tarjeta es solo texto.
  const loadingShape = variant === "card" ? "rounded-sm" : "rounded-full";

  if (state === "loading") {
    return (
      <button
        type="button"
        disabled
        aria-busy="true"
        aria-label={label}
        className={`${BASE[variant]} ${LOADING[variant]} ${loadingShape} animate-pulse motion-reduce:animate-none`}
      >
        <span aria-hidden="true" className="invisible">
          {label}
        </span>
        <ArrowUpRight size={variant === "card" ? 14 : 15} aria-hidden="true" className="invisible" />
      </button>
    );
  }

  if (state === "full") {
    return (
      <button type="button" disabled className={`${BASE[variant]} ${FULL[variant]}`}>
        Cupo completo
      </button>
    );
  }

  if (state === "registered") {
    return (
      <button type="button" onClick={() => onRegister(talk)} className={`${BASE[variant]} ${REGISTERED[variant]}`}>
        <Check size={variant === "card" ? 14 : 15} aria-hidden="true" />
        Inscripto/a
      </button>
    );
  }

  return (
    <button type="button" onClick={() => onRegister(talk)} className={`${BASE[variant]} ${OPEN[variant]}`}>
      <span>{label}</span>
      <ArrowUpRight size={variant === "card" ? 14 : 15} aria-hidden="true" />
    </button>
  );
}
