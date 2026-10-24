"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { sendFeedbackAction, type SendFeedbackState } from "@/lib/feedback/actions";
import { FEEDBACK_MAX_LENGTH, FEEDBACK_TYPE_LABELS, FEEDBACK_TYPES, HONEYPOT_FIELD } from "@/lib/feedback/rules";

const initialState: SendFeedbackState = { status: "idle", error: null };

// Distancia del panel al borde de abajo: arriba del botón de feedback (h-11 a 1.5rem del borde) con aire.
const BASE_BOTTOM_PX = 80;

/**
 * Corre el panel hacia arriba cuando el teclado del celular achica la ventana visible, para que no tape el
 * formulario. `visualViewport` es la parte de la página que se ve; sin teclado mide lo mismo que la ventana.
 */
function useKeyboardInset(active: boolean): { bottom: number; maxHeight: number | null } {
  const [inset, setInset] = useState({ bottom: BASE_BOTTOM_PX, maxHeight: null as number | null });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    function update() {
      const keyboard = Math.max(0, window.innerHeight - vv!.height - vv!.offsetTop);
      // Con teclado, el panel se apoya justo arriba de él (el botón queda tapado de todos modos).
      const bottom = keyboard > 0 ? keyboard + 8 : BASE_BOTTOM_PX;
      setInset({ bottom, maxHeight: vv!.height - (keyboard > 0 ? 16 : BASE_BOTTOM_PX + 16) - 72 });
    }
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);

  return inset;
}

/** Panel del botón de feedback (#122). Se carga con import dinámico desde FeedbackButton. */
export function FeedbackPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Al enviar y tocar "Mandar otro" se remonta el formulario, que así arranca de cero (estado de la action incluido).
  const [formKey, setFormKey] = useState(0);
  const { bottom, maxHeight } = useKeyboardInset(open);

  useEffect(() => {
    if (!open) return;
    // Foco al primer control del panel al abrir.
    panelRef.current?.querySelector<HTMLElement>("input:not([tabindex='-1'])")?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      id="feedback-panel"
      role="dialog"
      aria-labelledby="feedback-title"
      hidden={!open}
      style={{ bottom: `calc(${bottom}px + env(safe-area-inset-bottom))`, maxHeight: maxHeight ?? undefined }}
      className="feedback-panel fixed inset-x-4 z-[110] flex max-h-[calc(100dvh-7rem)] flex-col overflow-y-auto overscroll-contain rounded-[var(--r-md)] border border-border bg-card p-5 text-text shadow-[0_4px_16px_rgba(13,4,7,0.1)] sm:left-auto sm:right-6 sm:w-[24rem]"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="feedback-title" className="font-display text-lg font-bold">
          Feedback
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text3 transition-colors hover:text-crimson-text"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <FeedbackForm key={formKey} onAnother={() => setFormKey((k) => k + 1)} onClose={onClose} />
    </div>
  );
}

function FeedbackForm({ onAnother, onClose }: { onAnother: () => void; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const [state, formAction, pending] = useActionState(sendFeedbackAction, initialState);
  const [length, setLength] = useState(0);

  if (state.status === "sent") {
    return (
      <div role="status" className="mt-3 flex flex-col gap-4">
        <p className="text-text2">¡Gracias! Lo vamos a leer.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            // El botón de enviar desaparece con el mensaje de gracias: el foco pasa acá para no perderse.
            autoFocus
            onClick={onAnother}
            className="rounded-[var(--r-pill)] border border-border px-4 py-2 text-sm font-medium text-text2 transition-colors hover:border-crimson hover:text-crimson-text"
          >
            Mandar otro
          </button>
          <button type="button" onClick={onClose} className="px-2 py-2 text-sm font-medium text-text3 hover:text-text">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      // onSubmit y no `action`: con `action`, React resetea el formulario al terminar y un error (por ejemplo el
      // límite de envíos) borraría lo escrito.
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Contexto técnico, tomado al enviar (la página puede haber cambiado desde que se abrió el panel).
        formData.set("path", window.location.pathname);
        formData.set("viewport", `${window.innerWidth}x${window.innerHeight}`);
        formData.set("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
        startTransition(() => formAction(formData));
      }}
      className="mt-1 flex flex-col gap-4"
    >
      <p className="break-all font-mono text-xs text-text3">
        Sobre: <span className="text-text2">{pathname}</span>
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm text-text2">¿Qué querés contarnos?</legend>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_TYPES.map((type) => (
            <label key={type} className="cursor-pointer">
              <input type="radio" name="type" value={type} required className="peer sr-only" />
              <span className="inline-flex rounded-[var(--r-pill)] border border-border px-3.5 py-1.5 text-sm text-text2 transition-colors hover:border-border-h peer-checked:border-crimson peer-checked:bg-crimson peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-crimson">
                {FEEDBACK_TYPE_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm text-text2">
        Comentario
        {/* text-base en celular: con menos de 16px iOS hace zoom al enfocar. */}
        <textarea
          name="message"
          required
          rows={5}
          maxLength={FEEDBACK_MAX_LENGTH}
          onChange={(e) => setLength(e.target.value.length)}
          className="resize-y rounded-[var(--r-sm)] border border-border bg-bg px-3 py-2 text-base text-text placeholder:text-text3 focus:border-crimson focus:outline-none sm:text-sm"
          placeholder="Qué pasó, qué falta o qué cambiarías"
        />
        <span className="self-end font-mono text-xs text-text3" aria-live="polite">
          {length}/{FEEDBACK_MAX_LENGTH}
        </span>
      </label>

      {sessionStatus === "authenticated" ? (
        <p className="text-xs text-text3">
          Se manda con tu cuenta <span className="break-all text-text2">{session.user?.email}</span>.
        </p>
      ) : (
        <label className="flex flex-col gap-1.5 text-sm text-text2">
          <span>
            Email <span className="text-text3">(opcional, si querés que te respondamos)</span>
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="rounded-[var(--r-sm)] border border-border bg-bg px-3 py-2 text-base text-text focus:border-crimson focus:outline-none sm:text-sm"
          />
        </label>
      )}

      {/* Campo trampa (#121): invisible para personas y lectores de pantalla; si llega lleno, no se guarda nada. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          No completar
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-crimson-text">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/privacidad" className="text-xs text-text3 underline underline-offset-4 hover:text-crimson-text">
          Qué datos se guardan
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 font-mono text-[.82rem] font-bold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </form>
  );
}
