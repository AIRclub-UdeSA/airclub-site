"use server";

import { redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { prisma } from "@/lib/prisma";
import { ALL_CAREER_SLUGS, MIN_START_YEAR, OTHER_CAREER_SLUG } from "@/lib/perfil/careers";
import { safeNext } from "@/lib/safe-next";

const VALID_CAREER_SLUGS = new Set<string>(ALL_CAREER_SLUGS);

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

  const role = String(formData.get("role") ?? "");
  if (role !== "STUDENT" && role !== "PROFESSOR" && role !== "OTHER") {
    return { error: "Elegí una opción: estudiante, profesor u otro." };
  }

  if (role === "OTHER") {
    const otherRole = String(formData.get("otherRole") ?? "").trim();
    if (!otherRole) return { error: "Contanos qué rol tenés." };

    await prisma.userProfile.upsert({
      where: { email },
      create: { email, role, otherRole },
      update: { role, otherRole, careers: [], otherCareer: null, startYear: null, studentStatus: null },
    });
    redirect(next);
  }

  if (role === "PROFESSOR") {
    await prisma.userProfile.upsert({
      where: { email },
      create: { email, role },
      update: { role, otherRole: null, careers: [], otherCareer: null, startYear: null, studentStatus: null },
    });
    redirect(next);
  }

  // role === "STUDENT"
  const studentStatus = String(formData.get("studentStatus") ?? "");
  if (studentStatus !== "STUDYING" && studentStatus !== "GRADUATED") {
    return { error: "Decinos si estás cursando actualmente o ya te recibiste." };
  }

  const careers = parseCareers(formData);
  if (careers.length === 0) return { error: "Elegí al menos una carrera." };

  let otherCareer: string | null = null;
  if (careers.includes(OTHER_CAREER_SLUG)) {
    otherCareer = String(formData.get("otherCareer") ?? "").trim();
    if (!otherCareer) return { error: "Contanos qué carrera estás cursando." };
  }

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
    create: { email, role, careers, otherCareer, startYear, studentStatus },
    update: { role, otherRole: null, careers, otherCareer, startYear, studentStatus },
  });
  redirect(next);
}
