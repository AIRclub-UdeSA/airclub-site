"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ALL_CAREER_SLUGS, MIN_START_YEAR, OTHER_CAREER_SLUG } from "@/lib/perfil/careers";

const VALID_CAREER_SLUGS = new Set<string>(ALL_CAREER_SLUGS);
const CURRENT_YEAR = new Date().getFullYear();

export type ActionState = { error: string | null };

function parseCareers(formData: FormData): string[] {
  return formData
    .getAll("careers")
    .map((v) => String(v))
    .filter((slug) => VALID_CAREER_SLUGS.has(slug));
}

export async function saveProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/");

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
    redirect("/perfil?guardado=1");
  }

  if (role === "PROFESSOR") {
    await prisma.userProfile.upsert({
      where: { email },
      create: { email, role },
      update: { role, otherRole: null, careers: [], otherCareer: null, startYear: null, studentStatus: null },
    });
    redirect("/perfil?guardado=1");
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
    startYear = Number(formData.get("startYear"));
    if (!Number.isInteger(startYear) || startYear < MIN_START_YEAR || startYear > CURRENT_YEAR) {
      return { error: `El año de inicio tiene que estar entre ${MIN_START_YEAR} y ${CURRENT_YEAR}.` };
    }
  }

  await prisma.userProfile.upsert({
    where: { email },
    create: { email, role, careers, otherCareer, startYear, studentStatus },
    update: { role, otherRole: null, careers, otherCareer, startYear, studentStatus },
  });
  redirect("/perfil?guardado=1");
}
