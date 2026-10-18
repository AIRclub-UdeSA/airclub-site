import "server-only";
import { prisma } from "./prisma";
import { isUpcoming } from "./dates";

/**
 * Qué talleres tiene hechos una cuenta, con la fecha. Hay dos fuentes:
 *
 * - Lo que marcó a mano ("Marcar como hecho" / "¿Viniste?"): `WorkshopCompletion`.
 * - Los talleres presenciales a los que se inscribió y ya terminaron (#70): cuentan como hechos solos, sin tocar nada.
 *   Se calcula acá, al leer, para no depender de una tarea programada. La fecha es la del fin del taller. Si la persona
 *   no fue y lo desmarcó, la inscripción queda `markedAbsent` y no cuenta.
 *
 * Lo usan el progreso de /workshops (progress-actions.ts) y /perfil/aprendizaje, así las dos pantallas cuentan lo mismo.
 */
export async function completionsOf(email: string): Promise<Map<string, Date>> {
  const [marked, registrations] = await Promise.all([
    prisma.workshopCompletion.findMany({ where: { email }, select: { workshopSlug: true, completedAt: true } }),
    prisma.workshopRegistration.findMany({
      where: { email, markedAbsent: false, session: { status: "PUBLISHED", startsAt: { not: null } } },
      select: { session: { select: { slug: true, startsAt: true, endsAt: true } } },
    }),
  ]);

  const done = new Map(marked.map((m) => [m.workshopSlug, m.completedAt]));
  for (const { session } of registrations) {
    if (!session.startsAt || isUpcoming(session.startsAt, session.endsAt) || done.has(session.slug)) continue;
    done.set(session.slug, session.endsAt ?? session.startsAt);
  }
  return done;
}

/**
 * Marca o desmarca un taller como hecho. Desmarcar también saca lo que contaba solo por la inscripción (la persona dice
 * que no fue); volver a marcarlo lo devuelve.
 */
export async function setCompletion(email: string, slug: string, done: boolean): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (done) {
      await tx.workshopCompletion.upsert({
        where: { email_workshopSlug: { email, workshopSlug: slug } },
        create: { email, workshopSlug: slug },
        update: {},
      });
    } else {
      await tx.workshopCompletion.deleteMany({ where: { email, workshopSlug: slug } });
    }
    await tx.workshopRegistration.updateMany({ where: { email, session: { slug } }, data: { markedAbsent: !done } });
  });
}
