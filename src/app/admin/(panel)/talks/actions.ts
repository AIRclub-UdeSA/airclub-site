"use server";

import { revalidatePath } from "next/cache";
import { prisma, Prisma } from "@/lib/prisma";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { removeStorageFiles, signUpload, type SignedUpload } from "@/lib/admin/storage";
import { isPendingUpload } from "@/lib/upload-rules";
import type { MediaItem, SlideItem, LinkItem } from "./types";

const SECTION = "talks";
// Argentina no tiene horario de verano: offset fijo, a diferencia de zonas con DST.
const AR_OFFSET = "-03:00";

export type ActionState = { error: string | null };

function str(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function optStr(formData: FormData, name: string): string | null {
  return str(formData, name) || null;
}

function combineDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null;
  return new Date(`${dateStr}T${timeStr || "00:00"}:00${AR_OFFSET}`);
}

// El form pide un solo "día" (+ horas opcionales) para el caso común, y un "día de fin"
// aparte solo cuando la charla dura más de un día (ventana tipo "semana del 12 al 16").
function parseTalkDates(formData: FormData): { startsAt: Date | null; endsAt: Date | null } {
  const dateStr = str(formData, "date");
  const startTime = str(formData, "startTime");
  const endTime = str(formData, "endTime");
  const endDateStr = str(formData, "endDate");

  const startsAt = combineDateTime(dateStr, startTime);

  if (endDateStr) return { startsAt, endsAt: combineDateTime(endDateStr, endTime || "23:59") };
  if (dateStr && !startTime && !endTime) return { startsAt, endsAt: combineDateTime(dateStr, "23:59") };
  if (dateStr && endTime) return { startsAt, endsAt: combineDateTime(dateStr, endTime) };
  return { startsAt, endsAt: null };
}

function parseJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseMediaItems(raw: string) {
  return parseJsonArray(raw)
    .filter((it): it is MediaItem => {
      const item = it as Partial<MediaItem>;
      return (item.type === "IMAGE" || item.type === "VIDEO") && typeof item.src === "string" && item.src.trim() !== "";
    })
    .map((it, order) => ({
      type: it.type,
      src: it.src.trim(),
      poster: it.poster?.trim() || null,
      lightBg: Boolean(it.lightBg),
      objectFit: it.objectFit === "contain" ? "contain" : null,
      order,
    }));
}

// La miniatura de un video en /talks es su poster (next/image con src vacío rompe la página).
function validateMedia(media: ReturnType<typeof parseMediaItems>): string | null {
  if (media.some((m) => m.type === "VIDEO" && !m.poster)) return "Cada video necesita un poster (la miniatura que se ve en /talks).";
  return null;
}

// Los archivos elegidos en el form se suben antes de guardar y el marcador se reemplaza por la URL:
// si llega uno sin reemplazar, algo falló en el cliente y no hay que guardarlo en la base.
function validateNoPendingUploads(data: { speakerAvatar: string | null }, media: ReturnType<typeof parseMediaItems>): string | null {
  const values = [data.speakerAvatar ?? "", ...media.flatMap((m) => [m.src, m.poster ?? ""])];
  if (values.some(isPendingUpload)) return "Hay archivos que no se terminaron de subir. Probá guardar de nuevo.";
  return null;
}

function parseSlideItems(raw: string) {
  return parseJsonArray(raw)
    .filter((it): it is SlideItem => {
      const item = it as Partial<SlideItem>;
      return typeof item.title === "string" && item.title.trim() !== "" && typeof item.embedUrl === "string" && typeof item.openUrl === "string";
    })
    .map((it, order) => ({ title: it.title.trim(), embedUrl: it.embedUrl.trim(), openUrl: it.openUrl.trim(), order }));
}

function parseLinkItems(raw: string) {
  return parseJsonArray(raw)
    .filter((it): it is LinkItem => {
      const item = it as Partial<LinkItem>;
      return typeof item.label === "string" && item.label.trim() !== "" && typeof item.url === "string" && item.url.trim() !== "";
    })
    .map((it, order) => ({ label: it.label.trim(), url: it.url.trim(), order }));
}

function talkScalarData(formData: FormData) {
  const { startsAt, endsAt } = parseTalkDates(formData);
  return {
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    subtitle: str(formData, "subtitle"),
    abstract: str(formData, "abstract"),
    topic: optStr(formData, "topic"),
    location: optStr(formData, "location"),
    speakerName: optStr(formData, "speakerName"),
    speakerRole: optStr(formData, "speakerRole"),
    speakerAffiliation: optStr(formData, "speakerAffiliation"),
    speakerAvatar: optStr(formData, "speakerAvatar"),
    speakerLinkedin: optStr(formData, "speakerLinkedin"),
    speakerBio: optStr(formData, "speakerBio"),
    startsAt,
    endsAt,
    dateLabel: optStr(formData, "dateLabel"),
    recordingUrl: optStr(formData, "recordingUrl"),
    ctaLabel: optStr(formData, "ctaLabel"),
    ctaUrl: optStr(formData, "ctaUrl"),
    confirmed: formData.get("confirmed") === "on",
    status: (formData.get("status") === "DRAFT" ? "DRAFT" : "PUBLISHED") as "DRAFT" | "PUBLISHED",
  };
}

function validateTalkData(data: ReturnType<typeof talkScalarData>): string | null {
  if (!data.slug) return "El slug es obligatorio.";
  if (!/^[a-z0-9-]+$/.test(data.slug)) return "El slug solo puede tener minúsculas, números y guiones.";
  if (!data.title) return "El título es obligatorio.";
  if (!data.subtitle) return "El subtítulo es obligatorio.";
  if (!data.abstract) return "El resumen es obligatorio.";
  if (Boolean(data.ctaLabel) !== Boolean(data.ctaUrl)) return "El botón principal necesita label y URL, o ninguno de los dos.";
  if (data.startsAt && data.endsAt && data.endsAt < data.startsAt) return "La fecha de fin no puede ser anterior a la de inicio.";
  return null;
}

// Serializable a Prisma.InputJsonValue: sin Date crudo (AuditLog.before/after son columnas Json).
function talkAuditSnapshot(talk: {
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  topic: string | null;
  location: string | null;
  speakerName: string | null;
  speakerRole: string | null;
  speakerAffiliation: string | null;
  speakerAvatar: string | null;
  speakerLinkedin: string | null;
  speakerBio?: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  dateLabel: string | null;
  recordingUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  confirmed: boolean;
  status: string;
  order: number;
  media: { type: string; src: string; poster: string | null; lightBg?: boolean; objectFit?: string | null; order: number }[];
  slides: { title: string; embedUrl: string; openUrl: string; order: number }[];
  links: { label: string; url: string; order: number }[];
}): Prisma.InputJsonValue {
  return {
    ...talk,
    startsAt: talk.startsAt?.toISOString() ?? null,
    endsAt: talk.endsAt?.toISOString() ?? null,
  };
}

const TALK_RELATIONS = { media: true, slides: true, links: true } as const;

export async function createTalk(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  const data = talkScalarData(formData);
  const error = validateTalkData(data);
  if (error) return { error };

  const media = parseMediaItems(str(formData, "media") || "[]");
  const mediaError = validateMedia(media) ?? validateNoPendingUploads(data, media);
  if (mediaError) return { error: mediaError };
  const slides = parseSlideItems(str(formData, "slides") || "[]");
  const links = parseLinkItems(str(formData, "links") || "[]");

  try {
    await prisma.$transaction(async (tx) => {
      const last = await tx.talk.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
      const created = await tx.talk.create({
        data: {
          ...data,
          order: (last?.order ?? -1) + 1,
          media: { createMany: { data: media } },
          slides: { createMany: { data: slides } },
          links: { createMany: { data: links } },
        },
        include: TALK_RELATIONS,
      });

      await tx.auditLog.create({
        data: { adminUserId: actor.adminId, section: SECTION, entityId: created.id, action: "create", after: talkAuditSnapshot(created) },
      });
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Ya existe una charla con ese slug." };
    }
    return { error: err instanceof Error ? err.message : "No se pudo crear la charla." };
  }

  revalidatePath("/admin/talks");
  revalidatePath("/talks");
  revalidatePath("/eventos");
  return { error: null };
}

export async function updateTalk(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  const id = str(formData, "id");
  if (!id) return { error: "Falta el id de la charla." };

  const data = talkScalarData(formData);
  const error = validateTalkData(data);
  if (error) return { error };

  const media = parseMediaItems(str(formData, "media") || "[]");
  const mediaError = validateMedia(media) ?? validateNoPendingUploads(data, media);
  if (mediaError) return { error: mediaError };
  const slides = parseSlideItems(str(formData, "slides") || "[]");
  const links = parseLinkItems(str(formData, "links") || "[]");

  let replacedFiles: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.talk.findUniqueOrThrow({ where: { id }, include: TALK_RELATIONS });

      const after = await tx.talk.update({
        where: { id },
        data: {
          ...data,
          media: { deleteMany: {}, createMany: { data: media } },
          slides: { deleteMany: {}, createMany: { data: slides } },
          links: { deleteMany: {}, createMany: { data: links } },
        },
        include: TALK_RELATIONS,
      });

      await tx.auditLog.create({
        data: {
          adminUserId: actor.adminId,
          section: SECTION,
          entityId: id,
          action: "update",
          before: talkAuditSnapshot(before),
          after: talkAuditSnapshot(after),
        },
      });

      const kept = new Set(talkFileUrls(after));
      replacedFiles = talkFileUrls(before).filter((url) => !kept.has(url));
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Ya existe otra charla con ese slug." };
    }
    return { error: err instanceof Error ? err.message : "No se pudo guardar la charla." };
  }

  await removeUnusedTalkFiles(replacedFiles);
  revalidatePath("/admin/talks");
  revalidatePath("/talks");
  revalidatePath("/eventos");
  return { error: null };
}

export async function deleteTalk(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  const id = str(formData, "id");

  let deletedFiles: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.talk.findUniqueOrThrow({ where: { id }, include: TALK_RELATIONS });
      deletedFiles = talkFileUrls(target);
      // No hay FK de AuditLog a Talk (entityId es un id suelto): el historial sobrevive al borrado.
      await tx.talk.delete({ where: { id } });
      await tx.auditLog.create({
        data: { adminUserId: actor.adminId, section: SECTION, entityId: id, action: "delete", before: talkAuditSnapshot(target) },
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo borrar la charla." };
  }

  await removeUnusedTalkFiles(deletedFiles);
  revalidatePath("/admin/talks");
  revalidatePath("/talks");
  revalidatePath("/eventos");
  return { error: null };
}

// --- Archivos en Storage -------------------------------------------------------------------
// Los archivos se suben recién al guardar (ver TalkForm), así que elegir uno y cancelar no deja
// nada en el bucket. Lo que sí hay que limpiar: lo que deja de usarse al editar o borrar una
// charla, y lo recién subido si el guardado falla.

const STORAGE_FOLDER = "talks";
const MAX_UPLOADS_PER_SAVE = 30;

// Todos los campos de Talk/TalkMedia que pueden apuntar a un archivo del bucket. Si se agrega
// otro, sumarlo acá y en referencedTalkFileUrls, o su archivo se borraría estando en uso.
function talkFileUrls(talk: { speakerAvatar: string | null; media: { src: string; poster: string | null }[] }): string[] {
  const urls = [talk.speakerAvatar, ...talk.media.flatMap((m) => [m.src, m.poster])];
  return urls.filter((url): url is string => !!url);
}

async function referencedTalkFileUrls(urls: string[]): Promise<Set<string>> {
  const [talks, media] = await Promise.all([
    prisma.talk.findMany({ where: { speakerAvatar: { in: urls } }, select: { speakerAvatar: true } }),
    prisma.talkMedia.findMany({ where: { OR: [{ src: { in: urls } }, { poster: { in: urls } }] }, select: { src: true, poster: true } }),
  ]);
  return new Set([...talks.map((t) => t.speakerAvatar), ...media.flatMap((m) => [m.src, m.poster])].filter((url): url is string => !!url));
}

/** Borra del bucket los archivos que ya no usa ninguna charla (la misma foto puede estar en dos). */
async function removeUnusedTalkFiles(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    const stillUsed = await referencedTalkFileUrls(urls);
    await removeStorageFiles(urls.filter((url) => !stillUsed.has(url)));
  } catch (err) {
    console.error("No se pudieron limpiar archivos de charlas:", err);
  }
}

/** Chequea los datos del form antes de subir archivos, para no subir 50MB y recién ahí enterarse
 * de que faltaba el título o el slug ya existe. */
export async function validateTalkForm(formData: FormData): Promise<ActionState> {
  await requireSectionAccess(SECTION);
  const data = talkScalarData(formData);
  const error = validateTalkData(data) ?? validateMedia(parseMediaItems(str(formData, "media") || "[]"));
  if (error) return { error };

  const id = str(formData, "id");
  const sameSlug = await prisma.talk.findFirst({ where: { slug: data.slug, ...(id && { NOT: { id } }) }, select: { id: true } });
  if (sameSlug) return { error: id ? "Ya existe otra charla con ese slug." : "Ya existe una charla con ese slug." };
  return { error: null };
}

/** Firma una URL de subida directa a Storage por cada archivo (el navegador sube sin pasar por Vercel). */
export async function prepareTalkUploads(files: { type: string; size: number }[]): Promise<{ uploads: SignedUpload[] } | { error: string }> {
  await requireSectionAccess(SECTION);
  if (files.length > MAX_UPLOADS_PER_SAVE) return { error: `Máximo ${MAX_UPLOADS_PER_SAVE} archivos por guardado.` };

  const uploads: SignedUpload[] = [];
  for (const file of files) {
    const signed = await signUpload(file, STORAGE_FOLDER);
    if ("error" in signed) return signed;
    uploads.push(signed);
  }
  return { uploads };
}

/** Borra lo recién subido cuando el guardado falla. Solo toca archivos de la carpeta de charlas que
 * ninguna charla use, así que no sirve para borrar nada en uso aunque se la llame con otras URLs. */
export async function discardTalkUploads(urls: string[]): Promise<void> {
  await requireSectionAccess(SECTION);
  await removeUnusedTalkFiles(urls.filter((url) => url.includes(`/${STORAGE_FOLDER}/`)));
}

export async function toggleConfirmed(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionAccess(SECTION);
  const id = str(formData, "id");
  const confirmed = formData.get("confirmed") === "true";

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.talk.findUniqueOrThrow({ where: { id } });
      const after = await tx.talk.update({ where: { id }, data: { confirmed } });
      await tx.auditLog.create({
        data: {
          adminUserId: actor.adminId,
          section: SECTION,
          entityId: id,
          action: "update",
          before: { confirmed: before.confirmed },
          after: { confirmed: after.confirmed },
        },
      });
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo actualizar." };
  }

  revalidatePath("/admin/talks");
  revalidatePath("/talks");
  revalidatePath("/eventos");
  return { error: null };
}
