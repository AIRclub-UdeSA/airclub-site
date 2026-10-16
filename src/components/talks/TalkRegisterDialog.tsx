"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, Check, X } from "lucide-react";
import { buildGoogleCalendarUrl, type SchedulableActivity } from "@/lib/calendar-types";
import {
  cancelTalkRegistrationAction,
  registerForTalkAction,
  type CancelResult,
  type RegisterResult,
} from "@/app/talks/register-actions";

/** Lo que se inscribe: una charla de /talks o un taller presencial de /workshops (#70), con el mismo diálogo. */
type Kind = "charla" | "taller";

const COPY: Record<Kind, { to: string; this: string }> = {
  charla: { to: "a la charla", this: "a esta charla" },
  taller: { to: "al taller", this: "a este taller" },
};

interface TalkRegisterDialogProps {
  talk: (SchedulableActivity & { slug: string; title: string }) | null;
  isOpen: boolean;
  /** Ya inscripta: abre directo en la vista con "Cancelar mi inscripción", sin volver a inscribir. */
  alreadyRegistered?: boolean;
  onClose: () => void;
  /** Avisa el resultado para que el botón de la charla se actualice sin recargar. */
  onResult?: (slug: string, status: RegisterResult["status"] | CancelResult["status"]) => void;
  /** Por defecto, una charla con las acciones de /talks. */
  kind?: Kind;
  register?: (slug: string) => Promise<RegisterResult>;
  cancel?: (slug: string) => Promise<CancelResult>;
}

// Mismo timing que TalkModal.tsx (.talk-modal[data-closing] en globals.css): reusa esas
// animaciones, este diálogo solo cambia el tamaño del panel.
const CLOSE_MS = 200;

type Status = "confirm" | "pending" | "error" | RegisterResult["status"] | CancelResult["status"];

export function TalkRegisterDialog({
  talk,
  isOpen,
  alreadyRegistered,
  onClose,
  onResult,
  kind = "charla",
  register = registerForTalkAction,
  cancel = cancelTalkRegistrationAction,
}: TalkRegisterDialogProps) {
  const [status, setStatus] = useState<Status>(alreadyRegistered ? "already" : "confirm");
  // Qué reintenta "Reintentar" si falla la red o el servidor: inscribirse o cancelar.
  const [failedAction, setFailedAction] = useState<"register" | "cancel">("register");
  const [cancelling, setCancelling] = useState(false);
  const [closing, setClosing] = useState(false);
  const [prevSlug, setPrevSlug] = useState(talk?.slug);
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);

  const visible = isOpen && talk !== null;

  // Cada vez que se abre para una charla nueva, vuelve a arrancar en "confirm" (mismo patrón
  // de "ajustar estado durante el render" que usa TalkModal.tsx para su propia charla activa).
  if (talk?.slug !== prevSlug) {
    setPrevSlug(talk?.slug);
    setStatus(alreadyRegistered ? "already" : "confirm");
  }

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => {
      dialogRef.current?.close();
      closingRef.current = false;
      setClosing(false);
      onClose();
    }, CLOSE_MS);
  };

  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [visible]);

  if (!visible || !talk) return null;

  // Los casos esperables (charla cerrada, cupo completo) vuelven como estado; el catch queda solo
  // para fallas de red o del servidor.
  async function handleConfirm() {
    setStatus("pending");
    try {
      const result = await register(talk!.slug);
      setStatus(result.status);
      onResult?.(talk!.slug, result.status);
    } catch {
      setFailedAction("register");
      setStatus("error");
    }
  }

  async function handleCancelRegistration() {
    setCancelling(true);
    try {
      const result = await cancel(talk!.slug);
      setStatus(result.status);
      onResult?.(talk!.slug, result.status);
    } catch {
      setFailedAction("cancel");
      setStatus("error");
    } finally {
      setCancelling(false);
    }
  }

  const calendarUrl = buildGoogleCalendarUrl(talk);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-closing={closing}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
      className="talk-modal m-0 h-dvh max-h-none w-dvw max-w-none items-center justify-center overflow-hidden bg-transparent p-0 text-text open:flex"
    >
      <div className="talk-modal-panel relative flex w-[min(calc(100%-2rem),28rem)] flex-col gap-5 border border-border-strong/30 bg-bg p-6 sm:p-8">
        <button
          type="button"
          onClick={requestClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center border border-border-strong/30 text-text transition-colors hover:border-text hover:bg-bg2"
        >
          <X size={16} aria-hidden="true" />
        </button>

        {status === "confirm" || status === "pending" ? (
          <>
            <h2 id={titleId} className="pr-10 font-display text-[1.3rem] font-bold leading-tight text-text">
              Te estás inscribiendo {COPY[kind].to} &ldquo;{talk.title}&rdquo;
            </h2>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={status === "pending"}
                className="rounded-[var(--r-pill)] border-[1.5px] border-crimson bg-crimson px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
              >
                {status === "pending" ? "Inscribiendo…" : "OK"}
              </button>
              <button
                type="button"
                onClick={requestClose}
                className="font-mono text-[.76rem] uppercase tracking-[.1em] text-text2 transition-colors hover:text-crimson-text"
              >
                Cancelar
              </button>
            </div>
          </>
        ) : status === "error" ? (
          <>
            <h2 id={titleId} className="pr-10 font-display text-[1.15rem] font-bold text-text">
              {failedAction === "cancel" ? "No se pudo cancelar la inscripción" : "No se pudo inscribir"}
            </h2>
            <p className="font-body text-[.92rem] text-text2">Probá de nuevo en un momento.</p>
            <button
              type="button"
              onClick={failedAction === "cancel" ? handleCancelRegistration : handleConfirm}
              className="w-fit rounded-[var(--r-pill)] border-[1.5px] border-crimson bg-crimson px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-crimson-hover"
            >
              Reintentar
            </button>
          </>
        ) : status === "closed" || status === "full" || status === "cancelled" ? (
          <>
            <h2 id={titleId} className="pr-10 font-display text-[1.15rem] font-bold text-text">
              {status === "closed"
                ? `La inscripción ${COPY[kind].this} está cerrada`
                : status === "full"
                  ? "No quedan lugares"
                  : "Cancelaste tu inscripción"}
            </h2>
            <p className="font-body text-[.92rem] text-text2">
              {status === "full" ? "Se completó el cupo de " : ""}&ldquo;{talk.title}&rdquo;{status === "full" ? "." : ""}
            </p>
            <button
              type="button"
              onClick={requestClose}
              className="w-fit font-mono text-[.76rem] uppercase tracking-[.1em] text-text2 transition-colors hover:text-crimson-text"
            >
              Cerrar
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <Check className="size-5 shrink-0 text-crimson" aria-hidden="true" />
              <h2 id={titleId} className="font-display text-[1.15rem] font-bold text-text">
                {status === "already" ? "Ya estás inscripto/a" : "Quedaste inscripto/a"}
              </h2>
            </div>
            <p className="font-body text-[.92rem] text-text2">&ldquo;{talk.title}&rdquo;</p>
            {calendarUrl !== "#" && (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 border border-border-strong/30 px-5 py-2.5 font-mono text-[.76rem] uppercase tracking-[.1em] text-text transition-colors hover:border-text hover:bg-bg2"
              >
                <Calendar className="size-4" aria-hidden="true" />
                Agregar a Google Calendar
              </a>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <button
                type="button"
                onClick={requestClose}
                className="w-fit font-mono text-[.76rem] uppercase tracking-[.1em] text-text2 transition-colors hover:text-crimson-text"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleCancelRegistration}
                disabled={cancelling}
                className="w-fit font-mono text-[.76rem] uppercase tracking-[.1em] text-text3 underline underline-offset-4 transition-colors hover:text-crimson-text disabled:opacity-60"
              >
                {cancelling ? "Cancelando…" : "Cancelar mi inscripción"}
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
