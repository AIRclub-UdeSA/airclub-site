import { prisma } from "@/lib/prisma";
import { canViewSection, requireAdminSession } from "@/lib/admin/permissions";
import { AFFILIATION_LABELS } from "@/lib/perfil/completeness";
import { careerText, csvCell, ROLE_LABELS, STATUS_LABELS } from "@/lib/admin/community-stats";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

// Hora de Argentina, como en la página, y no UTC. "sv-SE" da "2026-10-16 09:19", que Excel y
// Sheets reconocen como fecha y hora (se puede ordenar y filtrar).
const registeredAt = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Inscriptos en CSV (lo que antes daba el Google Form). Lo baja quien puede ver "comunidad":
 * ADMIN o un Editor con esa sección (#97). El layout del panel no envuelve a los route handlers,
 * así que el permiso se chequea acá. `?charla=<slug>` filtra por una charla; `?evento=<slug>` baja los inscriptos de un
 * evento (individuales y, en los de equipos, cada integrante con su equipo), con el mismo formato.
 *
 * Cada descarga queda en AuditLog (action "export"): el archivo se puede reenviar, así que se
 * registra quién sacó qué datos personales. Si no se puede registrar, no se entrega el archivo.
 */
export async function GET(request: Request) {
  const admin = await requireAdminSession();
  if (!canViewSection(admin, "comunidad")) return new Response("Sin permiso", { status: 403 });

  const params = new URL(request.url).searchParams;
  const eventSlug = params.get("evento") ?? "";
  const slug = eventSlug || (params.get("charla") ?? "");
  // Charlas (por defecto), inscriptos individuales de un evento o integrantes de sus equipos: se arman con la misma forma
  // para compartir el resto. En un evento por equipos hay una fila por integrante, con el nombre del equipo.
  type Row = { title: string; team?: string; role?: string; email: string; createdAt: Date };
  let registrations: Row[];
  if (eventSlug) {
    const event = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { title: true } });
    const [individual, members] = await Promise.all([
      prisma.eventRegistration.findMany({ where: { event: { slug: eventSlug } }, orderBy: { createdAt: "asc" } }),
      prisma.eventTeamMember.findMany({
        where: { team: { event: { slug: eventSlug } } },
        include: { team: { select: { name: true, createdAt: true } } },
        orderBy: [{ team: { createdAt: "asc" } }, { isCaptain: "desc" }, { createdAt: "asc" }],
      }),
    ]);
    registrations = [
      ...individual.map((r) => ({ title: event?.title ?? eventSlug, email: r.email, createdAt: r.createdAt })),
      ...members.map((m) => ({
        title: event?.title ?? eventSlug,
        team: m.team.name,
        role: m.isCaptain ? "Capitán" : "Integrante",
        email: m.email,
        createdAt: m.createdAt,
      })),
    ];
  } else {
    registrations = (
      await prisma.talkRegistration.findMany({
        where: slug ? { talk: { slug } } : undefined,
        include: { talk: { select: { slug: true, title: true } } },
        orderBy: [{ talk: { startsAt: "desc" } }, { createdAt: "asc" }],
      })
    ).map((r) => ({ title: r.talk.title, email: r.email, createdAt: r.createdAt }));
  }
  const withTeams = registrations.some((r) => r.team);
  const profiles = await prisma.userProfile.findMany({ where: { email: { in: registrations.map((r) => r.email) } } });
  const profileByEmail = new Map(profiles.map((p) => [p.email, p]));

  const header = [eventSlug ? "Evento" : "Charla", ...(withTeams ? ["Equipo", "Rol en el equipo"] : []), "Nombre", "Email", "Inscripto el (hora de Argentina)", "Afiliación", "Institución", "Rol", "Detalle del rol", "Carreras", "Año de inicio", "Estado"];
  const rows = registrations.map((r) => {
    const p = profileByEmail.get(r.email);
    return [
      r.title,
      ...(withTeams ? [r.team, r.role] : []),
      p?.fullName,
      r.email,
      registeredAt.format(r.createdAt),
      p?.affiliation ? AFFILIATION_LABELS[p.affiliation] : "",
      p?.institution,
      p ? ROLE_LABELS[p.role] : "Sin perfil",
      p?.otherRole,
      p?.careers.map((c) => careerText(c, p.otherCareer)).join("; "),
      p?.startYear,
      p?.studentStatus ? STATUS_LABELS[p.studentStatus] : "",
    ];
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: admin.adminId,
      section: "comunidad",
      entityId: slug || "todas",
      action: "export",
      after: eventSlug ? { evento: eventSlug, filas: rows.length } : { charla: slug || "todas", filas: rows.length },
    },
  });

  // BOM para que Excel lea bien los acentos.
  const body = "﻿" + [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscriptos${slug ? `-${slug}` : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
