"use server";

import { revalidatePath } from "next/cache";
import { prisma, Prisma } from "@/lib/prisma";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { removeStorageFiles, signUpload, type SignedUpload } from "@/lib/admin/storage";
import { isPendingUpload } from "@/lib/upload-rules";
import { normalizeUrl } from "@/lib/links";

const SECTION = "equipo";
const STORAGE_FOLDER = "equipo";

export type ActionState = { error: string | null };
export type TeamGroup = "FOUNDER" | "COLLABORATOR";

/** Lo que manda el panel al crear o editar una persona. `photo` ya viene subida (URL pública). */
export type MemberInput = {
  id?: string;
  name: string;
  group: TeamGroup;
  role: string;
  linkedin: string;
  github: string;
  photo: string;
};

function clean(value: string | undefined): string | null {
  return value?.trim() || null;
}

/** "Zoë Velazquez" → "zoe-velazquez". Solo se usa al crear: el slug no cambia aunque cambie el nombre. */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "persona";
  const taken = new Set((await prisma.teamMember.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map((m) => m.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// Los links se guardan con https:// para que /equipo no dependa de cómo los pegó cada uno.
function memberData(input: MemberInput) {
  const linkedin = clean(input.linkedin);
  const github = clean(input.github);
  return {
    name: input.name.trim(),
    group: input.group,
    role: clean(input.role),
    linkedin: linkedin && normalizeUrl(linkedin),
    github: github && normalizeUrl(github),
    linkedinPhoto: clean(input.photo),
  };
}

function validateMember(data: ReturnType<typeof memberData>): string | null {
  if (!data.name) return "Falta el nombre.";
  if (data.group !== "FOUNDER" && data.group !== "COLLABORATOR") return "Grupo inválido.";
  if (data.linkedin && !/linkedin\.com\//i.test(data.linkedin)) return "El link de LinkedIn no parece de LinkedIn (linkedin.com/in/…).";
  if (data.github && !/github\.com\/[^/?#]+/i.test(data.github)) return "El link de GitHub no parece de GitHub (github.com/usuario).";
  if (data.linkedinPhoto && isPendingUpload(data.linkedinPhoto)) return "La foto no se terminó de subir. Probá de nuevo.";
  return null;
}

type MemberRow = Awaited<ReturnType<typeof prisma.teamMember.findUniqueOrThrow>>;

function auditSnapshot(m: MemberRow): Prisma.InputJsonValue {
  return {
    slug: m.slug,
    name: m.name,
    group: m.group,
    role: m.role,
    linkedin: m.linkedin,
    linkedinPhoto: m.linkedinPhoto,
    photoUrl: m.photoUrl,
    github: m.github,
    order: m.order,
    active: m.active,
  };
}

function revalidateTeam() {
  revalidatePath("/admin/equipo");
  revalidatePath("/equipo");
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

async function nextOrder(tx: Prisma.TransactionClient, group: TeamGroup): Promise<number> {
  const last = await tx.teamMember.findFirst({ where: { group }, orderBy: { order: "desc" }, select: { order: true } });
  return (last?.order ?? -1) + 1;
}

export async function saveMember(input: MemberInput): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  const data = memberData(input);
  const error = validateMember(data);
  if (error) return { error };

  let replacedFiles: string[] = [];
  try {
    if (!input.id) {
      const slug = await uniqueSlug(data.name);
      await prisma.$transaction(async (tx) => {
        const created = await tx.teamMember.create({ data: { ...data, slug, order: await nextOrder(tx, data.group) } });
        await tx.auditLog.create({
          data: { adminUserId: actor.adminId, section: SECTION, entityId: created.id, action: "create", after: auditSnapshot(created) },
        });
      });
    } else {
      const id = input.id;
      await prisma.$transaction(async (tx) => {
        const before = await tx.teamMember.findUniqueOrThrow({ where: { id } });
        // Al cambiar de grupo, pasa al final de la lista nueva.
        const order = before.group === data.group ? before.order : await nextOrder(tx, data.group);
        const after = await tx.teamMember.update({ where: { id }, data: { ...data, order } });
        await tx.auditLog.create({
          data: { adminUserId: actor.adminId, section: SECTION, entityId: id, action: "update", before: auditSnapshot(before), after: auditSnapshot(after) },
        });
        if (before.linkedinPhoto && before.linkedinPhoto !== after.linkedinPhoto) replacedFiles = [before.linkedinPhoto];
      });
    }
  } catch (err) {
    return { error: errorMessage(err, "No se pudo guardar.") };
  }

  await removeUnusedTeamFiles(replacedFiles);
  revalidateTeam();
  return { error: null };
}

/** Cambia solo la foto (el ✎ sobre la tarjeta), sin tocar el resto de la ficha. */
export async function setMemberPhoto(id: string, photo: string): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  if (!photo || isPendingUpload(photo)) return { error: "La foto no se terminó de subir. Probá de nuevo." };

  let replaced: string | null = null;
  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.teamMember.findUniqueOrThrow({ where: { id } });
      await tx.teamMember.update({ where: { id }, data: { linkedinPhoto: photo } });
      await tx.auditLog.create({
        data: {
          adminUserId: actor.adminId,
          section: SECTION,
          entityId: id,
          action: "update",
          before: { linkedinPhoto: before.linkedinPhoto },
          after: { linkedinPhoto: photo },
        },
      });
      replaced = before.linkedinPhoto;
    });
  } catch (err) {
    return { error: errorMessage(err, "No se pudo cambiar la foto.") };
  }

  if (replaced && replaced !== photo) await removeUnusedTeamFiles([replaced]);
  revalidateTeam();
  return { error: null };
}

/** Ocultar en vez de borrar: la ficha queda (y vuelve con un click), pero deja de verse en /equipo. */
export async function setMemberActive(id: string, active: boolean): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.teamMember.findUniqueOrThrow({ where: { id } });
      // Al volver, pasa al final de su lista para no chocar con el orden que se armó mientras no estaba.
      const order = active && !before.active ? await nextOrder(tx, before.group) : before.order;
      await tx.teamMember.update({ where: { id }, data: { active, order } });
      await tx.auditLog.create({
        data: { adminUserId: actor.adminId, section: SECTION, entityId: id, action: "update", before: { active: before.active }, after: { active } },
      });
    });
  } catch (err) {
    return { error: errorMessage(err, "No se pudo actualizar.") };
  }

  revalidateTeam();
  return { error: null };
}

/** Mueve a la persona un lugar antes o después dentro de su lista (entre las visibles). */
export async function moveMember(id: string, direction: -1 | 1): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.teamMember.findUniqueOrThrow({ where: { id } });
      const list = await tx.teamMember.findMany({ where: { group: target.group, active: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
      const from = list.findIndex((m) => m.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= list.length) return;

      [list[from], list[to]] = [list[to], list[from]];
      // Se renumera toda la lista: así un orden con empates o huecos (ej. del seed) queda prolijo.
      for (const [i, m] of list.entries()) {
        if (m.order !== i) await tx.teamMember.update({ where: { id: m.id }, data: { order: i } });
      }
      await tx.auditLog.create({
        data: { adminUserId: actor.adminId, section: SECTION, entityId: id, action: "update", before: { order: from }, after: { order: to } },
      });
    });
  } catch (err) {
    return { error: errorMessage(err, "No se pudo mover.") };
  }

  revalidateTeam();
  return { error: null };
}

/** Borrar de verdad, solo para fichas ya ocultas (ej. alguien cargado por error). */
export async function deleteMember(id: string): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  let deletedFiles: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.teamMember.findUniqueOrThrow({ where: { id } });
      if (target.active) throw new Error("Primero ocultala: solo se pueden borrar fichas ocultas.");
      deletedFiles = [target.linkedinPhoto, target.photoUrl].filter((url): url is string => !!url);
      await tx.teamMember.delete({ where: { id } });
      await tx.auditLog.create({
        data: { adminUserId: actor.adminId, section: SECTION, entityId: id, action: "delete", before: auditSnapshot(target) },
      });
    });
  } catch (err) {
    return { error: errorMessage(err, "No se pudo borrar.") };
  }

  await removeUnusedTeamFiles(deletedFiles);
  revalidateTeam();
  return { error: null };
}

// --- Archivos en Storage -------------------------------------------------------------------
// La foto se sube directo del navegador al bucket (como en /admin/talks). Hay que limpiar la foto
// que se reemplaza o se borra, y la recién subida si el guardado falla.

async function removeUnusedTeamFiles(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    const used = await prisma.teamMember.findMany({
      where: { OR: [{ linkedinPhoto: { in: urls } }, { photoUrl: { in: urls } }] },
      select: { linkedinPhoto: true, photoUrl: true },
    });
    const stillUsed = new Set(used.flatMap((m) => [m.linkedinPhoto, m.photoUrl]));
    await removeStorageFiles(urls.filter((url) => !stillUsed.has(url)));
  } catch (err) {
    console.error("No se pudieron limpiar fotos del equipo:", err);
  }
}

/** Firma la URL para que el navegador suba la foto directo a Storage. */
export async function prepareTeamPhotoUpload(file: { type: string; size: number }): Promise<SignedUpload | { error: string }> {
  await requireSectionAccess(SECTION);
  if (!file.type.startsWith("image/")) return { error: "Acá va una foto (jpg, png o webp)." };
  return signUpload(file, STORAGE_FOLDER);
}

/** Borra una foto recién subida cuando el guardado falla (solo de la carpeta del equipo y si nadie la usa). */
export async function discardTeamUpload(url: string): Promise<void> {
  await requireSectionAccess(SECTION);
  if (url.includes(`/${STORAGE_FOLDER}/`)) await removeUnusedTeamFiles([url]);
}
