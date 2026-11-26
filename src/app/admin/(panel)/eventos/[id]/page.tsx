import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSectionEdit } from "@/lib/admin/permissions";
import { EventForm, type EditingEvent } from "../EventForm";

export default async function EditarEventoPage({ params }: PageProps<"/admin/eventos/[id]">) {
  await requireSectionEdit("eventos");
  const { id } = await params;
  const row = await prisma.event.findUnique({ where: { id } });
  if (!row) notFound();

  const event: EditingEvent = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    location: row.location,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    allDay: row.allDay,
    dateLabel: row.dateLabel,
    status: row.status,
    instructor: row.instructor,
    prerequisites: row.prerequisites,
    track: row.track,
    featuredForCountdown: row.featuredForCountdown,
    ctaLabel: row.ctaLabel,
    externalUrl: row.externalUrl,
    registrationType: row.registrationType,
    registrationOpen: row.registrationOpen,
    registrationDeadline: row.registrationDeadline,
    audience: row.audience,
    capacity: row.capacity,
    teamMinSize: row.teamMinSize,
    teamMaxSize: row.teamMaxSize,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-text">Editar evento</h2>
        <Link href={`/admin/vista-previa/eventos/${row.slug}`} className="text-sm font-medium text-crimson-text hover:underline">
          Ver vista previa
        </Link>
      </div>
      <EventForm event={event} />
    </div>
  );
}
