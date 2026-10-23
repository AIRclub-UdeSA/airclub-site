"use server";

import { revalidatePath } from "next/cache";
import { prisma, Prisma } from "@/lib/prisma";
import { requireSectionEdit, type AdminSession } from "@/lib/admin/permissions";
import { removeStorageFiles, signUpload, type SignedUpload } from "@/lib/admin/storage";
import { isPendingUpload } from "@/lib/upload-rules";
import { AUDIENCE_REQUIRED_ERROR, parseAudience } from "@/lib/udesa";
import { isSiteImageUrl, storagePublicPrefix } from "@/lib/storage-url";
import type { LinkItem, MediaItem, SlideItem } from "../talks/types";
import { guideBlockImageUrls, parseGuideBlocks, storedGuideBlocks, type GuideBlock } from "@/lib/guide-blocks";

const SECTION = "workshops";
// Argentina no tiene horario de verano: offset fijo, como en /admin/talks.
const AR_OFFSET = "-03:00";
const KEY_PATTERN = /^[a-z0-9-]+$/;

export type ActionState = { error: string | null };
export type WorkshopEntity = "track" | "guide" | "session";

/* ---------- Lectura del form ---------- */

function str(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function optStr(formData: FormData, name: string): string | null {
  return str(formData, name) || null;
}

function status(formData: FormData): "DRAFT" | "PUBLISHED" {
  return formData.get("status") === "DRAFT" ? "DRAFT" : "PUBLISHED";
}

function parseJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function combineDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null;
  return new Date(`${dateStr}T${timeStr || "00:00"}:00${AR_OFFSET}`);
}

// Igual que una charla: un día y horas opcionales; sin horas, el taller ocupa todo el día.
function parseDates(formData: FormData): { startsAt: Date | null; endsAt: Date | null } {
  const dateStr = str(formData, "date");
  const startTime = str(formData, "startTime");
  const endTime = str(formData, "endTime");
  const startsAt = combineDateTime(dateStr, startTime);
  if (dateStr && endTime) return { startsAt, endsAt: combineDateTime(dateStr, endTime) };
  if (dateStr && !startTime) return { startsAt, endsAt: combineDateTime(dateStr, "23:59") };
  return { startsAt, endsAt: null };
}

function parseMedia(raw: string) {
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

function parseSlides(raw: string) {
  return parseJsonArray(raw)
    .filter((it): it is SlideItem => {
      const item = it as Partial<SlideItem>;
      return typeof item.title === "string" && item.title.trim() !== "" && typeof item.embedUrl === "string" && typeof item.openUrl === "string";
    })
    .map((it, order) => ({ title: it.title.trim(), embedUrl: it.embedUrl.trim(), openUrl: it.openUrl.trim(), order }));
}

function parseLinks(raw: string) {
  return parseJsonArray(raw)
    .filter((it): it is LinkItem => {
      const item = it as Partial<LinkItem>;
      return typeof item.label === "string" && item.label.trim() !== "" && typeof item.url === "string" && item.url.trim() !== "";
    })
    .map((it, order) => ({ label: it.label.trim(), url: it.url.trim(), order }));
}

function trackData(formData: FormData) {
  return {
    key: str(formData, "key"),
    title: str(formData, "title"),
    label: optStr(formData, "label"),
    summary: str(formData, "summary"),
    setupUrl: optStr(formData, "setupUrl"),
    repoUrl: optStr(formData, "repoUrl"),
    status: status(formData),
  };
}

function guideData(formData: FormData) {
  return {
    trackId: str(formData, "trackId"),
    slug: str(formData, "slug"),
    week: str(formData, "week"),
    title: str(formData, "title"),
    summary: str(formData, "summary"),
    outcome: str(formData, "outcome"),
    minutesMin: Number(str(formData, "minutesMin")),
    minutesMax: Number(str(formData, "minutesMax")),
    level: (["INICIAL", "INTERMEDIO", "AVANZADO"].includes(str(formData, "level")) ? str(formData, "level") : "INICIAL") as
      | "INICIAL"
      | "INTERMEDIO"
      | "AVANZADO",
    ros2Package: optStr(formData, "ros2Package"),
    requires: str(formData, "requires")
      .split(/[\s,]+/)
      .filter(Boolean),
    guideUrl: optStr(formData, "guideUrl"),
    codeUrl: optStr(formData, "codeUrl"),
    status: status(formData),
  };
}

/** Los bloques del contenido propio (#69), del JSON del editor de bloques. */
function guideContent(formData: FormData): { blocks: GuideBlock[] } | { error: string } {
  const raw = str(formData, "content");
  if (!raw) return { blocks: [] };
  try {
    return parseGuideBlocks(JSON.parse(raw));
  } catch {
    return { error: "El contenido de la guía no tiene un formato válido." };
  }
}

function sessionData(formData: FormData) {
  return {
    trackId: str(formData, "trackId"),
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    summary: str(formData, "summary"),
    description: optStr(formData, "description"),
    ...parseDates(formData),
    dateLabel: optStr(formData, "dateLabel"),
    location: optStr(formData, "location"),
    instructor: optStr(formData, "instructor"),
    recordingUrl: optStr(formData, "recordingUrl"),
    registrationOpen: formData.get("registrationOpen") === "on",
    capacity: optStr(formData, "capacity") === null ? null : Number(str(formData, "capacity")),
    audience: parseAudience(formData.get("audience")),
    status: status(formData),
  };
}

/* ---------- Validación ---------- */

function validateTrack(d: ReturnType<typeof trackData>): string | null {
  if (!d.key) return "La clave (lo que va en la URL) es obligatoria.";
  if (!KEY_PATTERN.test(d.key)) return "La clave solo puede tener minúsculas, números y guiones.";
  if (d.key === "otros") return "\"otros\" está reservada para los talleres sueltos: elegí otra clave.";
  if (!d.title) return "El título es obligatorio.";
  if (!d.summary) return "El resumen es obligatorio.";
  return null;
}

function validateGuide(d: ReturnType<typeof guideData>, blocks: GuideBlock[]): string | null {
  if (!d.trackId) return "Falta el workshop.";
  if (!d.slug || !KEY_PATTERN.test(d.slug)) return "El slug es obligatorio y solo puede tener minúsculas, números y guiones.";
  if (!/^\d{2}$/.test(d.week)) return "La semana va con dos cifras (01, 02…).";
  if (!d.title) return "El título es obligatorio.";
  if (!d.summary) return "El resumen es obligatorio.";
  if (!d.outcome) return "Falta qué se llevan al terminar.";
  if (!Number.isInteger(d.minutesMin) || !Number.isInteger(d.minutesMax) || d.minutesMin < 1 || d.minutesMax < d.minutesMin) {
    return "La duración son dos números enteros de minutos, y el máximo no puede ser menor que el mínimo.";
  }
  if (d.requires.some((w) => !/^\d{2}$/.test(w))) return "\"Requiere\" son semanas de dos cifras separadas por coma (01, 02).";
  if (!d.guideUrl && blocks.length === 0) return "La guía necesita contenido propio, un link a la guía en otro sitio, o las dos cosas.";
  // next/image solo optimiza nuestro bucket y public/ (next.config.ts). GuideContent muestra sin optimizar una imagen de
  // otro sitio que llegue por fuera del panel, pero acá no se acepta: dependería de un host ajeno que puede borrarla.
  const prefix = storagePublicPrefix(process.env.SUPABASE_URL);
  if (guideBlockImageUrls(blocks).some((src) => !isPendingUpload(src) && !isSiteImageUrl(src, prefix))) {
    return "Hay una imagen con un link de otro sitio. Descargala y elegila desde tu compu, así queda guardada en el sitio.";
  }
  return null;
}

function validateSession(d: ReturnType<typeof sessionData>, media: ReturnType<typeof parseMedia>): string | null {
  if (!d.trackId) return "Falta el workshop.";
  if (!d.slug || !KEY_PATTERN.test(d.slug)) return "El slug es obligatorio y solo puede tener minúsculas, números y guiones.";
  if (!d.title) return "El título es obligatorio.";
  if (!d.summary) return "El resumen es obligatorio.";
  if (d.startsAt && d.endsAt && d.endsAt < d.startsAt) return "La hora de fin no puede ser anterior a la de inicio.";
  if (d.registrationOpen && !d.startsAt) return "Para abrir la inscripción, el taller necesita fecha.";
  if (d.capacity !== null && (!Number.isInteger(d.capacity) || d.capacity < 1)) {
    return "El cupo tiene que ser un número entero mayor a 0, o quedar vacío (sin límite).";
  }
  if (media.some((m) => m.type === "VIDEO" && !m.poster)) return "Cada video necesita un poster (la miniatura).";
  // Los archivos elegidos se suben antes de guardar: si llega un marcador sin reemplazar, algo falló en el cliente.
  if (media.some((m) => isPendingUpload(m.src) || isPendingUpload(m.poster ?? ""))) {
    return "Hay archivos que no se terminaron de subir. Probá guardar de nuevo.";
  }
  return null;
}

/** El slug de una guía o un taller es con lo que se guarda quién lo hizo: no puede repetirse entre los dos. */
async function slugTaken(slug: string, self: { entity: WorkshopEntity; id?: string }): Promise<boolean> {
  const [guide, session] = await Promise.all([
    prisma.workshopGuide.findFirst({ where: { slug, ...(self.entity === "guide" && self.id && { NOT: { id: self.id } }) } }),
    prisma.workshopSession.findFirst({ where: { slug, ...(self.entity === "session" && self.id && { NOT: { id: self.id } }) } }),
  ]);
  return Boolean(guide || session);
}

/* ---------- Auditoría y revalidación ---------- */

// Serializable a Prisma.InputJsonValue: sin Date crudo (AuditLog.before/after son columnas Json).
function snapshot(row: object): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(row));
}

async function audit(
  tx: Prisma.TransactionClient,
  actor: AdminSession,
  entityId: string,
  action: string,
  before?: object | null,
  after?: object | null,
) {
  await tx.auditLog.create({
    data: {
      adminUserId: actor.adminId,
      section: SECTION,
      entityId,
      action,
      before: before ? snapshot(before) : undefined,
      after: after ? snapshot(after) : undefined,
    },
  });
}

function revalidateWorkshops() {
  revalidatePath("/admin/workshops");
  revalidatePath("/workshops", "layout"); // la página general, la de cada workshop y la de cada taller
  revalidatePath("/perfil/aprendizaje");
  revalidatePath("/sitemap.xml");
}

function failure(err: unknown, fallback: string): ActionState {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return { error: "Ya existe otro con esa clave o ese slug." };
  }
  return { error: err instanceof Error ? err.message : fallback };
}

/* ---------- Workshops ---------- */

export async function saveTrack(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionEdit(SECTION);
  const id = str(formData, "id");
  const data = trackData(formData);
  const error = validateTrack(data);
  if (error) return { error };

  try {
    await prisma.$transaction(async (tx) => {
      if (id) {
        const before = await tx.workshopTrack.findUniqueOrThrow({ where: { id } });
        // La clave va en la URL: una vez creada no cambia (el form tampoco la deja editar).
        const after = await tx.workshopTrack.update({ where: { id }, data: { ...data, key: before.key } });
        await audit(tx, actor, id, "update", before, after);
      } else {
        const last = await tx.workshopTrack.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
        const created = await tx.workshopTrack.create({ data: { ...data, order: (last?.order ?? -1) + 1 } });
        await audit(tx, actor, created.id, "create", null, created);
      }
    });
  } catch (err) {
    return failure(err, "No se pudo guardar el workshop.");
  }

  revalidateWorkshops();
  return { error: null };
}

/* ---------- Guías ---------- */

export async function saveGuide(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionEdit(SECTION);
  const id = str(formData, "id");
  const data = guideData(formData);
  const content = guideContent(formData);
  if ("error" in content) return { error: content.error };
  const error = validateGuide(data, content.blocks);
  if (error) return { error };
  if (guideBlockImageUrls(content.blocks).some(isPendingUpload)) {
    return { error: "Hay imágenes que no se terminaron de subir. Probá guardar de nuevo." };
  }
  // Sin bloques se guarda null, no una lista vacía: la guía vive solo en otro sitio.
  const fields = { ...data, content: content.blocks.length ? (content.blocks as Prisma.InputJsonValue) : Prisma.DbNull };

  let replacedFiles: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      if (id) {
        const before = await tx.workshopGuide.findUniqueOrThrow({ where: { id } });
        // El slug es con lo que se guarda quién la hizo: no cambia.
        const after = await tx.workshopGuide.update({ where: { id }, data: { ...fields, slug: before.slug } });
        await audit(tx, actor, id, "update", before, after);
        const kept = new Set(guideFileUrls(after));
        replacedFiles = guideFileUrls(before).filter((url) => !kept.has(url));
      } else {
        if (await slugTaken(data.slug, { entity: "guide" })) throw new Error("Ya hay una guía o un taller con ese slug.");
        const last = await tx.workshopGuide.findFirst({ where: { trackId: data.trackId }, orderBy: { order: "desc" }, select: { order: true } });
        const created = await tx.workshopGuide.create({ data: { ...fields, order: (last?.order ?? -1) + 1 } });
        await audit(tx, actor, created.id, "create", null, created);
      }
    });
  } catch (err) {
    return failure(err, "No se pudo guardar la guía.");
  }

  await removeUnusedWorkshopFiles(replacedFiles);
  revalidateWorkshops();
  return { error: null };
}

/** Chequea los datos de la guía antes de subir las imágenes de sus bloques, como validateSessionForm. */
export async function validateGuideForm(formData: FormData): Promise<ActionState> {
  await requireSectionEdit(SECTION);
  const data = guideData(formData);
  const content = guideContent(formData);
  if ("error" in content) return { error: content.error };
  const error = validateGuide(data, content.blocks);
  if (error) return { error };
  const id = str(formData, "id");
  if (!id && (await slugTaken(data.slug, { entity: "guide" }))) return { error: "Ya hay una guía o un taller con ese slug." };
  return { error: null };
}

/* ---------- Talleres presenciales ---------- */

const SESSION_RELATIONS = { media: true, slides: true, links: true } as const;

export async function saveSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionEdit(SECTION);
  const id = str(formData, "id");
  const data = sessionData(formData);
  const media = parseMedia(str(formData, "media") || "[]");
  const slides = parseSlides(str(formData, "slides") || "[]");
  const links = parseLinks(str(formData, "links") || "[]");
  const error = validateSession(data, media);
  if (error) return { error };
  const audience = data.audience;
  if (!audience) return { error: AUDIENCE_REQUIRED_ERROR };

  let replacedFiles: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      if (id) {
        const before = await tx.workshopSession.findUniqueOrThrow({ where: { id }, include: SESSION_RELATIONS });
        const after = await tx.workshopSession.update({
          where: { id },
          data: {
            ...data,
            audience,
            slug: before.slug, // como en las guías: no cambia
            media: { deleteMany: {}, createMany: { data: media } },
            slides: { deleteMany: {}, createMany: { data: slides } },
            links: { deleteMany: {}, createMany: { data: links } },
          },
          include: SESSION_RELATIONS,
        });
        await audit(tx, actor, id, "update", before, after);
        const kept = new Set(sessionFileUrls(after));
        replacedFiles = sessionFileUrls(before).filter((url) => !kept.has(url));
      } else {
        if (await slugTaken(data.slug, { entity: "session" })) throw new Error("Ya hay una guía o un taller con ese slug.");
        const last = await tx.workshopSession.findFirst({ where: { trackId: data.trackId }, orderBy: { order: "desc" }, select: { order: true } });
        const created = await tx.workshopSession.create({
          data: {
            ...data,
            audience,
            order: (last?.order ?? -1) + 1,
            media: { createMany: { data: media } },
            slides: { createMany: { data: slides } },
            links: { createMany: { data: links } },
          },
          include: SESSION_RELATIONS,
        });
        await audit(tx, actor, created.id, "create", null, created);
      }
    });
  } catch (err) {
    return failure(err, "No se pudo guardar el taller.");
  }

  await removeUnusedWorkshopFiles(replacedFiles);
  revalidateWorkshops();
  return { error: null };
}

/* ---------- Borrar y ordenar (los tres) ---------- */

export async function deleteWorkshopEntity(entity: WorkshopEntity, id: string): Promise<ActionState> {
  const actor = await requireSectionEdit(SECTION);

  let deletedFiles: string[] = [];
  try {
    await prisma.$transaction(async (tx) => {
      // No hay FK de AuditLog a estas tablas (entityId es un id suelto): el historial sobrevive al borrado.
      if (entity === "track") {
        const target = await tx.workshopTrack.findUniqueOrThrow({
          where: { id },
          include: { guides: true, sessions: { include: SESSION_RELATIONS } },
        });
        deletedFiles = [...target.sessions.flatMap(sessionFileUrls), ...target.guides.flatMap(guideFileUrls)];
        await tx.workshopTrack.delete({ where: { id } }); // borra en cascada sus guías y talleres
        await audit(tx, actor, id, "delete", target);
      } else if (entity === "guide") {
        const target = await tx.workshopGuide.findUniqueOrThrow({ where: { id } });
        deletedFiles = guideFileUrls(target);
        await tx.workshopGuide.delete({ where: { id } });
        await audit(tx, actor, id, "delete", target);
      } else {
        const target = await tx.workshopSession.findUniqueOrThrow({ where: { id }, include: SESSION_RELATIONS });
        deletedFiles = sessionFileUrls(target);
        await tx.workshopSession.delete({ where: { id } });
        await audit(tx, actor, id, "delete", target);
      }
    });
  } catch (err) {
    return failure(err, "No se pudo borrar.");
  }

  await removeUnusedWorkshopFiles(deletedFiles);
  revalidateWorkshops();
  return { error: null };
}

/** Sube o baja un workshop (el orden de las cajas), o una guía o un taller dentro de su workshop. */
export async function moveWorkshopEntity(entity: WorkshopEntity, id: string, direction: -1 | 1): Promise<ActionState> {
  const actor = await requireSectionEdit(SECTION);

  try {
    await prisma.$transaction(async (tx) => {
      const rows =
        entity === "track"
          ? await tx.workshopTrack.findMany({ orderBy: { order: "asc" }, select: { id: true } })
          : entity === "guide"
            ? await tx.workshopGuide.findMany({
                where: { trackId: (await tx.workshopGuide.findUniqueOrThrow({ where: { id } })).trackId },
                orderBy: { order: "asc" },
                select: { id: true },
              })
            : await tx.workshopSession.findMany({
                where: { trackId: (await tx.workshopSession.findUniqueOrThrow({ where: { id } })).trackId },
                orderBy: { order: "asc" },
                select: { id: true },
              });

      const ids = rows.map((r) => r.id);
      const from = ids.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= ids.length) return;
      [ids[from], ids[to]] = [ids[to], ids[from]];

      // Se renumera todo (0, 1, 2…): así no importa si había órdenes repetidos.
      for (const [order, rowId] of ids.entries()) {
        if (entity === "track") await tx.workshopTrack.update({ where: { id: rowId }, data: { order } });
        else if (entity === "guide") await tx.workshopGuide.update({ where: { id: rowId }, data: { order } });
        else await tx.workshopSession.update({ where: { id: rowId }, data: { order } });
      }
      await audit(tx, actor, id, "move", { position: from }, { position: to });
    });
  } catch (err) {
    return failure(err, "No se pudo cambiar el orden.");
  }

  revalidateWorkshops();
  return { error: null };
}

/* ---------- Archivos en Storage (fotos y videos de los talleres, imágenes de las guías) ---------- */
// Mismo esquema que /admin/talks: los archivos se suben recién al guardar, y se borra lo que deja de usarse.

const STORAGE_FOLDER = "workshops";
const MAX_UPLOADS_PER_SAVE = 30;

function sessionFileUrls(session: { media: { src: string; poster: string | null }[] }): string[] {
  return session.media.flatMap((m) => [m.src, m.poster]).filter((url): url is string => !!url);
}

function guideFileUrls(guide: { content: unknown }): string[] {
  return guideBlockImageUrls(storedGuideBlocks(guide.content));
}

/** Borra del bucket los archivos que ya no usa ningún taller ni ninguna guía (la misma imagen puede estar en dos). */
async function removeUnusedWorkshopFiles(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    const [media, guides] = await Promise.all([
      prisma.workshopSessionMedia.findMany({
        where: { OR: [{ src: { in: urls } }, { poster: { in: urls } }] },
        select: { src: true, poster: true },
      }),
      prisma.workshopGuide.findMany({ where: { NOT: { content: { equals: Prisma.DbNull } } }, select: { content: true } }),
    ]);
    const stillUsed = new Set([...media.flatMap((m) => [m.src, m.poster]), ...guides.flatMap(guideFileUrls)]);
    await removeStorageFiles(urls.filter((url) => !stillUsed.has(url)));
  } catch (err) {
    console.error("No se pudieron limpiar archivos de workshops:", err);
  }
}

/** Chequea los datos del taller antes de subir archivos, para no subir fotos y recién ahí enterarse de un error. */
export async function validateSessionForm(formData: FormData): Promise<ActionState> {
  await requireSectionEdit(SECTION);
  const data = sessionData(formData);
  const media = parseMedia(str(formData, "media") || "[]").map((m) => ({ ...m, src: isPendingUpload(m.src) ? "x" : m.src, poster: m.poster && isPendingUpload(m.poster) ? "x" : m.poster }));
  const error = validateSession(data, media);
  if (error) return { error };
  const id = str(formData, "id");
  if (!id && (await slugTaken(data.slug, { entity: "session" }))) return { error: "Ya hay una guía o un taller con ese slug." };
  return { error: null };
}

/** Firma una URL de subida directa a Storage por cada archivo. */
export async function prepareWorkshopUploads(files: { type: string; size: number }[]): Promise<{ uploads: SignedUpload[] } | { error: string }> {
  await requireSectionEdit(SECTION);
  if (files.length > MAX_UPLOADS_PER_SAVE) return { error: `Máximo ${MAX_UPLOADS_PER_SAVE} archivos por guardado.` };

  const uploads: SignedUpload[] = [];
  for (const file of files) {
    const signed = await signUpload(file, STORAGE_FOLDER);
    if ("error" in signed) return signed;
    uploads.push(signed);
  }
  return { uploads };
}

/** Borra lo recién subido cuando el guardado falla (solo archivos de la carpeta de workshops que nadie use). */
export async function discardWorkshopUploads(urls: string[]): Promise<void> {
  await requireSectionEdit(SECTION);
  await removeUnusedWorkshopFiles(urls.filter((url) => url.includes(`/${STORAGE_FOLDER}/`)));
}
