import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { events } from "./seed-data/events";
import { robots } from "./seed-data/robots";
import { collaborators, founders } from "./seed-data/team";
import { talks } from "./seed-data/talks";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function toTalkMediaRow(m: (typeof talks)[number]["media"][number], order: number) {
  return {
    type: m.type === "image" ? ("IMAGE" as const) : ("VIDEO" as const),
    src: m.src,
    poster: m.type === "video" ? m.poster : undefined,
    order,
  };
}

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

  // El grupo (Fundador / Colaborador) se guarda en `role`.
  const people = [
    ...founders.map((m) => ({ ...m, role: m.role ?? "Fundador" })),
    ...collaborators.map((m) => ({ ...m, role: m.role ?? "Colaborador" })),
  ];
  await prisma.teamMember.deleteMany({});
  await prisma.teamMember.createMany({
    data: people.map(({ name, role, photoUrl, links }, i) => ({
      name,
      role,
      photoUrl,
      linkedin: links?.linkedin,
      linkedinPhoto: links?.linkedinPhoto,
      github: links?.github,
      order: i,
    })),
  });

  for (const [i, talk] of talks.entries()) {
    const { speaker, media, slides, links, cta, ...talkData } = talk;
    const data = {
      ...talkData,
      speakerName: speaker?.name,
      speakerRole: speaker?.role,
      speakerAffiliation: speaker?.affiliation,
      speakerAvatar: speaker?.avatar,
      speakerLinkedin: speaker?.linkedin,
      ctaLabel: cta?.label,
      ctaUrl: cta?.url,
      order: i,
    };
    await prisma.talk.upsert({
      where: { slug: talk.slug },
      create: {
        ...data,
        media: { create: media.map((m, j) => toTalkMediaRow(m, j)) },
        slides: { create: (slides ?? []).map((s, j) => ({ ...s, order: j })) },
        links: { create: (links ?? []).map((l, j) => ({ ...l, order: j })) },
      },
      update: {
        ...data,
        media: { deleteMany: {}, create: media.map((m, j) => toTalkMediaRow(m, j)) },
        slides: { deleteMany: {}, create: (slides ?? []).map((s, j) => ({ ...s, order: j })) },
        links: { deleteMany: {}, create: (links ?? []).map((l, j) => ({ ...l, order: j })) },
      },
    });
  }

  console.log(
    `Seed OK: ${events.length} eventos, ${robots.length} robots, ${people.length} personas, ${talks.length} charlas.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
