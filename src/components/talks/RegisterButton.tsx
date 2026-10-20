"use client";

import { useId } from "react";
import { ArrowRight, Check } from "lucide-react";

// La flecha es → y no ↗: el botón abre el diálogo en la misma página, no sale a otro sitio (igual que el de /workshops).

/**
 * Lo que sabe el cliente de la cuenta frente a una charla (ver getMyTalkRegistrationsAction):
 * `loading` mientras se resuelve la sesión y la consulta, para no mostrar un estado equivocado.
 */
export type RegistrationState = "loading" | "open" | "registered" | "full" | "restricted";

/** Por qué está deshabilitado el botón de un evento solo UdeSA; va visible junto al botón, no solo en un tooltip. */
export const RESTRICTED_BUTTON = "Solo para la comunidad UdeSA";
export const RESTRICTED_NOTE = "Para inscribirte necesitás una cuenta @udesa.edu.ar.";

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

// Como FULL, pero sin tachar: el texto es la explicación, no un "agotado".
const RESTRICTED: Record<Variant, string> = { ...FULL, card: "cursor-not-allowed text-text3" };

const RESTRICTED_NOTE_CLASS: Record<Variant, string> = {
  hero: "font-body text-[.82rem] text-white/80",
  modal: "mt-2 font-body text-[.82rem] text-white/80",
  card: "font-body text-[.78rem] text-text3",
};

// Neutro: mismo tamaño que "Inscribirme" (el texto queda invisible), sin decir nada todavía.
const LOADING: Record<Variant, string> = {
  hero: "bg-white/40",
  modal: "bg-white/40",
  card: "bg-text/10",
};

interface RegisterButtonProps<T extends { registrationLabel?: string }> {
  /** Una charla de /talks o una actividad de /eventos: solo se lee su `registrationLabel`. */
  talk: T;
  state: RegistrationState;
  variant: Variant;
  onRegister: (talk: T) => void;
}

export function RegisterButton<T extends { registrationLabel?: string }>({ talk, state, variant, onRegister }: RegisterButtonProps<T>) {
  const label = talk.registrationLabel ?? "Inscribirme";
  // Los botones no son del mismo alto en las tres variantes: el de la tarjeta es solo texto.
  const noteId = useId();
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
        <ArrowRight size={variant === "card" ? 14 : 15} aria-hidden="true" className="invisible" />
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

  if (state === "restricted") {
    // El botón no puede explicarse solo: la línea va visible al lado, no en un tooltip.
    // En el hero, desde `sm`, el bloque se disuelve (`contents`) y la línea pasa a una fila propia debajo del botón y de
    // "Ver detalles" (`sm:order-last sm:basis-full` dentro del flex-wrap): así "Ver detalles" queda alineado con el
    // botón y no con el bloque botón + línea. En mobile, donde "Ver detalles" baja igual, la línea queda pegada al botón.
    return (
      <span className={variant === "modal" ? "block" : `inline-flex flex-col items-start gap-1.5${variant === "hero" ? " sm:contents" : ""}`}>
        <button type="button" disabled aria-describedby={noteId} className={`${BASE[variant]} ${RESTRICTED[variant]}`}>
          {RESTRICTED_BUTTON}
        </button>
        <span id={noteId} className={`block ${RESTRICTED_NOTE_CLASS[variant]}${variant === "hero" ? " sm:order-last sm:-mt-1.5 sm:basis-full" : ""}`}>
          {RESTRICTED_NOTE}
        </span>
      </span>
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
      <ArrowRight size={variant === "card" ? 14 : 15} aria-hidden="true" />
    </button>
  );
}
