import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canEditSection, requireSectionView } from "@/lib/admin/permissions";
import { AFFILIATION_LABELS } from "@/lib/perfil/completeness";
import type { ProfileAffiliation } from "../../../../../generated/prisma/client";
import { careerText, distributions, ROLE_LABELS, STATUS_LABELS } from "@/lib/admin/community-stats";
import { BarList } from "@/components/admin/BarList";
import { RemoveRegistrationButton } from "./RemoveRegistrationButton";
const TIME_ZONE = "America/Argentina/Buenos_Aires";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

function profileDetail(profile: { affiliation: ProfileAffiliation | null; institution: string | null; role: "STUDENT" | "PROFESSOR" | "OTHER"; otherRole: string | null; careers: string[]; otherCareer: string | null; startYear: number | null; studentStatus: "STUDYING" | "GRADUATED" | null }): string {
  const origin = profile.affiliation ? [AFFILIATION_LABELS[profile.affiliation], profile.institution].filter(Boolean).join(": ") : null;
  const rest = roleDetail(profile);
  return [origin, rest].filter(Boolean).join(" · ") || "—";
}

function roleDetail(profile: { role: "STUDENT" | "PROFESSOR" | "OTHER"; otherRole: string | null; careers: string[]; otherCareer: string | null; startYear: number | null; studentStatus: "STUDYING" | "GRADUATED" | null }): string {
  if (profile.role === "OTHER") return profile.otherRole ?? "—";
  if (profile.role === "PROFESSOR") return "";
  const careers = profile.careers.map((slug) => careerText(slug, profile.otherCareer));
  const status = profile.studentStatus ? STATUS_LABELS[profile.studentStatus] : null;
  return [careers.join(", "), profile.startYear ? `desde ${profile.startYear}` : null, status].filter(Boolean).join(" · ");
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminComunidadPage({ searchParams }: PageProps<"/admin/comunidad">) {
  // Un Editor con "comunidad" asignada ve y exporta, pero no da de baja (#97): eso queda para ADMIN.
  const admin = await requireSectionView("comunidad");
  const canRemove = canEditSection(admin, "comunidad");

  const params = await searchParams;
  const charlaSlug = firstParam(params.charla);

  const [profiles, talksWithRegistrations, registrableTalks] = await Promise.all([
    prisma.userProfile.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.talk.findMany({
      where: { registrations: { some: {} }, ...(charlaSlug && { slug: charlaSlug }) },
      include: { registrations: { orderBy: { createdAt: "desc" } } },
      orderBy: { startsAt: "desc" },
    }),
    // Las abiertas y también las que ya cerraron pero tienen inscriptos, para poder filtrarlas.
    prisma.talk.findMany({
      where: { OR: [{ registrationOpen: true }, { registrations: { some: {} } }] },
      select: { slug: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  // Inscripción y perfil se unen por email (no hay relación en el schema). Los perfiles ya están cargados arriba.
  const profileByEmail = new Map(profiles.map((p) => [p.email, p]));

  const allRegistrations = talksWithRegistrations.flatMap((t) => t.registrations);
  const totalRegistrations = allRegistrations.length;
  const uniquePeople = new Set(allRegistrations.map((r) => r.email)).size;
  const withoutProfile = new Set(allRegistrations.filter((r) => !profileByEmail.has(r.email)).map((r) => r.email)).size;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Comunidad</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          {canRemove
            ? "Quién se inscribió a cada AIR Talk. Las cuentas con perfil están en Cuentas. Las inscripciones se pueden dar de baja desde acá; cada baja y cada exportación quedan en los logs."
            : "Quién se inscribió a cada AIR Talk. Tenés acceso de solo lectura: podés ver y exportar los inscriptos, pero no darlos de baja. Cada exportación queda registrada con tu email."}
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="font-display text-lg font-bold text-text">Inscriptos por charla</h3>

        <form className="flex flex-wrap items-end gap-3 rounded-[var(--r-md)] border border-border bg-card-muted p-4">
          {/* Con ancho acotado: si no, el select toma el ancho del título más largo y en mobile desborda la página. */}
          <label className="flex w-full flex-col gap-1 text-sm text-text2 sm:w-auto sm:max-w-md">
            Charla
            <select
              name="charla"
              defaultValue={charlaSlug}
              className="w-full rounded-[var(--r-sm)] border border-border bg-card px-3 py-2 text-sm text-text"
            >
              <option value="">Todas</option>
              {registrableTalks.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.title}
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
          {charlaSlug && (
            <Link href="/admin/comunidad" className="text-sm font-medium text-text2 hover:text-crimson-text">
              Limpiar filtro
            </Link>
          )}
          <a href="/admin/comunidad/inscriptos.csv" className="text-sm font-medium text-text2 hover:text-crimson-text">
            Exportar todo (CSV)
          </a>
        </form>

        {talksWithRegistrations.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border/60 py-4 sm:grid-cols-4">
            {[
              ["Inscripciones", totalRegistrations],
              ["Personas distintas", uniquePeople],
              ["Charlas con inscriptos", talksWithRegistrations.length],
              ["Sin perfil", withoutProfile],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-xs uppercase tracking-[.12em] text-text3">{label}</dt>
                <dd className="font-display text-3xl font-bold text-text">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {talksWithRegistrations.length === 0 ? (
          <p className="text-sm text-text3">
            {charlaSlug ? "Esa charla todavía no tiene inscriptos." : "Todavía no hay inscriptos en ninguna charla."}
          </p>
        ) : (
          <div className="flex flex-col gap-12">
            {talksWithRegistrations.map((talk) => {
              const count = talk.registrations.length;
              const dist = distributions(talk.registrations.map((r) => profileByEmail.get(r.email) ?? null));
              return (
                <article key={talk.id} className="flex flex-col gap-5">
                  <header className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="font-display text-base font-bold text-text">{talk.title}</h4>
                      <a
                        href={`/admin/comunidad/inscriptos.csv?charla=${encodeURIComponent(talk.slug)}`}
                        className="text-sm font-medium text-crimson-text hover:underline"
                      >
                        Exportar CSV
                      </a>
                    </div>
                    <p className="font-mono text-xs text-text3">
                      {count}
                      {talk.capacity === null ? " inscripto" : ` de ${talk.capacity} lugares`}
                      {talk.capacity === null && count !== 1 ? "s" : ""}
                    </p>
                    {talk.capacity !== null && (
                      <div
                        role="progressbar"
                        aria-label="Cupo ocupado"
                        aria-valuemin={0}
                        aria-valuemax={talk.capacity}
                        aria-valuenow={count}
                        className="h-2.5 w-full max-w-md rounded-[4px] bg-border/40"
                      >
                        <div className="h-full rounded-[4px] bg-crimson" style={{ width: `${Math.min(100, (count / talk.capacity) * 100)}%` }} />
                      </div>
                    )}
                  </header>

                  <div className="grid gap-8 md:grid-cols-2">
                    <BarList title="Por rol" buckets={dist.role} total={count} />
                    <BarList title="Por afiliación" buckets={dist.affiliation} total={count} />
                    <BarList title="Por estado" buckets={dist.status} total={dist.status.reduce((n, b) => n + b.count, 0)} />
                    <BarList title="Por carrera" buckets={dist.career} total={dist.role.find((b) => b.label === "Estudiante")?.count ?? 0} />
                    <BarList title="Por año de inicio" buckets={dist.startYear} total={dist.startYear.reduce((n, b) => n + b.count, 0)} />
                  </div>

                  <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                    {talk.registrations.map((r) => {
                      const profile = profileByEmail.get(r.email);
                      return (
                        <li key={r.id} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                          <div className="min-w-0 break-words">
                            <p className="text-sm text-text2">
                              {profile?.fullName ? `${profile.fullName} · ` : ""}{r.email}
                              {profile ? <span className="text-text3"> · {ROLE_LABELS[profile.role]}</span> : <span className="text-text3"> · sin perfil</span>}
                            </p>
                            {profile && <p className="font-mono text-xs text-text3">{profileDetail(profile)}</p>}
                            <p className="font-mono text-xs text-text3">{formatDate(r.createdAt)}</p>
                          </div>
                          {canRemove && <RemoveRegistrationButton id={r.id} email={r.email} />}
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
