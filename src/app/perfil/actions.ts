"use server";

import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { prisma } from "@/lib/prisma";
import { ALL_CAREER_SLUGS, MIN_START_YEAR, OTHER_CAREER_SLUG } from "@/lib/perfil/careers";
import { safeNext } from "@/lib/safe-next";
import { signOut } from "@/auth";
import { AFFILIATION_LABELS, needsInstitution } from "@/lib/perfil/completeness";
import type { ProfileAffiliation } from "../../../generated/prisma/client";
import { revalidatePath } from "next/cache";

const VALID_CAREER_SLUGS = new Set<string>(ALL_CAREER_SLUGS);

const MAX_TEXT_LENGTH = 120;

function isAffiliation(value: string): value is ProfileAffiliation {
  return Object.hasOwn(AFFILIATION_LABELS, value);
}

export type ActionState = { error: string | null };

function parseCareers(formData: FormData): string[] {
  return formData
    .getAll("careers")
    .map((v) => String(v))
    .filter((slug) => VALID_CAREER_SLUGS.has(slug));
}

export async function saveProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = await getSessionEmail();
  if (!email) redirect("/");

  const next = safeNext(String(formData.get("next") ?? ""), "/perfil?guardado=1");

  const fullName = String(formData.get("fullName") ?? "").trim().replace(/\s+/g, " ");
  if (fullName.length < 2 || !fullName.includes(" ")) return { error: "Escribí tu nombre y apellido." };
  if (fullName.length > MAX_TEXT_LENGTH) return { error: "El nombre es demasiado largo." };

  const affiliation = String(formData.get("affiliation") ?? "");
  if (!isAffiliation(affiliation)) return { error: "Contanos de dónde sos." };

  let institution: string | null = null;
  if (needsInstitution(affiliation)) {
    institution = String(formData.get("institution") ?? "").trim();
    if (!institution) {
      return { error: affiliation === "WORK" ? "Contanos en qué empresa o lugar trabajás." : "Contanos de qué universidad sos." };
    }
    if (institution.length > MAX_TEXT_LENGTH) return { error: "El nombre de la institución es demasiado largo." };
  }

  if (formData.get("consent") !== "on") return { error: "Para guardar el perfil tenés que aceptar el aviso de privacidad." };
  // Si ya lo había aceptado se conserva la fecha original.
  const previous = await prisma.userProfile.findUnique({ where: { email }, select: { consentAcceptedAt: true } });
  const consentAcceptedAt = previous?.consentAcceptedAt ?? new Date();

  const common = { fullName, affiliation, institution, consentAcceptedAt };
  const blank = { otherRole: null, careers: [], otherCareer: null, startYear: null, studentStatus: null };

  const role = String(formData.get("role") ?? "");
  if (role !== "STUDENT" && role !== "PROFESSOR" && role !== "OTHER") {
    return { error: "Elegí una opción: estudiante, profesor u otro." };
  }

  if (role === "OTHER") {
    const otherRole = String(formData.get("otherRole") ?? "").trim();
    if (!otherRole) return { error: "Contanos qué rol tenés." };

    await prisma.userProfile.upsert({
      where: { email },
      create: { email, role, otherRole, ...common },
      update: { ...blank, role, otherRole, ...common },
    });
    redirect(next);
  }

  if (role === "PROFESSOR") {
    await prisma.userProfile.upsert({
      where: { email },
      create: { email, role, ...common },
      update: { ...blank, role, ...common },
    });
    redirect(next);
  }

  // role === "STUDENT"
  const studentStatus = String(formData.get("studentStatus") ?? "");
  if (studentStatus !== "STUDYING" && studentStatus !== "GRADUATED") {
    return { error: "Decinos si estás cursando actualmente o ya te recibiste." };
  }

  // De UdeSA: selector de carreras. De otro lado: la carrera va como texto libre, guardada como "otra".
  let careers: string[];
  let otherCareer: string | null = null;
  if (affiliation === "UDESA") {
    careers = parseCareers(formData);
    if (careers.length === 0) return { error: "Elegí al menos una carrera." };
    if (careers.includes(OTHER_CAREER_SLUG)) {
      otherCareer = String(formData.get("otherCareer") ?? "").trim();
      if (!otherCareer) return { error: "Contanos qué carrera estás cursando." };
    }
  } else {
    careers = [OTHER_CAREER_SLUG];
    otherCareer = String(formData.get("otherCareer") ?? "").trim();
    if (!otherCareer) return { error: "Contanos qué carrera estudiás." };
  }
  if (otherCareer && otherCareer.length > MAX_TEXT_LENGTH) return { error: "El nombre de la carrera es demasiado largo." };

  // Ya recibido/a: no hace falta el año de inicio.
  let startYear: number | null = null;
  if (studentStatus === "STUDYING") {
    const currentYear = new Date().getFullYear();
    startYear = Number(formData.get("startYear"));
    if (!Number.isInteger(startYear) || startYear < MIN_START_YEAR || startYear > currentYear) {
      return { error: `El año de inicio tiene que estar entre ${MIN_START_YEAR} y ${currentYear}.` };
    }
  }

  await prisma.userProfile.upsert({
    where: { email },
    create: { email, role, careers, otherCareer, startYear, studentStatus, ...common },
    update: { role, otherRole: null, careers, otherCareer, startYear, studentStatus, ...common },
  });
  redirect(next);
}

/**
 * La persona borra su propia cuenta del sitio: el perfil y todas sus inscripciones a charlas.
 * No hay AuditLog (el registro apunta a un AdminUser). Después cierra la sesión: la cuenta de
 * Google no se toca, así que si vuelve a entrar puede crear el perfil de nuevo.
 */
export async function deleteMyAccountAction(): Promise<void> {
  const email = await getSessionEmail();
  if (!email) redirect("/");

  await prisma.$transaction([
    prisma.talkRegistration.deleteMany({ where: { email } }),
    prisma.userProfile.deleteMany({ where: { email } }),
  ]);

  revalidatePath("/talks");
  revalidatePath("/admin/comunidad");
  revalidatePath("/admin/cuentas");
  await signOut({ redirectTo: "/" });
}
