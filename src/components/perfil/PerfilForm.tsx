"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { saveProfileAction, type ActionState } from "@/app/perfil/actions";
import { CareerSelect } from "./CareerSelect";
import { MIN_START_YEAR, OTHER_CAREER_SLUG } from "@/lib/perfil/careers";
import { AFFILIATION_OPTIONS, needsInstitution } from "@/lib/perfil/completeness";
import { cn } from "@/lib/utils";
import type { ProfileAffiliation, ProfileRole, StudentStatus } from "../../../generated/prisma/client";

const initialState: ActionState = { error: null };

export type ExistingProfile = {
  role: ProfileRole;
  otherRole: string | null;
  careers: string[];
  otherCareer: string | null;
  startYear: number | null;
  studentStatus: StudentStatus | null;
  fullName: string | null;
  affiliation: ProfileAffiliation | null;
  institution: string | null;
  consentAcceptedAt: Date | null;
};

const labelClass = "font-mono text-[.76rem] uppercase tracking-[.1em] text-text3";
const inputClass =
  "rounded-[var(--r-sm)] border border-border bg-bg2 px-3.5 py-2.5 font-body text-[.95rem] text-text transition-colors focus:border-crimson focus:outline-none";

function PillToggleGroup<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T | null;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, optionLabel]) => (
        <label key={v} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => onChange(v)}
            className="peer sr-only"
          />
          <span className="block rounded-[var(--r-pill)] border-[1.5px] border-border-strong/30 px-4.5 py-2 font-body text-[.88rem] text-text2 transition-colors peer-checked:border-crimson peer-checked:bg-crimson peer-checked:text-white hover:border-border-strong">
            {optionLabel}
          </span>
        </label>
      ))}
    </div>
  );
}

export function PerfilForm({
  existing,
  defaultName = "",
  submitLabel,
  next,
}: {
  existing?: ExistingProfile;
  /** Nombre de la cuenta de Google, para prellenar cuando el perfil todavia no tiene uno. */
  defaultName?: string;
  submitLabel: string;
  /** A donde redirigir despues de guardar (ver saveProfileAction y safeNext). */
  next: string;
}) {
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState);
  const [role, setRole] = useState<"STUDENT" | "PROFESSOR" | "OTHER">(existing?.role ?? "STUDENT");
  const [affiliation, setAffiliation] = useState<ProfileAffiliation | null>(existing?.affiliation ?? null);
  const [careers, setCareers] = useState<string[]>(existing?.careers ?? []);
  const [studentStatus, setStudentStatus] = useState<"STUDYING" | "GRADUATED" | null>(existing?.studentStatus ?? null);
  const [, startTransition] = useTransition();

  // En cada render y no al cargar el modulo, para que no quede viejo al cambiar de año.
  const currentYear = new Date().getFullYear();
  // Mas reciente primero: la mayoria de quienes completan esto arrancaron su carrera hace poco.
  const startYearOptions = Array.from({ length: currentYear - MIN_START_YEAR + 1 }, (_, i) => currentYear - i);

  return (
    <form
      // La accion se llama a mano y no con `action={formAction}`: React 19 resetea el formulario al terminar una
      // accion de <form action>, y despues de un error del servidor se perdian el año y los radios.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-8 border border-border bg-card p-6 sm:p-10"
    >
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-2">
        <span className={labelClass}>Nombre y apellido</span>
        <input
          type="text"
          name="fullName"
          required
          autoComplete="name"
          maxLength={120}
          defaultValue={existing?.fullName ?? defaultName}
          className={inputClass}
        />
      </label>

      <fieldset className="flex flex-col gap-2.5">
        <legend className={labelClass}>¿De dónde sos?</legend>
        <PillToggleGroup name="affiliation" value={affiliation} onChange={setAffiliation} options={AFFILIATION_OPTIONS} />
      </fieldset>

      {needsInstitution(affiliation) && (
        <label className="flex flex-col gap-2">
          <span className={labelClass}>{affiliation === "WORK" ? "Empresa o lugar de trabajo" : "Universidad"}</span>
          <input
            type="text"
            name="institution"
            required
            maxLength={120}
            defaultValue={existing?.institution ?? ""}
            className={inputClass}
          />
        </label>
      )}

      <fieldset className="flex flex-col gap-2.5">
        <legend className={labelClass}>¿Cuál es tu rol?</legend>
        <PillToggleGroup
          name="role"
          value={role}
          onChange={setRole}
          options={
            [
              ["STUDENT", "Estudiante"],
              ["PROFESSOR", "Profesor/a"],
              ["OTHER", "Otro"],
            ] as const
          }
        />
      </fieldset>

      {role === "OTHER" && (
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Especificá tu rol</span>
          <input type="text" name="otherRole" required defaultValue={existing?.otherRole ?? ""} className={inputClass} />
        </label>
      )}

      {role === "STUDENT" && (
        <>
          <fieldset className="flex flex-col gap-2.5">
            <legend className={labelClass}>Estado</legend>
            <PillToggleGroup
              name="studentStatus"
              value={studentStatus}
              onChange={setStudentStatus}
              options={
                [
                  ["STUDYING", "Cursando actualmente"],
                  ["GRADUATED", "Ya me recibí"],
                ] as const
              }
            />
          </fieldset>

          {affiliation === "UDESA" && (
            <div className="flex flex-col gap-2">
              <span className={labelClass}>Carrera(s)</span>
              <CareerSelect selected={careers} onChange={setCareers} />
            </div>
          )}

          {affiliation === "UDESA" && careers.includes(OTHER_CAREER_SLUG) && (
            <label className="flex flex-col gap-2 border-l-2 border-crimson pl-4">
              <span className={cn(labelClass, "text-crimson-text")}>Contanos qué carrera es</span>
              <input
                type="text"
                name="otherCareer"
                required
                placeholder="Nombre de tu carrera"
                defaultValue={existing?.otherCareer ?? ""}
                className={inputClass}
              />
            </label>
          )}

          {affiliation && affiliation !== "UDESA" && (
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Carrera</span>
              <input
                type="text"
                name="otherCareer"
                required
                maxLength={120}
                placeholder="Nombre de tu carrera"
                defaultValue={existing?.otherCareer ?? ""}
                className={inputClass}
              />
            </label>
          )}

          {studentStatus === "STUDYING" && (
            <label className="flex flex-col gap-2">
              <span className={labelClass}>Año de inicio</span>
              <select name="startYear" required defaultValue={existing?.startYear ?? ""} className={cn(inputClass, "w-40")}>
                <option value="" disabled>
                  Elegí un año
                </option>
                {startYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="consent"
          required
          defaultChecked={Boolean(existing?.consentAcceptedAt)}
          className="mt-1 h-4 w-4 shrink-0 accent-crimson"
        />
        <span className="font-body text-[.9rem] leading-[1.6] text-text2">
          Leí y acepto el{" "}
          <Link href="/privacidad" target="_blank" className="text-crimson-text underline underline-offset-2">
            aviso de privacidad
          </Link>
          .
        </span>
      </label>

      <div className="flex flex-col items-start gap-4 pt-1">
        {/* El error va arriba del botón y no al lado: en 375px lo apretaba y el botón se partía en dos líneas. */}
        {state.error && (
          <p role="alert" className="font-body text-sm text-crimson">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="whitespace-nowrap rounded-[var(--r-pill)] border-[1.5px] border-crimson bg-crimson px-7 py-3.5 font-body text-[.88rem] font-medium text-white transition-all duration-350 ease-club hover:-translate-y-0.5 hover:bg-crimson-hover hover:border-crimson-hover active:translate-y-0 disabled:opacity-60"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
