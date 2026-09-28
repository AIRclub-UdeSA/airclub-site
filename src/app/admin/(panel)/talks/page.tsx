import { prisma } from "@/lib/prisma";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { formatEventDate } from "@/lib/dates";

function formatTalkDate(talk: { startsAt: Date | null; dateLabel: string | null }): string {
  // dateLabel es el texto curado a mano para cuando el día/horario exacto no está cerrado
  // (ej. "Semana del 12 al 16 de octubre") — más preciso que formatear el startsAt crudo.
  if (talk.dateLabel) return talk.dateLabel;
  if (talk.startsAt) return formatEventDate(talk.startsAt);
  return "Sin fecha";
}

export default async function AdminTalksPage() {
  await requireSectionAccess("talks");

  const talks = await prisma.talk.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { media: true, slides: true, links: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Charlas</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Borrador no aparece en /talks. &ldquo;A confirmar&rdquo; son charlas con fecha aún sin cerrar.
        </p>
      </div>

      {talks.length === 0 ? (
        <p className="text-sm text-text3">Todavía no hay charlas cargadas.</p>
      ) : (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {talks.map((talk) => (
            <li key={talk.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium text-text">{talk.title}</p>
                <p className="font-mono text-xs text-text3">
                  {talk.slug} · {formatTalkDate(talk)} · {talk._count.media} media · {talk._count.slides} slides ·{" "}
                  {talk._count.links} links
                </p>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wide">
                <span className={talk.status === "PUBLISHED" ? "text-text2" : "text-crimson-text"}>
                  {talk.status === "PUBLISHED" ? "Publicada" : "Borrador"}
                </span>
                <span className={talk.confirmed ? "text-text2" : "text-crimson-text"}>
                  {talk.confirmed ? "Confirmada" : "A confirmar"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
