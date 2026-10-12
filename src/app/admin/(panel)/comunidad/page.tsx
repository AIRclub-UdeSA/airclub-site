import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
import { careerLabel } from "@/lib/perfil/careers";

const ROLE_LABELS = { STUDENT: "Estudiante", PROFESSOR: "Profesor/a", OTHER: "Otro" } as const;
const STATUS_LABELS = { STUDYING: "Cursando", GRADUATED: "Recibido/a" } as const;
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

function profileDetail(profile: { role: "STUDENT" | "PROFESSOR" | "OTHER"; otherRole: string | null; careers: string[]; otherCareer: string | null; startYear: number | null; studentStatus: "STUDYING" | "GRADUATED" | null }): string {
  if (profile.role === "OTHER") return profile.otherRole ?? "—";
  if (profile.role === "PROFESSOR") return "—";
  const careers = profile.careers.map((slug) => (profile.otherCareer && careerLabel(slug) === "Otra" ? profile.otherCareer : careerLabel(slug)));
  const status = profile.studentStatus ? STATUS_LABELS[profile.studentStatus] : null;
  return [careers.join(", "), profile.startYear ? `desde ${profile.startYear}` : null, status].filter(Boolean).join(" · ");
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminComunidadPage({ searchParams }: PageProps<"/admin/comunidad">) {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") redirect("/admin/sin-permiso");

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

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Comunidad</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Personas con perfil público creado en el sitio, y quién se inscribió a cada AIR Talk. Solo lectura: nada acá se edita ni se borra.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="font-display text-lg font-bold text-text">{profiles.length} perfiles</h3>
        {profiles.length === 0 ? (
          <p className="text-sm text-text3">Todavía no se creó ningún perfil.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
            {profiles.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="text-sm text-text">
                    {p.email} · <span className="text-text2">{ROLE_LABELS[p.role]}</span>
                  </p>
                  <p className="font-mono text-xs text-text3">{profileDetail(p)}</p>
                </div>
                <span className="font-mono text-xs text-text3">{formatDate(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

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
        </form>

        {talksWithRegistrations.length === 0 ? (
          <p className="text-sm text-text3">
            {charlaSlug ? "Esa charla todavía no tiene inscriptos." : "Todavía no hay inscriptos en ninguna charla."}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {talksWithRegistrations.map((talk) => (
              <div key={talk.id} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text">
                  {talk.title}{" "}
                  <span className="font-mono text-xs font-normal text-text3">
                    — {talk.registrations.length}
                    {talk.capacity === null ? "" : ` de ${talk.capacity}`} inscripto
                    {talk.registrations.length === 1 && talk.capacity === null ? "" : "s"}
                  </span>
                </p>
                <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                  {talk.registrations.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                      <span className="text-sm text-text2">{r.email}</span>
                      <span className="font-mono text-xs text-text3">{formatDate(r.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
