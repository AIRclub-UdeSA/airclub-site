"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MessageSquare } from "lucide-react";

// El panel se baja recién al tocar el botón (o al pasar el mouse / enfocarlo, para que abra al toque), así no
// suma JS a la carga inicial de ninguna página (#116/#117/#119).
const loadPanel = () => import("./FeedbackPanel").then((m) => m.FeedbackPanel);
const FeedbackPanel = dynamic(loadPanel, { ssr: false });

/**
 * Botón fijo abajo a la derecha, en todas las páginas (también /admin), para mandar feedback sobre la página
 * actual (#120). Ocupa el lugar que tenía "Volver arriba" (ScrollTopButton), que se sacó con este botón.
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  // Una vez abierto, el panel queda montado (oculto) para no perder lo escrito si se cierra sin enviar.
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Cerrar feedback" : "Dejar feedback sobre esta página"}
        aria-expanded={open}
        aria-controls={mounted ? "feedback-panel" : undefined}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        onClick={() => {
          setMounted(true);
          setOpen((o) => !o);
        }}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))] z-[100] flex h-11 items-center gap-2 rounded-full bg-crimson px-3.5 font-mono text-[.82rem] font-bold uppercase tracking-[.14em] text-white shadow-[0_4px_16px_rgba(164,12,76,0.3)] transition-colors duration-200 hover:bg-crimson-hover aria-expanded:bg-crimson-hover motion-reduce:transition-none"
      >
        <MessageSquare size={18} strokeWidth={2} aria-hidden="true" />
        <span className="hidden sm:inline">Feedback</span>
      </button>
      {mounted && <FeedbackPanel open={open} onClose={close} />}
    </>
  );
}
