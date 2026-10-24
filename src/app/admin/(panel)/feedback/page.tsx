import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSectionView } from "@/lib/admin/permissions";
import {
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_TYPES,
  type FeedbackStatusId,
  type FeedbackTypeId,
} from "@/lib/feedback/rules";
import { formatFeedbackDate, StatusBadge } from "./shared";

// Tope de filas por página: alcanza para la v1. Si llega más, se filtra.
const LIMIT = 200;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function excerpt(message: string, max = 160): string {
  const oneLine = message.replace(/\s+/g, " ");
  return oneLine.length > max ? `${oneLine.slice(0, max).trimEnd()}…` : oneLine;
}

export default async function AdminFeedbackPage({ searchParams }: PageProps<"/admin/feedback">) {
  await requireSectionView("feedback");

  const params = await searchParams;
  const typeParam = firstParam(params.tipo);
  const statusParam = firstParam(params.estado);
  const path = firstParam(params.pagina);
  const type = (FEEDBACK_TYPES as readonly string[]).includes(typeParam) ? (typeParam as FeedbackTypeId) : "";
  const status = (FEEDBACK_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as FeedbackStatusId) : "";
  const filtered = Boolean(type || status || path);

  const where = { ...(type && { type }), ...(status && { status }), ...(path && { path }) };
  const [items, total, paths] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: LIMIT,
      select: { id: true, type: true, status: true, path: true, message: true, createdAt: true },
    }),
    prisma.feedback.count({ where }),
    prisma.feedback.groupBy({ by: ["path"], _count: { _all: true }, orderBy: { path: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Feedback</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Lo que manda la gente desde el botón de feedback, lo más nuevo arriba. Entrá a cada uno para leerlo entero y
          cambiarle el estado; cada cambio queda en los logs.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-[var(--r-md)] border border-border bg-card-muted p-4">
        <label className="flex flex-col gap-1 text-sm text-text2">
          Tipo
          <select name="tipo" defaultValue={type} className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text">
            <option value="">Todos</option>
            {FEEDBACK_TYPES.map((t) => (
              <option key={t} value={t}>
                {FEEDBACK_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-text2">
          Estado
          <select name="estado" defaultValue={status} className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text">
            <option value="">Todos</option>
            {FEEDBACK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {FEEDBACK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        {/* Con ancho acotado, como el de charlas en /admin/comunidad: una ruta larga no desborda en mobile. */}
        <label className="flex w-full flex-col gap-1 text-sm text-text2 sm:w-auto sm:max-w-xs">
          Página
          <select name="pagina" defaultValue={path} className="w-full rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text">
            <option value="">Todas</option>
            {paths.map((p) => (
              <option key={p.path} value={p.path}>
                {p.path} · {p._count._all}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover"
        >
          Filtrar
        </button>
        {filtered && (
          <Link href="/admin/feedback" className="text-sm font-medium text-text2 hover:text-crimson-text">
            Limpiar filtros
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-text3">{filtered ? "No hay feedback con esos filtros." : "Todavía no llegó ningún feedback."}</p>
      ) : (
        <>
          <p className="font-mono text-xs text-text3">
            {total === 1 ? "1 feedback" : `${total} feedback`}
            {total > LIMIT && `, se muestran los ${LIMIT} más nuevos`}
          </p>
          <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
            {items.map((f) => (
              <li key={f.id}>
                <Link href={`/admin/feedback/${f.id}`} className="group flex flex-col gap-1.5 py-3.5">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StatusBadge status={f.status} />
                    <span className="text-sm font-medium text-text">{FEEDBACK_TYPE_LABELS[f.type]}</span>
                    <span className="break-all font-mono text-xs text-text3">{f.path}</span>
                    <span className="font-mono text-xs text-text3">{formatFeedbackDate(f.createdAt)}</span>
                  </span>
                  <span className="break-words text-sm text-text2 group-hover:text-crimson-text">{excerpt(f.message)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
