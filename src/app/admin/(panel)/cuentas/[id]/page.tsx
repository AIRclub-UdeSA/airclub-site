import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
import { careerText, ROLE_LABELS, STATUS_LABELS } from "@/lib/admin/community-stats";
import { AFFILIATION_LABELS } from "@/lib/perfil/completeness";
import { completedWorkshopsOf } from "@/lib/admin/account-workshops";
import { DeleteAccountButton } from "../DeleteAccountButton";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(date);
}

export default async function AdminCuentaPage({ params }: PageProps<"/admin/cuentas/[id]">) {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") redirect("/admin/sin-permiso");

  const { id } = await params;
  const profile = await prisma.userProfile.findUnique({ where: { id } });
  if (!profile) notFound();

  const [registrations, workshops] = await Promise.all([
    prisma.talkRegistration.findMany({
      where: { email: profile.email },
      include: { talk: { select: { title: true, startsAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    completedWorkshopsOf(profile.email),
  ]);

  const rows: [string, string][] = [
    ["Nombre", profile.fullName ?? "—"],
    ["Afiliación", profile.affiliation ? AFFILIATION_LABELS[profile.affiliation] : "—"],
    ...(profile.affiliation && profile.affiliation !== "UDESA" ? ([["Institución", profile.institution ?? "—"]] as [string, string][]) : []),
    ["Rol", ROLE_LABELS[profile.role]],
    ...(profile.role === "OTHER" ? ([["Detalle del rol", profile.otherRole ?? "—"]] as [string, string][]) : []),
    ...(profile.role === "STUDENT"
      ? ([
          ["Carreras", profile.careers.map((c) => careerText(c, profile.otherCareer)).join(", ") || "—"],
          ["Año de inicio", profile.startYear ? String(profile.startYear) : "—"],
          ["Estado", profile.studentStatus ? STATUS_LABELS[profile.studentStatus] : "—"],
        ] as [string, string][])
      : []),
    ["Aviso de privacidad", profile.consentAcceptedAt ? formatDate(profile.consentAcceptedAt) : "sin aceptar"],
    ["Alta", formatDate(profile.createdAt)],
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/admin/cuentas" className="text-sm font-medium text-text2 hover:text-crimson-text">
          ← Cuentas
        </Link>
        <h2 className="mt-3 break-words font-display text-xl font-bold text-text">{profile.email}</h2>
      </div>

      <dl className="grid max-w-xl grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-mono text-xs uppercase tracking-[.12em] text-text3">{label}</dt>
            <dd className="text-text">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-lg font-bold text-text">Charlas a las que se inscribió</h3>
        {registrations.length === 0 ? (
          <p className="text-sm text-text3">Ninguna.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
            {registrations.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between sm:gap-6">
                <span className="text-sm text-text2">{r.talk.title}</span>
                <span className="shrink-0 font-mono text-xs text-text3">inscripto el {formatDate(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {workshops && (
        <section className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-bold text-text">Talleres hechos</h3>
          {workshops.length === 0 ? (
            <p className="text-sm text-text3">Ninguno.</p>
          ) : (
            <ul className="list-inside list-disc text-sm text-text2">
              {workshops.map((slug) => (
                <li key={slug}>{slug}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3 border-t border-border/60 pt-6">
        <DeleteAccountButton id={profile.id} email={profile.email} />
      </section>
    </div>
  );
}
