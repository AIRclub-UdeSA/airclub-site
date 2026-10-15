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
    lightBg: m.type === "image" ? Boolean(m.lightBg) : false,
    objectFit: m.type === "image" ? (m.objectFit ?? null) : null,
    order,
  };
}

async function main() {
  for (const event of events) {
    const eventData = {
      slug: event.slug,
      title: event.title,
      tagline: event.tagline,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      externalUrl: event.externalUrl,
      rsvpEnabled: event.rsvpEnabled,
      capacity: event.capacity,
      featuredForCountdown: event.featuredForCountdown,
      imageUrl: event.imageUrl,
    };
    await prisma.event.upsert({
      where: { slug: event.slug },
      create: eventData,
      update: eventData,
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

  // El equipo se edita desde /admin/equipo: la verdad está en la base, no en seed-data. El seed solo
  // crea a quien falta (update vacío) y nunca pisa una ficha existente, igual que las charlas.
  // Upsert por slug: así el id de cada persona no cambia y otras tablas pueden apuntarle sin romperse.
  // El grupo sale del array en el que está cada persona.
  const people = [
    ...founders.map((m) => ({ ...m, group: "FOUNDER" as const })),
    ...collaborators.map((m) => ({ ...m, group: "COLLABORATOR" as const })),
  ];
  for (const [i, { slug, name, group, role, photoUrl, links }] of people.entries()) {
    const data = {
      name,
      group,
      role: role ?? null,
      photoUrl,
      linkedin: links?.linkedin,
      linkedinPhoto: links?.linkedinPhoto,
      github: links?.github,
      order: i,
    };
    await prisma.teamMember.upsert({ where: { slug }, create: { slug, ...data }, update: {} });
  }

  // Las charlas se editan desde /admin/talks: la verdad está en la base, no en seed-data. El seed solo
  // crea las que faltan (update vacío) y nunca pisa una charla existente. Contra: una charla de
  // seed-data que se borró desde el panel vuelve a aparecer si se corre el seed.
  for (const [i, talk] of talks.entries()) {
    const { speaker, media, slides, links, cta, ...talkData } = talk;
    const data = {
      ...talkData,
      speakerName: speaker?.name,
      speakerRole: speaker?.role,
      speakerAffiliation: speaker?.affiliation,
      speakerAvatar: speaker?.avatar,
      speakerLinkedin: speaker?.linkedin,
      speakerBio: speaker?.bio,
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
      update: {},
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
