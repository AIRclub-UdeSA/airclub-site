"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { saveProfileAction, type ActionState } from "@/app/perfil/actions";
import { CareerSelect } from "./CareerSelect";
import { MIN_START_YEAR, OTHER_CAREER_SLUG } from "@/lib/perfil/careers";
import { AFFILIATION_OPTIONS, needsInstitution } from "@/lib/perfil/completeness";
import { firstInvalidField, validateProfileForm, type FieldErrors, type ProfileField } from "@/lib/perfil/validate-form";
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

/** Mensaje de error de un campo, justo debajo de él. El campo lo apunta con `aria-describedby`. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="font-body text-[.85rem] leading-snug text-crimson-text">
      {message}
    </p>
  );
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  // Campo al que hay que llevar el foco después de pintar los errores (el primero con error, en el orden de la pantalla).
  const focusAfterErrors = useRef<ProfileField | null>(null);

  useEffect(() => {
    const field = focusAfterErrors.current;
    if (!field) return;
    focusAfterErrors.current = null;
    const wrapper = formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
    const target = wrapper?.querySelector<HTMLElement>("input:not([type=hidden]), select, button") ?? wrapper;
    target?.focus({ preventScroll: true });
    wrapper?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [fieldErrors]);

  // Al cambiar un campo, se le saca su error; el resto queda hasta que se corrija.
  function clearError(field: ProfileField) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const rest = { ...prev };
      delete rest[field];
      return rest;
    });
  }
  const describedBy = (field: ProfileField) => (fieldErrors[field] ? `error-${field}` : undefined);

  // En cada render y no al cargar el modulo, para que no quede viejo al cambiar de año.
  const currentYear = new Date().getFullYear();
  // Mas reciente primero: la mayoria de quienes completan esto arrancaron su carrera hace poco.
  const startYearOptions = Array.from({ length: currentYear - MIN_START_YEAR + 1 }, (_, i) => currentYear - i);

  return (
    <form
      ref={formRef}
      // Sin el aviso nativo del navegador (sale en su idioma y de a un campo): se valida acá, con un mensaje junto a cada campo.
      noValidate
      onChange={(e) => {
        const name = (e.target as unknown as { name?: string }).name as ProfileField | undefined;
        if (name) clearError(name);
      }}
      // La accion se llama a mano y no con `action={formAction}`: React 19 resetea el formulario al terminar una
      // accion de <form action>, y despues de un error del servidor se perdian el año y los radios.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const errors = validateProfileForm(
          {
            fullName: String(data.get("fullName") ?? ""),
            affiliation: String(data.get("affiliation") ?? ""),
            institution: String(data.get("institution") ?? ""),
            role: String(data.get("role") ?? ""),
            otherRole: String(data.get("otherRole") ?? ""),
            studentStatus: String(data.get("studentStatus") ?? ""),
            careers: data.getAll("careers").map(String),
            otherCareer: String(data.get("otherCareer") ?? ""),
            startYear: String(data.get("startYear") ?? ""),
            consent: data.get("consent") === "on",
          },
          currentYear,
        );
        focusAfterErrors.current = firstInvalidField(errors);
        setFieldErrors(errors);
        if (focusAfterErrors.current) return;
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-8 border border-border bg-card p-6 sm:p-10"
    >
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-2" data-field="fullName">
        <span className={labelClass}>Nombre y apellido</span>
        <input
          type="text"
          name="fullName"
          required
          autoComplete="name"
          maxLength={120}
          defaultValue={existing?.fullName ?? defaultName}
          aria-invalid={fieldErrors.fullName ? true : undefined}
          aria-describedby={describedBy("fullName")}
          className={cn(inputClass, fieldErrors.fullName && "border-crimson-text")}
        />
        <FieldError id="error-fullName" message={fieldErrors.fullName} />
      </label>

      <fieldset className="flex flex-col gap-2.5" data-field="affiliation" aria-describedby={describedBy("affiliation")}>
        <legend className={labelClass}>¿De dónde sos?</legend>
        <PillToggleGroup name="affiliation" value={affiliation} onChange={setAffiliation} options={AFFILIATION_OPTIONS} />
        <FieldError id="error-affiliation" message={fieldErrors.affiliation} />
      </fieldset>

      {needsInstitution(affiliation) && (
        <label className="flex flex-col gap-2" data-field="institution">
          <span className={labelClass}>{affiliation === "WORK" ? "Empresa o lugar de trabajo" : "Universidad"}</span>
          <input
            type="text"
            name="institution"
            required
            maxLength={120}
            defaultValue={existing?.institution ?? ""}
            aria-invalid={fieldErrors.institution ? true : undefined}
            aria-describedby={describedBy("institution")}
            className={cn(inputClass, fieldErrors.institution && "border-crimson-text")}
          />
          <FieldError id="error-institution" message={fieldErrors.institution} />
        </label>
      )}

      <fieldset className="flex flex-col gap-2.5" data-field="role" aria-describedby={describedBy("role")}>
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
        <FieldError id="error-role" message={fieldErrors.role} />
      </fieldset>

      {role === "OTHER" && (
        <label className="flex flex-col gap-2" data-field="otherRole">
          <span className={labelClass}>Especificá tu rol</span>
          <input
            type="text"
            name="otherRole"
            required
            defaultValue={existing?.otherRole ?? ""}
            aria-invalid={fieldErrors.otherRole ? true : undefined}
            aria-describedby={describedBy("otherRole")}
            className={cn(inputClass, fieldErrors.otherRole && "border-crimson-text")}
          />
          <FieldError id="error-otherRole" message={fieldErrors.otherRole} />
        </label>
      )}

      {role === "STUDENT" && (
        <>
          <fieldset className="flex flex-col gap-2.5" data-field="studentStatus" aria-describedby={describedBy("studentStatus")}>
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
            <FieldError id="error-studentStatus" message={fieldErrors.studentStatus} />
          </fieldset>

          {affiliation === "UDESA" && (
            <div className="flex flex-col gap-2" data-field="careers" tabIndex={-1} aria-describedby={describedBy("careers")}>
              <span className={labelClass}>Carrera(s)</span>
              <CareerSelect
                selected={careers}
                onChange={(next) => {
                  setCareers(next);
                  clearError("careers");
                }}
              />
              <FieldError id="error-careers" message={fieldErrors.careers} />
            </div>
          )}

          {affiliation === "UDESA" && careers.includes(OTHER_CAREER_SLUG) && (
            <label className="flex flex-col gap-2 border-l-2 border-crimson pl-4" data-field="otherCareer">
              <span className={cn(labelClass, "text-crimson-text")}>Contanos qué carrera es</span>
              <input
                type="text"
                name="otherCareer"
                required
                placeholder="Nombre de tu carrera"
                defaultValue={existing?.otherCareer ?? ""}
                aria-invalid={fieldErrors.otherCareer ? true : undefined}
                aria-describedby={describedBy("otherCareer")}
                className={cn(inputClass, fieldErrors.otherCareer && "border-crimson-text")}
              />
              <FieldError id="error-otherCareer" message={fieldErrors.otherCareer} />
            </label>
          )}

          {affiliation && affiliation !== "UDESA" && (
            <label className="flex flex-col gap-2" data-field="otherCareer">
              <span className={labelClass}>Carrera</span>
              <input
                type="text"
                name="otherCareer"
                required
                maxLength={120}
                placeholder="Nombre de tu carrera"
                defaultValue={existing?.otherCareer ?? ""}
                aria-invalid={fieldErrors.otherCareer ? true : undefined}
                aria-describedby={describedBy("otherCareer")}
                className={cn(inputClass, fieldErrors.otherCareer && "border-crimson-text")}
              />
              <FieldError id="error-otherCareer" message={fieldErrors.otherCareer} />
            </label>
          )}

          {studentStatus === "STUDYING" && (
            <label className="flex flex-col gap-2" data-field="startYear">
              <span className={labelClass}>Año de inicio</span>
              <select
                name="startYear"
                required
                defaultValue={existing?.startYear ?? ""}
                aria-invalid={fieldErrors.startYear ? true : undefined}
                aria-describedby={describedBy("startYear")}
                className={cn(inputClass, "w-40", fieldErrors.startYear && "border-crimson-text")}
              >
                <option value="" disabled>
                  Elegí un año
                </option>
                {startYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <FieldError id="error-startYear" message={fieldErrors.startYear} />
            </label>
          )}
        </>
      )}

      <div className="flex flex-col gap-2" data-field="consent">
        <label className="flex cursor-pointer items-start gap-3">
          {/* Casilla propia: la nativa se ve como un cuadrado blanco liso sobre el fondo oscuro. */}
          <input
            type="checkbox"
            name="consent"
            required
            defaultChecked={Boolean(existing?.consentAcceptedAt)}
            aria-invalid={fieldErrors.consent ? true : undefined}
            aria-describedby={describedBy("consent")}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border-[1.5px] border-border-strong/50 bg-card text-white transition-colors peer-checked:border-crimson peer-checked:bg-crimson peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-crimson-text [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
              fieldErrors.consent && "border-crimson-text",
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="font-body text-[.9rem] leading-[1.6] text-text2">
            Leí y acepto el{" "}
            <Link href="/privacidad" target="_blank" className="text-crimson-text underline underline-offset-2">
              aviso de privacidad
            </Link>
            .
          </span>
        </label>
        <FieldError id="error-consent" message={fieldErrors.consent} />
      </div>

      <div className="flex flex-col items-start gap-4 pt-1">
        {/* El error va arriba del botón y no al lado: en 375px lo apretaba y el botón se partía en dos líneas. */}
        {state.error && (
          <p role="alert" className="font-body text-sm text-crimson-text">
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
