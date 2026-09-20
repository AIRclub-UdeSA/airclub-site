import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { events } from "./seed-data/events";
import { robots } from "./seed-data/robots";
import { collaborators, founders } from "./seed-data/team";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      create: event,
      update: event,
    });
  }

  for (const robot of robots) {
    const { specs, links, ...robotData } = robot;
    await prisma.robot.upsert({
      where: { slug: robot.slug },
      create: {
        ...robotData,
        specs: { create: specs.map((s, i) => ({ ...s, order: i })) },
        links: { create: links.map((l, i) => ({ ...l, order: i })) },
      },
      update: {
        ...robotData,
        specs: { deleteMany: {}, create: specs.map((s, i) => ({ ...s, order: i })) },
        links: { deleteMany: {}, create: links.map((l, i) => ({ ...l, order: i })) },
      },
    });
  }

  // El grupo (Fundador / Colaborador) se guarda en `role`. Los links y la foto de LinkedIn (`links`) todavía no tienen
  // columna en TeamMember, así que por ahora no se persisten en la base.
  const people = [
    ...founders.map((m) => ({ ...m, role: m.role ?? "Fundador" })),
    ...collaborators.map((m) => ({ ...m, role: m.role ?? "Colaborador" })),
  ];
  await prisma.teamMember.deleteMany({});
  await prisma.teamMember.createMany({
    data: people.map(({ name, role, photoUrl }, i) => ({ name, role, photoUrl, order: i })),
  });

  console.log(`Seed OK: ${events.length} eventos, ${robots.length} robots, ${people.length} personas.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
