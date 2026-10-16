import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
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
 * Inscriptos en CSV (lo que antes daba el Google Form). Solo ADMIN. El layout del panel no
 * envuelve a los route handlers, así que el permiso se chequea acá. `?charla=<slug>` filtra por una charla.
 */
export async function GET(request: Request) {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") return new Response("Sin permiso", { status: 403 });

  const slug = new URL(request.url).searchParams.get("charla") ?? "";
  const registrations = await prisma.talkRegistration.findMany({
    where: slug ? { talk: { slug } } : undefined,
    include: { talk: { select: { slug: true, title: true } } },
    orderBy: [{ talk: { startsAt: "desc" } }, { createdAt: "asc" }],
  });
  const profiles = await prisma.userProfile.findMany({ where: { email: { in: registrations.map((r) => r.email) } } });
  const profileByEmail = new Map(profiles.map((p) => [p.email, p]));

  const header = ["Charla", "Email", "Inscripto el (hora de Argentina)", "Rol", "Detalle del rol", "Carreras", "Año de inicio", "Estado"];
  const rows = registrations.map((r) => {
    const p = profileByEmail.get(r.email);
    return [
      r.talk.title,
      r.email,
      registeredAt.format(r.createdAt),
      p ? ROLE_LABELS[p.role] : "Sin perfil",
      p?.otherRole,
      p?.careers.map((c) => careerText(c, p.otherCareer)).join("; "),
      p?.startYear,
      p?.studentStatus ? STATUS_LABELS[p.studentStatus] : "",
    ];
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
