import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
import { BarList } from "@/components/admin/BarList";
import { distributions, ROLE_LABELS, signupsByWeek } from "@/lib/admin/community-stats";

const TIME_ZONE = "America/Argentina/Buenos_Aires";
const MAX_ROWS = 200;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TIME_ZONE }).format(date);
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Cuentas del sitio (UserProfile). No confundir con /admin/permisos, que es quién entra al panel (AdminUser). */
export default async function AdminCuentasPage({ searchParams }: PageProps<"/admin/cuentas">) {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") redirect("/admin/sin-permiso");

  const q = firstParam((await searchParams).q).trim();

  const [profiles, registrationCounts] = await Promise.all([
    prisma.userProfile.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.talkRegistration.groupBy({ by: ["email"], _count: { _all: true } }),
  ]);
  const registrationsByEmail = new Map(registrationCounts.map((r) => [r.email, r._count._all]));

  const dist = distributions(profiles);
  const students = dist.role.find((b) => b.label === ROLE_LABELS.STUDENT)?.count ?? 0;
  const weekly = signupsByWeek(profiles.map((p) => p.createdAt));
  const needle = q.toLowerCase();
  const matches = needle ? profiles.filter((p) => p.email.toLowerCase().includes(needle)) : profiles;
  const shown = matches.slice(0, MAX_ROWS);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Cuentas del sitio</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Personas que crearon su perfil en el sitio. Quién entra a este panel se gestiona en{" "}
          <Link href="/admin/permisos" className="font-medium text-crimson-text hover:underline">
            Permisos
          </Link>
          .
        </p>
      </div>

      <dl className="border-y border-border/60 py-4">
        <dt className="font-mono text-xs uppercase tracking-[.12em] text-text3">Cuentas con perfil</dt>
        <dd className="font-display text-3xl font-bold text-text">{profiles.length}</dd>
      </dl>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="md:col-span-2">
          <BarList title="Altas por semana (últimas 8)" buckets={weekly} total={profiles.length} />
        </div>
        <BarList title="Por rol" buckets={dist.role} total={profiles.length} />
        <BarList title="Por afiliación" buckets={dist.affiliation} total={profiles.length} />
        <BarList title="Por estado" buckets={dist.status} total={dist.status.reduce((n, b) => n + b.count, 0)} />
        <BarList title="Por carrera" buckets={dist.career} total={students} />
        <BarList title="Por año de inicio" buckets={dist.startYear} total={dist.startYear.reduce((n, b) => n + b.count, 0)} />
      </div>

      <section className="flex flex-col gap-4">
        <form className="flex flex-wrap items-end gap-3 rounded-[var(--r-md)] border border-border bg-card-muted p-4">
          <label className="flex w-full flex-col gap-1 text-sm text-text2 sm:w-auto sm:min-w-72">
            Buscar por mail
            <input
              type="search"
              name="q"
              defaultValue={q}
              className="w-full rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text"
            />
          </label>
          <button
            type="submit"
            className="rounded-[var(--r-pill)] bg-crimson px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson-hover"
          >
            Buscar
          </button>
          {q && (
            <Link href="/admin/cuentas" className="text-sm font-medium text-text2 hover:text-crimson-text">
              Limpiar búsqueda
            </Link>
          )}
        </form>

        <p className="font-mono text-xs text-text3">
          {q ? `${matches.length} resultado${matches.length === 1 ? "" : "s"}` : `${profiles.length} cuentas`}
          {matches.length > MAX_ROWS && ` · mostrando las ${MAX_ROWS} más recientes`}
        </p>

        {shown.length === 0 ? (
          <p className="text-sm text-text3">{q ? "Ninguna cuenta coincide con ese mail." : "Todavía no se creó ningún perfil."}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
            {shown.map((p) => {
              const count = registrationsByEmail.get(p.email) ?? 0;
              return (
                <li key={p.id}>
                  <Link href={`/admin/cuentas/${p.id}`} className="flex flex-col gap-1 py-3 hover:bg-card-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <span className="min-w-0 break-words text-sm text-text">
                      {p.fullName ? `${p.fullName} · ` : ""}{p.email} · <span className="text-text2">{ROLE_LABELS[p.role]}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-text3">
                      {count} {count === 1 ? "inscripción" : "inscripciones"} · alta {formatDate(p.createdAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
