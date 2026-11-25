import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isRegistrationOpen } from "@/lib/event-registration";

/**
 * Los equipos de eventos en los que está la cuenta, como capitán o como integrante (solo lectura: el capitán los
 * edita desde el evento, con el mismo diálogo que usó para inscribirlos). No muestra nada si no está en ninguno.
 */
export async function MyTeams({ email }: { email: string }) {
  const memberships = await prisma.eventTeamMember.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    include: {
      team: {
        include: {
          members: { orderBy: [{ isCaptain: "desc" }, { createdAt: "asc" }] },
          event: { select: { slug: true, title: true, status: true, startsAt: true, endsAt: true, registrationOpen: true, registrationDeadline: true, registrationType: true } },
        },
      },
    },
  });
  if (memberships.length === 0) return null;

  return (
    <section aria-labelledby="mis-equipos" className="flex flex-col gap-4">
      <h2 id="mis-equipos" className="font-display text-[1.3rem] font-bold text-text">
        {memberships.length === 1 ? "Mi equipo" : "Mis equipos"}
      </h2>
      <ul className="flex flex-col gap-4">
        {memberships.map(({ team, isCaptain }) => {
          const canEdit = isCaptain && isRegistrationOpen(team.event);
          return (
            <li key={team.id} className="flex flex-col gap-3 border border-border-strong/30 bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-display text-[1.05rem] font-bold text-text">{team.name}</p>
                <span className="font-mono text-[.7rem] uppercase tracking-[.1em] text-crimson-text">{isCaptain ? "Sos el capitán" : "Sos integrante"}</span>
              </div>
              <p className="font-body text-[.9rem] text-text2">
                En{" "}
                <Link href={`/eventos/${team.event.slug}`} className="font-medium text-crimson-text hover:underline">
                  {team.event.title}
                </Link>
              </p>
              <ul className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                {team.members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2 font-body text-[.88rem] text-text2">
                    <span className="min-w-0 break-all">{m.email}</span>
                    {m.isCaptain && <span className="shrink-0 font-mono text-[.68rem] uppercase tracking-[.1em] text-text3">Capitán</span>}
                  </li>
                ))}
              </ul>
              {canEdit ? (
                <Link
                  href={`/eventos?evento=${encodeURIComponent(team.event.slug)}&inscribir=${encodeURIComponent(team.event.slug)}`}
                  className="w-fit font-mono text-[.76rem] uppercase tracking-[.1em] text-text2 underline underline-offset-4 transition-colors hover:text-crimson-text"
                >
                  Editar o dar de baja el equipo
                </Link>
              ) : (
                <p className="font-body text-[.82rem] text-text3">
                  {isCaptain ? "La inscripción ya cerró: el equipo no se puede cambiar." : "Solo el capitán puede cambiar el equipo o darlo de baja."}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
