import type { Prisma } from "@/lib/prisma";

/** Qué tenía la cuenta que se borró, para el AuditLog de /admin/cuentas: solo slugs, nunca emails ni nombres de equipo. */
export type DeletedAccountData = {
  charlas: string[];
  talleresHechos: string[];
  talleresPresenciales: string[];
  eventosIndividuales: string[];
  eventosPorEquipo: string[];
};

/**
 * Borra todo lo que el sitio guarda de una cuenta, dentro de la transacción que le pasa quien llama: sus inscripciones a
 * charlas, a talleres presenciales y a eventos, sus equipos de eventos, los talleres que marcó como hechos y el perfil.
 * Si era capitán de un equipo, se va el equipo entero (los integrantes se borran en cascada); si era integrante, sale
 * ella sola y el equipo sigue con los demás (aunque quede por debajo del mínimo). Devuelve los slugs de lo que tenía.
 *
 * La comparten `deleteMyAccountAction` (/perfil) y `deleteAccountAction` (/admin/cuentas): que las dos dejen la base
 * igual es lo que evita que una deje datos personales de alguien sin cuenta. Si sumás una tabla con datos de la persona,
 * se suma acá.
 *
 * `email` es el del perfil. EventTeam.captainEmail y EventTeamMember.email se guardan en minúsculas, y el perfil
 * también (sale del email de la sesión, en minúsculas), pero acá se baja a minúsculas igual para esas dos tablas.
 */
export async function deleteAccountData(tx: Prisma.TransactionClient, email: string): Promise<DeletedAccountData> {
  const eventEmail = email.toLowerCase();

  const talkRegistrations = await tx.talkRegistration.findMany({
    where: { email },
    select: { talk: { select: { slug: true } } },
  });
  const completions = await tx.workshopCompletion.findMany({ where: { email }, select: { workshopSlug: true } });
  const workshopRegistrations = await tx.workshopRegistration.findMany({
    where: { email },
    select: { session: { select: { slug: true } } },
  });
  const eventRegistrations = await tx.eventRegistration.findMany({
    where: { email: eventEmail },
    select: { event: { select: { slug: true } } },
  });
  // El capitán también está entre los integrantes; la otra rama cubre un equipo al que le falte esa fila.
  const teams = await tx.eventTeam.findMany({
    where: { OR: [{ captainEmail: eventEmail }, { members: { some: { email: eventEmail } } }] },
    select: { event: { select: { slug: true } } },
  });

  await tx.talkRegistration.deleteMany({ where: { email } });
  await tx.eventRegistration.deleteMany({ where: { email: eventEmail } });
  await tx.eventTeam.deleteMany({ where: { captainEmail: eventEmail } });
  await tx.eventTeamMember.deleteMany({ where: { email: eventEmail } });
  await tx.workshopCompletion.deleteMany({ where: { email } });
  await tx.workshopRegistration.deleteMany({ where: { email } });
  await tx.userProfile.deleteMany({ where: { email } });

  return {
    charlas: talkRegistrations.map((r) => r.talk.slug),
    talleresHechos: completions.map((c) => c.workshopSlug),
    talleresPresenciales: workshopRegistrations.map((r) => r.session.slug),
    eventosIndividuales: eventRegistrations.map((r) => r.event.slug),
    eventosPorEquipo: [...new Set(teams.map((t) => t.event.slug))],
  };
}
