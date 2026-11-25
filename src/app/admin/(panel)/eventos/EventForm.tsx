"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { createEvent, updateEvent, type ActionState } from "./actions";
import { AUDIENCE_OPTIONS, type Audience } from "@/lib/udesa";
import { REGISTRATION_TYPE_OPTIONS, isOwnRegistration, type RegistrationType } from "@/lib/event-registration";

export type EditingEvent = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  category: "WORKSHOP" | "COMPETITION" | "MEETUP" | "TALK";
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  dateLabel: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  instructor: string | null;
  prerequisites: string | null;
  track: string | null;
  featuredForCountdown: boolean;
  ctaLabel: string | null;
  externalUrl: string | null;
  registrationType: RegistrationType;
  registrationOpen: boolean;
  registrationDeadline: Date | null;
  audience: Audience;
  capacity: number | null;
  teamMinSize: number | null;
  teamMaxSize: number | null;
};

const CATEGORY_OPTIONS = [
  { value: "COMPETITION", label: "Competencia" },
  { value: "MEETUP", label: "Encuentro" },
  { value: "WORKSHOP", label: "Taller" },
  { value: "TALK", label: "Charla" },
] as const;

const inputClass = "rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text";
const labelClass = "flex flex-1 min-w-[12rem] flex-col gap-1 text-sm text-text2";
const hintClass = "text-xs text-text3";

// Argentina no tiene horario de verano: offset fijo, alcanza restar 3hs para separar fecha/hora locales de un Date en UTC.
function toDatePart(date: Date | null): string {
  return date ? new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10) : "";
}

function toTimePart(date: Date | null): string {
  return date ? new Date(date.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(11, 16) : "";
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const initialState: ActionState = { error: null };

export function EventForm({ event }: { event?: EditingEvent }) {
  const isEditing = !!event;
  const [state, formAction, pending] = useActionState(isEditing ? updateEvent : createEvent, initialState);
  const [type, setType] = useState<RegistrationType>(event?.registrationType ?? "NONE");
  const [category, setCategory] = useState(event?.category ?? "MEETUP");
  const slugRef = useRef<HTMLInputElement>(null);
  // Mientras no se toque el slug a mano, sigue al título.
  const slugTouched = useRef(false);
  const own = isOwnRegistration(type);
  const typeHint = REGISTRATION_TYPE_OPTIONS.find((o) => o.value === type)?.hint;

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {event && <input type="hidden" name="id" value={event.id} />}

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">El evento</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Título
            <input
              type="text"
              name="title"
              required
              defaultValue={event?.title}
              onChange={(e) => {
                if (!isEditing && slugRef.current && !slugTouched.current) slugRef.current.value = slugify(e.target.value);
              }}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Subtítulo (opcional)
            <input type="text" name="tagline" defaultValue={event?.tagline ?? ""} className={inputClass} />
          </label>
        </div>
        <label className={`${labelClass} max-w-[24rem]`}>
          Slug (la dirección: /eventos/…)
          <input
            ref={slugRef}
            type="text"
            name="slug"
            required
            readOnly={isEditing}
            defaultValue={event?.slug}
            onChange={() => (slugTouched.current = true)}
            className={`${inputClass} ${isEditing ? "opacity-70" : ""}`}
          />
          <span className={hintClass}>{isEditing ? "No se cambia una vez creado: se rompería cada link compartido." : "Minúsculas, números y guiones."}</span>
        </label>
        <label className="flex w-full flex-col gap-1 text-sm text-text2">
          Descripción
          <textarea name="description" rows={4} required defaultValue={event?.description} className={inputClass} />
        </label>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Tipo de actividad
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={inputClass}>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Lugar (opcional)
            <input type="text" name="location" placeholder="Campus Victoria, UdeSA" defaultValue={event?.location ?? ""} className={inputClass} />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Instructor u organizador (opcional)
            <input type="text" name="instructor" defaultValue={event?.instructor ?? ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Requisitos (opcional)
            <input type="text" name="prerequisites" defaultValue={event?.prerequisites ?? ""} className={inputClass} />
          </label>
          {category === "WORKSHOP" && (
            <label className={labelClass}>
              Camino de /workshops cuando pase (opcional)
              <input type="text" name="track" defaultValue={event?.track ?? ""} className={inputClass} />
            </label>
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Cuándo</legend>
        <div className="flex flex-wrap gap-3">
          <label className={labelClass}>
            Día
            <input type="date" name="date" required defaultValue={toDatePart(event?.startsAt ?? null)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Hora de inicio (opcional)
            <input type="time" name="startTime" defaultValue={toTimePart(event?.startsAt ?? null)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Hora de fin (opcional)
            <input type="time" name="endTime" defaultValue={event?.endsAt ? toTimePart(event.endsAt) : ""} className={inputClass} />
          </label>
          <label className={labelClass}>
            Día de fin, si dura más de un día
            <input
              type="date"
              name="endDate"
              defaultValue={event?.endsAt && toDatePart(event.endsAt) !== toDatePart(event.startsAt) ? toDatePart(event.endsAt) : ""}
              className={inputClass}
            />
          </label>
        </div>
        <label className={labelClass}>
          Cómo se muestra la fecha (opcional)
          <input type="text" name="dateLabel" placeholder="3 al 6 de Noviembre de 2026" defaultValue={event?.dateLabel ?? ""} className={inputClass} />
        </label>
        <p className={hintClass}>
          Sin horas, el evento ocupa todo el día. Si completás &ldquo;Cómo se muestra la fecha&rdquo;, ese texto reemplaza a la fecha exacta
          en el sitio (el calendario sigue usando la real). Horario de Argentina.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Inscripción</legend>
        <label className={`${labelClass} max-w-[24rem]`}>
          Cómo se inscribe la gente
          <select name="registrationType" value={type} onChange={(e) => setType(e.target.value as RegistrationType)} className={inputClass}>
            {REGISTRATION_TYPE_OPTIONS.map((o) => (
              // Equipo llega en el PR que sigue (inscripcion-equipos): hasta entonces no se puede elegir.
              <option key={o.value} value={o.value} disabled={o.value === "TEAM"}>
                {o.label}
                {o.value === "TEAM" ? " (todavía no disponible)" : ""}
              </option>
            ))}
          </select>
        </label>
        {typeHint && <p className={hintClass}>{typeHint}</p>}

        {type === "EXTERNAL_LINK" && (
          <label className={labelClass}>
            Link del botón
            <input type="url" name="externalUrl" required placeholder="https://forms.gle/…" defaultValue={event?.externalUrl ?? ""} className={inputClass} />
          </label>
        )}

        {type !== "NONE" && (
          <label className={labelClass}>
            Texto del botón (opcional)
            <input
              type="text"
              name="ctaLabel"
              placeholder={type === "TEAM" ? "Inscribir mi equipo" : "Inscribirme"}
              defaultValue={event?.ctaLabel ?? ""}
              className={inputClass}
            />
          </label>
        )}

        {own && (
          <>
            <label className="flex items-center gap-2 text-sm text-text2">
              <input type="checkbox" name="registrationOpen" defaultChecked={event?.registrationOpen ?? false} />
              Inscripción abierta ahora
            </label>
            <label className={`${labelClass} max-w-[24rem]`}>
              Quién puede inscribirse
              <select name="audience" required defaultValue={event?.registrationType && isOwnRegistration(event.registrationType) ? event.audience : ""} className={inputClass}>
                <option value="" disabled>
                  Elegí una opción
                </option>
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-3">
              <label className={`${labelClass} max-w-[16rem]`}>
                {type === "TEAM" ? "Cupo de equipos" : "Cupo de personas"}
                <input type="number" name="capacity" min={1} step={1} placeholder="Sin límite" defaultValue={event?.capacity ?? ""} className={inputClass} />
              </label>
              <label className={`${labelClass} max-w-[16rem]`}>
                Cierra el día (opcional)
                <input type="date" name="deadlineDate" defaultValue={toDatePart(event?.registrationDeadline ?? null)} className={inputClass} />
              </label>
              <label className={`${labelClass} max-w-[16rem]`}>
                A las (opcional)
                <input type="time" name="deadlineTime" defaultValue={toTimePart(event?.registrationDeadline ?? null)} className={inputClass} />
              </label>
            </div>
          </>
        )}

        {type === "TEAM" && (
          <div className="flex flex-wrap gap-3">
            <label className={`${labelClass} max-w-[16rem]`}>
              Integrantes mínimo (capitán incluido)
              <input type="number" name="teamMinSize" required min={1} step={1} defaultValue={event?.teamMinSize ?? ""} className={inputClass} />
            </label>
            <label className={`${labelClass} max-w-[16rem]`}>
              Integrantes máximo (capitán incluido)
              <input type="number" name="teamMaxSize" required min={1} step={1} defaultValue={event?.teamMaxSize ?? ""} className={inputClass} />
            </label>
          </div>
        )}

        {own && (
          <p className={hintClass}>
            Con inscripción propia, quien entra tiene que iniciar sesión con Google y completar su perfil. Sin fecha de cierre se inscribe hasta
            que el evento termina; pasada la fecha de cierre ya no se inscribe ni se cambia nada. Con cupo, al llenarse el botón avisa que no
            quedan lugares; vacío es sin límite. Si es solo UdeSA, quien entra con otra cuenta ve el botón deshabilitado con la explicación.
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-mono text-xs uppercase tracking-wide text-text3">Visibilidad</legend>
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-text2">
            Estado
            <select name="status" defaultValue={event?.status === "DRAFT" ? "DRAFT" : "PUBLISHED"} className={inputClass}>
              <option value="PUBLISHED">Publicado</option>
              <option value="DRAFT">Borrador</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-text2">
            <input type="checkbox" name="featuredForCountdown" defaultChecked={event?.featuredForCountdown ?? false} />
            Cuenta regresiva de la landing
          </label>
        </div>
        <p className={hintClass}>
          En Borrador el evento no aparece en el sitio para nadie. La cuenta regresiva de la landing tiene hoy el texto del Challenge JAR 2026
          escrito en el código: no la tildes para otro evento.
        </p>
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-crimson-text">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--r-pill)] bg-crimson px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover disabled:opacity-60"
        >
          {pending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear evento"}
        </button>
        <Link href="/admin/eventos" className="text-sm font-medium text-text2 hover:text-crimson-text">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
