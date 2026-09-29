import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
import { sectionLabel } from "@/lib/admin/sections";

const ACTION_LABELS: Record<string, string> = {
  create: "Creó",
  update: "Editó",
  delete: "Borró",
  deactivate: "Desactivó",
  reactivate: "Reactivó",
};
const TIME_ZONE = "America/Argentina/Buenos_Aires";

function formatLogDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "sí" : "no";
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (isPlainObject(value)) return "(objeto)";
  return String(value);
}

/** Lista de "campo: antes → después" para los campos que cambiaron. Con before=null (create)
 * o after=null (delete) muestra todos los campos del lado que sí existe. */
function diffSummary(before: unknown, after: unknown): string[] {
  const beforeObj = isPlainObject(before) ? before : {};
  const afterObj = isPlainObject(after) ? after : {};
  const keys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
  const lines: string[] = [];
  for (const key of keys) {
    if (key === "id" || key === "createdAt" || key === "updatedAt") continue;
    const b = beforeObj[key];
    const a = afterObj[key];
    if (JSON.stringify(b) === JSON.stringify(a)) continue;
    lines.push(`${key}: ${formatFieldValue(b)} → ${formatFieldValue(a)}`);
  }
  return lines.sort();
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminLogsPage({ searchParams }: PageProps<"/admin/logs">) {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") redirect("/admin/sin-permiso");

  const params = await searchParams;
  const section = firstParam(params.section);
  const adminUserId = firstParam(params.adminUserId);
  const action = firstParam(params.action);
  const entityId = firstParam(params.entityId);
  const hasFilters = Boolean(section || adminUserId || action || entityId);

  const [logs, sectionRows, adminUsers] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        ...(section && { section }),
        ...(adminUserId && { adminUserId }),
        ...(action && { action }),
        ...(entityId && { entityId }),
      },
      include: { adminUser: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.auditLog.findMany({ distinct: ["section"], select: { section: true }, orderBy: { section: "asc" } }),
    prisma.adminUser.findMany({ select: { id: true, email: true }, orderBy: { email: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Logs de auditoría</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Últimas {logs.length} acciones{hasFilters ? " que matchean el filtro" : ""}. Cada alta, edición o borrado en el panel queda acá,
          con quién lo hizo y qué cambió.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-[var(--r-md)] border border-border bg-card-muted p-4">
        <label className="flex flex-col gap-1 text-sm text-text2">
          Sección
          <select name="section" defaultValue={section} className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text">
            <option value="">Todas</option>
            {sectionRows.map((row) => (
              <option key={row.section} value={row.section}>
                {sectionLabel(row.section)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-text2">
          Persona
          <select
            name="adminUserId"
            defaultValue={adminUserId}
            className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text"
          >
            <option value="">Todas</option>
            {adminUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-text2">
          Acción
          <select name="action" defaultValue={action} className="rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text">
            <option value="">Todas</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {entityId && <input type="hidden" name="entityId" value={entityId} />}
        <button
          type="submit"
          className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover"
        >
          Filtrar
        </button>
        {hasFilters && (
          <Link href="/admin/logs" className="text-sm font-medium text-text2 hover:text-crimson-text">
            Limpiar filtros
          </Link>
        )}
      </form>

      {entityId && (
        <p className="text-sm text-text2">
          Mostrando solo el historial de un elemento puntual (<code className="font-mono text-xs">{entityId}</code>).
        </p>
      )}

      {logs.length === 0 ? (
        <p className="text-sm text-text3">No hay entradas para este filtro.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
          {logs.map((log) => {
            const changes = diffSummary(log.before, log.after);
            return (
              <li key={log.id} className="flex flex-col gap-1 py-4">
                <p className="text-sm text-text">
                  <span className="font-mono text-xs text-text3">{formatLogDate(log.createdAt)}</span> · {log.adminUser.email} ·{" "}
                  <strong>{ACTION_LABELS[log.action] ?? log.action}</strong> {sectionLabel(log.section)}{" "}
                  <Link
                    href={`/admin/logs?entityId=${log.entityId}`}
                    className="font-mono text-xs text-text3 hover:text-crimson-text"
                    title="Ver todo el historial de este elemento"
                  >
                    ({log.entityId})
                  </Link>
                </p>
                {changes.length > 0 && (
                  <ul className="ml-4 list-disc font-mono text-xs text-text2">
                    {changes.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
