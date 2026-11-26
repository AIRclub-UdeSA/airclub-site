"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Plus, X } from "lucide-react";
import { buildGoogleCalendarUrl, type SchedulableActivity } from "@/lib/calendar-types";
import { RESTRICTED_BUTTON, RESTRICTED_NOTE } from "@/components/talks/RegisterButton";
import { UDESA_EMAIL_DOMAIN } from "@/lib/udesa";
import { TEAM_NAME_MAX_LENGTH, initialMemberRows, teamSizeText } from "@/lib/team-validation";
import { cancelTeamAction, getMyTeamAction, saveTeamAction, type TeamInfo, type TeamView } from "@/app/eventos/team-actions";
import type { CancelResult, RegisterResult } from "@/app/talks/register-actions";

interface TeamRegisterDialogProps {
  event: (SchedulableActivity & { slug: string; title: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  /** Avisa el resultado para que el botón del evento se actualice sin recargar (mismos estados que TalkRegisterDialog). */
  onResult?: (slug: string, status: RegisterResult["status"] | CancelResult["status"]) => void;
}

// Mismo timing que TalkModal.tsx (.talk-modal[data-closing] en globals.css): reusa esas animaciones.
const CLOSE_MS = 200;

const inputClass = "w-full border border-border-strong/30 bg-bg px-3 py-2 font-body text-[.92rem] text-text placeholder:text-text3";
const primaryButton =
  "rounded-[var(--r-pill)] border-[1.5px] border-crimson bg-crimson px-6 py-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-crimson-hover disabled:opacity-60";
const textButton = "w-fit font-mono text-[.76rem] uppercase tracking-[.1em] text-text2 transition-colors hover:text-crimson-text disabled:opacity-60";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

type Screen = "loading" | "form" | "view" | "gone" | "error";

/**
 * Inscripción de un equipo a un evento (registrationType TEAM): el botón del evento abre esto en vez del diálogo de un
 * clic. Sin equipo, el formulario del capitán (nombre y emails de los demás integrantes). Con equipo, lo muestra; el
 * capitán lo puede editar o dar de baja hasta el cierre, y un integrante solo lo ve. La validación es del servidor
 * (saveTeamAction); acá solo se muestran sus errores.
 */
export function TeamRegisterDialog({ event, isOpen, onClose, onResult }: TeamRegisterDialogProps) {
  const { data: session } = useSession();
  const [screen, setScreen] = useState<Screen>("loading");
  const [goneStatus, setGoneStatus] = useState<"closed" | "full" | "restricted">("closed");
  const [info, setInfo] = useState<TeamInfo | null>(null);
  const [team, setTeam] = useState<TeamView | null>(null);
  const [name, setName] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const slug = event?.slug;
  const visible = isOpen && event !== null;

  // Cada vez que se abre para un evento, vuelve a "loading" (mismo patrón de "ajustar estado durante el render" que
  // usa TalkRegisterDialog), y el efecto de abajo pide el equipo.
  const openKey = visible ? (slug ?? null) : null;
  const [prevKey, setPrevKey] = useState<string | null>(null);
  if (openKey !== prevKey) {
    setPrevKey(openKey);
    if (openKey) {
      setScreen("loading");
      setErrors([]);
      setConfirmingCancel(false);
    }
  }

  useEffect(() => {
    if (!visible || !slug) return;
    let cancelled = false;
    getMyTeamAction(slug)
      .then((res) => {
        if (cancelled) return;
        if (!res) return setScreen("error");
        setInfo(res);
        setTeam(res.team);
        if (res.team) setScreen("view");
        else {
          setName("");
          setEmails(Array(initialMemberRows(res.minSize, res.maxSize)).fill(""));
          setScreen("form");
        }
      })
      .catch(() => !cancelled && setScreen("error"));
    return () => {
      cancelled = true;
    };
  }, [visible, slug]);

  useEffect(() => {
    if (!visible) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [visible]);

  if (!visible || !event) return null;

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

  const startEditing = () => {
    if (!team || !info) return;
    setName(team.name);
    const others = team.members.slice(1);
    setEmails(others.length ? others : [""]);
    setErrors([]);
    setScreen("form");
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErrors([]);
    try {
      const result = await saveTeamAction(event!.slug, { name, memberEmails: emails });
      if (result.status === "saved") {
        setTeam(result.team);
        setScreen("view");
        onResult?.(event!.slug, "registered");
      } else if (result.status === "invalid") {
        setErrors(result.errors);
      } else {
        setGoneStatus(result.status);
        setScreen("gone");
        onResult?.(event!.slug, result.status);
      }
    } catch {
      setErrors(["No se pudo guardar el equipo. Probá de nuevo en un momento."]);
    } finally {
      setPending(false);
    }
  }

  async function handleCancelTeam() {
    setPending(true);
    try {
      const result = await cancelTeamAction(event!.slug);
      if (result.status === "cancelled") {
        setTeam(null);
        setName("");
        setEmails(Array(info ? initialMemberRows(info.minSize, info.maxSize) : 1).fill(""));
        setConfirmingCancel(false);
        setScreen("form");
      } else {
        setGoneStatus("closed");
        setScreen("gone");
      }
      onResult?.(event!.slug, result.status);
    } catch {
      setErrors(["No se pudo dar de baja el equipo. Probá de nuevo en un momento."]);
    } finally {
      setPending(false);
    }
  }

  const calendarUrl = buildGoogleCalendarUrl(event);
  const maxOthers = info ? (info.maxSize ?? Infinity) - 1 : 1;

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
      <div className="talk-modal-panel relative flex max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),32rem)] flex-col gap-5 overflow-y-auto border border-border-strong/30 bg-bg p-6 sm:p-8">
        <button
          type="button"
          onClick={requestClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center border border-border-strong/30 text-text transition-colors hover:border-text hover:bg-bg2"
        >
          <X size={16} aria-hidden="true" />
        </button>

        {screen === "loading" && (
          <h2 id={titleId} className="pr-10 font-display text-[1.15rem] font-bold text-text">
            Cargando…
          </h2>
        )}

        {screen === "error" && (
          <>
            <h2 id={titleId} className="pr-10 font-display text-[1.15rem] font-bold text-text">
              No se pudo abrir la inscripción
            </h2>
            <p className="font-body text-[.92rem] text-text2">Probá de nuevo en un momento.</p>
            <button type="button" onClick={requestClose} className={textButton}>
              Cerrar
            </button>
          </>
        )}

        {screen === "gone" && (
          <>
            <h2 id={titleId} className="pr-10 font-display text-[1.15rem] font-bold text-text">
              {goneStatus === "full" ? "No quedan lugares" : goneStatus === "restricted" ? RESTRICTED_BUTTON : "La inscripción está cerrada"}
            </h2>
            <p className="font-body text-[.92rem] text-text2">
              {goneStatus === "restricted" ? RESTRICTED_NOTE : `“${event.title}”`}
            </p>
            <button type="button" onClick={requestClose} className={textButton}>
              Cerrar
            </button>
          </>
        )}

        {screen === "form" && info && (
          <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
            <h2 id={titleId} title={event.title} className="line-clamp-3 pr-10 font-display text-[1.3rem] font-bold leading-tight text-text">
              {team ? "Editar tu equipo" : "Inscribir a tu equipo"} en &ldquo;{event.title}&rdquo;
            </h2>
            <p className="font-body text-[.88rem] leading-relaxed text-text2">
              {capitalize(teamSizeText(info.minSize, info.maxSize))}, contándote a vos. Todos con un email {UDESA_EMAIL_DOMAIN}.
            </p>

            <label className="flex flex-col gap-1 font-mono text-[.72rem] uppercase tracking-[.1em] text-text3">
              Nombre del equipo
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={TEAM_NAME_MAX_LENGTH}
                required
                autoComplete="off"
                className={`${inputClass} normal-case tracking-normal`}
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="font-mono text-[.72rem] uppercase tracking-[.1em] text-text3">Integrantes</span>
              <div className={`${inputClass} flex items-center justify-between gap-3 bg-bg2 text-text2`}>
                <span className="min-w-0 break-all">{session?.user?.email ?? "Tu email"}</span>
                <span className="shrink-0 font-mono text-[.68rem] uppercase tracking-[.1em] text-text3">Capitán (vos)</span>
              </div>
              {emails.map((value, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={value}
                    onChange={(e) => setEmails((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
                    aria-label={`Email del integrante ${i + 1}`}
                    placeholder={`integrante${UDESA_EMAIL_DOMAIN}`}
                    autoComplete="off"
                    className={inputClass}
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setEmails((prev) => prev.filter((_, j) => j !== i))}
                      aria-label={`Quitar al integrante ${i + 1}`}
                      className="flex size-10 shrink-0 cursor-pointer items-center justify-center border border-border-strong/30 text-text2 transition-colors hover:border-text hover:text-text"
                    >
                      <X size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
              {emails.length < maxOthers && (
                <button type="button" onClick={() => setEmails((prev) => [...prev, ""])} className={`${textButton} inline-flex items-center gap-1.5`}>
                  <Plus size={14} aria-hidden="true" />
                  Agregar integrante
                </button>
              )}
            </div>

            {errors.length > 0 && (
              <ul role="alert" className="flex flex-col gap-1 border border-crimson/30 bg-crimson/8 px-4 py-3 font-body text-[.86rem] text-crimson-text">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={pending} className={primaryButton}>
                {pending ? "Guardando…" : team ? "Guardar cambios" : "Inscribir equipo"}
              </button>
              <button type="button" onClick={team ? () => setScreen("view") : requestClose} className={textButton}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {screen === "view" && team && info && (
          <>
            <div className="flex items-center gap-2.5 pr-10">
              <Check className="size-5 shrink-0 text-crimson" aria-hidden="true" />
              <h2 id={titleId} className="font-display text-[1.15rem] font-bold text-text">
                {team.isCaptain ? "Tu equipo está inscripto" : "Estás en un equipo inscripto"}
              </h2>
            </div>
            <p className="font-body text-[.92rem] text-text2">
              <span className="font-semibold text-text">{team.name}</span> en &ldquo;{event.title}&rdquo;
            </p>
            <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
              {team.members.map((m, i) => (
                <li key={m} className="flex items-center justify-between gap-3 py-2 font-body text-[.88rem] text-text2">
                  <span className="min-w-0 break-all">{m}</span>
                  {i === 0 && <span className="shrink-0 font-mono text-[.68rem] uppercase tracking-[.1em] text-text3">Capitán</span>}
                </li>
              ))}
            </ul>
            {!team.isCaptain && <p className="font-body text-[.84rem] text-text3">Solo el capitán puede cambiar el equipo o darlo de baja.</p>}
            {team.isCaptain && !info.canEdit && (
              <p className="font-body text-[.84rem] text-text3">La inscripción ya cerró: el equipo no se puede cambiar.</p>
            )}
            {calendarUrl !== "#" && (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit border border-border-strong/30 px-5 py-2.5 font-mono text-[.76rem] uppercase tracking-[.1em] text-text transition-colors hover:border-text hover:bg-bg2"
              >
                Agregar a Google Calendar
              </a>
            )}
            {errors.length > 0 && (
              <p role="alert" className="font-body text-[.86rem] text-crimson-text">
                {errors[0]}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="button" onClick={requestClose} className={textButton}>
                Cerrar
              </button>
              {team.isCaptain && info.canEdit && (
                <>
                  <button type="button" onClick={startEditing} className={textButton}>
                    Editar equipo
                  </button>
                  {confirmingCancel ? (
                    <span role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-[.84rem]">
                      <span className="text-text2">¿Dar de baja al equipo?</span>
                      <button type="button" onClick={handleCancelTeam} disabled={pending} className="font-semibold text-crimson-text hover:underline disabled:opacity-60">
                        {pending ? "Dando de baja…" : "Sí, dar de baja"}
                      </button>
                      <button type="button" onClick={() => setConfirmingCancel(false)} disabled={pending} className="text-text2 hover:text-text">
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingCancel(true)}
                      className="w-fit font-mono text-[.76rem] uppercase tracking-[.1em] text-text3 underline underline-offset-4 transition-colors hover:text-crimson-text"
                    >
                      Dar de baja el equipo
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
