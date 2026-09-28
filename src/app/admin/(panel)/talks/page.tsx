import { prisma } from "@/lib/prisma";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { TalksManager } from "./TalksManager";
import type { EditingTalk } from "./TalkForm";

export default async function AdminTalksPage() {
  const admin = await requireSectionAccess("talks");

  const rows = await prisma.talk.findMany({
    orderBy: { order: "asc" },
    include: {
      media: { orderBy: { order: "asc" } },
      slides: { orderBy: { order: "asc" } },
      links: { orderBy: { order: "asc" } },
    },
  });

  const talks: EditingTalk[] = rows.map((talk) => ({
    id: talk.id,
    slug: talk.slug,
    title: talk.title,
    subtitle: talk.subtitle,
    abstract: talk.abstract,
    topic: talk.topic,
    location: talk.location,
    speakerName: talk.speakerName,
    speakerRole: talk.speakerRole,
    speakerAffiliation: talk.speakerAffiliation,
    speakerAvatar: talk.speakerAvatar,
    speakerLinkedin: talk.speakerLinkedin,
    startsAt: talk.startsAt,
    endsAt: talk.endsAt,
    dateLabel: talk.dateLabel,
    recordingUrl: talk.recordingUrl,
    ctaLabel: talk.ctaLabel,
    ctaUrl: talk.ctaUrl,
    confirmed: talk.confirmed,
    status: talk.status,
    media: talk.media.map((m) => ({ type: m.type, src: m.src, poster: m.poster ?? "" })),
    slides: talk.slides.map((s) => ({ title: s.title, embedUrl: s.embedUrl, openUrl: s.openUrl })),
    links: talk.links.map((l) => ({ label: l.label, url: l.url })),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Charlas</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Borrador no aparece en /talks. &ldquo;A confirmar&rdquo; son charlas con fecha aún sin cerrar. Los cambios se ven en el sitio sin
          redeploy.
        </p>
      </div>

      <TalksManager talks={talks} showLogsLink={admin.role === "ADMIN"} />
    </div>
  );
}
