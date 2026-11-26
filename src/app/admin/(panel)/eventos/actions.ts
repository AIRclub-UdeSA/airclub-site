"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma, Prisma } from "@/lib/prisma";
import { requireSectionEdit } from "@/lib/admin/permissions";
import { parseAudience } from "@/lib/udesa";
import { parseRegistrationType } from "@/lib/event-registration";
import { normalizeRegistration, validateEventData, type EventFormData } from "@/lib/event-validation";

const SECTION = "eventos";
// Argentina no tiene horario de verano: offset fijo, a diferencia de zonas con DST.
const AR_OFFSET = "-03:00";
const CATEGORIES = ["WORKSHOP", "COMPETITION", "MEETUP", "TALK"] as const;

export type ActionState = { error: string | null };

function str(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function optStr(formData: FormData, name: string): string | null {
  return str(formData, name) || null;
}

// Vacío = null. Un valor inválido queda como NaN para que lo rechace validateEventData.
function optNumber(formData: FormData, name: string): number | null {
  const raw = optStr(formData, name);
  return raw === null ? null : Number(raw);
}

function combineDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr) return null;
  return new Date(`${dateStr}T${timeStr || "00:00"}:00${AR_OFFSET}`);
}

// Un solo "día" (+ horas opcionales) para el caso común, y un "día de fin" aparte cuando dura más de un día (como las charlas).
function parseEventDates(formData: FormData): { startsAt: Date | null; endsAt: Date | null } {
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

function parseForm(formData: FormData) {
  const { startsAt, endsAt } = parseEventDates(formData);
  const registrationType = parseRegistrationType(formData.get("registrationType"));
  const category = CATEGORIES.find((c) => c === formData.get("category")) ?? "MEETUP";

  const validated: EventFormData = {
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    description: str(formData, "description"),
    startsAt,
    endsAt,
    registrationType,
    externalUrl: optStr(formData, "externalUrl"),
    registrationDeadline: combineDateTime(str(formData, "deadlineDate"), str(formData, "deadlineTime") || "23:59"),
    audience: parseAudience(formData.get("audience")),
    capacity: optNumber(formData, "capacity"),
    teamMinSize: optNumber(formData, "teamMinSize"),
    teamMaxSize: optNumber(formData, "teamMaxSize"),
  };

  return {
    validated,
    // Lo que se guarda. Lo de la inscripción pasa por normalizeRegistration: solo queda lo que usa el tipo elegido.
    data: () => {
      const reg = normalizeRegistration(validated);
      const hasRegistration = registrationType !== "NONE";
      return {
        slug: validated.slug,
        title: validated.title,
        tagline: optStr(formData, "tagline"),
        description: validated.description,
        category,
        location: optStr(formData, "location"),
        startsAt: startsAt!,
        endsAt,
        dateLabel: optStr(formData, "dateLabel"),
        status: (formData.get("status") === "DRAFT" ? "DRAFT" : "PUBLISHED") as "DRAFT" | "PUBLISHED",
        instructor: optStr(formData, "instructor"),
        prerequisites: optStr(formData, "prerequisites"),
        track: category === "WORKSHOP" ? optStr(formData, "track") : null,
        featuredForCountdown: formData.get("featuredForCountdown") === "on",
        ctaLabel: hasRegistration ? optStr(formData, "ctaLabel") : null,
        registrationType: registrationType!,
        registrationOpen: (registrationType === "INDIVIDUAL" || registrationType === "TEAM") && formData.get("registrationOpen") === "on",
        ...reg,
        audience: reg.audience!,
      };
    },
  };
}

// Serializable a Prisma.InputJsonValue: sin Date crudo (AuditLog.before/after son columnas Json).
function auditSnapshot(event: Record<string, unknown>): Prisma.InputJsonValue {
  const out: Record<string, Prisma.InputJsonValue | null> = {};
  for (const [key, value] of Object.entries(event)) {
    if (key === "id" || key === "createdAt" || key === "updatedAt") continue;
    out[key] = value instanceof Date ? value.toISOString() : (value as Prisma.InputJsonValue | null);
  }
  return out;
}

// El evento puede salir en el calendario, su página, la cuenta regresiva de la landing, el sitemap y /workshops.
function revalidateEventPages(slug: string) {
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath(`/eventos/${slug}`);
  revalidatePath("/");
  revalidatePath("/workshops");
  revalidatePath("/sitemap.xml");
}

export async function createEvent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionEdit(SECTION);
  const { validated, data } = parseForm(formData);
  const error = validateEventData(validated);
  if (error) return { error };

  let slug: string;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({ data: data() });
      await tx.auditLog.create({
        data: { adminUserId: actor.adminId, section: SECTION, entityId: event.id, action: "create", after: auditSnapshot(event) },
      });
      return event;
    });
    slug = created.slug;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return { error: "Ya hay un evento con ese slug." };
    return { error: err instanceof Error ? err.message : "No se pudo crear el evento." };
  }

  revalidateEventPages(slug);
  redirect("/admin/eventos");
}

export async function updateEvent(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireSectionEdit(SECTION);
  const id = str(formData, "id");
  if (!id) return { error: "Falta el id del evento." };

  const { validated, data } = parseForm(formData);
  const error = validateEventData(validated);
  if (error) return { error };

  let slug: string;
  try {
    slug = await prisma.$transaction(async (tx) => {
      const before = await tx.event.findUniqueOrThrow({ where: { id } });
      // El slug es la URL pública del evento: una vez creado no se cambia desde acá (se rompería cada link compartido).
      const { slug: _slug, ...rest } = data();
      void _slug;
      const after = await tx.event.update({ where: { id }, data: rest });
      await tx.auditLog.create({
        data: {
          adminUserId: actor.adminId,
          section: SECTION,
          entityId: id,
          action: "update",
          before: auditSnapshot(before),
          after: auditSnapshot(after),
        },
      });
      return after.slug;
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo guardar el evento." };
  }

  revalidateEventPages(slug);
  redirect("/admin/eventos");
}
