import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSectionEdit } from "@/lib/admin/permissions";
import { REGISTRATION_TYPE_OPTIONS } from "@/lib/event-registration";

const TIME_ZONE = "America/Argentina/Buenos_Aires";
const STATUS_LABEL = { DRAFT: "Borrador", PUBLISHED: "Publicado", CANCELLED: "Cancelado" } as const;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TIME_ZONE }).format(date);
}

export default async function AdminEventosPage() {
  await requireSectionEdit("eventos");
  const events = await prisma.event.findMany({ orderBy: { startsAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-text">Eventos</h2>
          <p className="mt-1 max-w-prose text-sm text-text2">
            Los eventos de /eventos (competencias y encuentros; las charlas y los talleres tienen su propio panel). Cada uno elige cómo se inscribe la
            gente. Los cambios se ven en el sitio sin redeploy. Para ocultar un evento, pasalo a Borrador; con &ldquo;Vista previa&rdquo; lo ves como
            se verá, borrador incluido.
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover"
        >
          Agregar evento
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-text3">Todavía no hay eventos.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
          {events.map((e) => {
            const typeLabel = REGISTRATION_TYPE_OPTIONS.find((o) => o.value === e.registrationType)?.label;
            return (
              <li key={e.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0 break-words">
                  <p className="font-medium text-text">{e.title}</p>
                  <p className="font-mono text-xs text-text3">
                    {e.dateLabel ?? formatDate(e.startsAt)} · {typeLabel}
                    {(e.registrationType === "INDIVIDUAL" || e.registrationType === "TEAM") && (e.registrationOpen ? " (abierta)" : " (cerrada)")} ·{" "}
                    {STATUS_LABEL[e.status]}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <Link href={`/admin/vista-previa/eventos/${e.slug}`} className="text-sm font-medium text-text2 hover:text-crimson-text hover:underline">
                    Vista previa
                  </Link>
                  <Link href={`/admin/eventos/${e.id}`} className="text-sm font-medium text-crimson-text hover:underline">
                    Editar
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
