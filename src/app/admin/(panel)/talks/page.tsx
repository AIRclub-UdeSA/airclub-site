import { fetchTalkRows, sortTalks, talksHubProps, toTalkItem } from "@/lib/talks";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { storagePublicPrefix } from "@/lib/storage-url";
import { TalksManager } from "./TalksManager";
import type { EditingTalk } from "./TalkForm";

export default async function AdminTalksPage() {
  const admin = await requireSectionAccess("talks");

  // Incluye los borradores: el panel los muestra apagados en el cronograma.
  const rows = await fetchTalkRows({ includeDrafts: true });
  const hub = talksHubProps(sortTalks(rows.map((row) => ({ item: toTalkItem(row), order: row.order }))).map(({ item }) => item));

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
    speakerBio: talk.speakerBio,
    startsAt: talk.startsAt,
    endsAt: talk.endsAt,
    dateLabel: talk.dateLabel,
    recordingUrl: talk.recordingUrl,
    ctaLabel: talk.ctaLabel,
    ctaUrl: talk.ctaUrl,
    confirmed: talk.confirmed,
    status: talk.status,
    media: talk.media.map((m) => ({
      type: m.type,
      src: m.src,
      poster: m.poster ?? "",
      lightBg: m.lightBg,
      objectFit: (m.objectFit as "contain" | "cover" | null) ?? undefined,
    })),
    slides: talk.slides.map((s) => ({ title: s.title, embedUrl: s.embedUrl, openUrl: s.openUrl })),
    links: talk.links.map((l) => ({ label: l.label, url: l.url })),
  }));

  return (
    <>
      <p className="max-w-prose text-sm text-text2">
        Así se ve /talks. Tocá el lápiz de una charla para cambiar sus datos, o &ldquo;Agregar charla&rdquo; al final del cronograma. Las
        que tienen el ojo tachado son borradores: no aparecen en /talks. La próxima y la última charla de arriba salen solas de las
        fechas del cronograma. Los cambios se ven en el sitio sin redeploy.
      </p>
      {/* A todo el ancho de la ventana, como /talks, aunque el panel tenga el contenido más angosto. */}
      <div className="mx-[calc(50%-50vw)]">
        <TalksManager
          hub={hub}
          talks={talks}
          showLogsLink={admin.role === "ADMIN"}
          storagePrefix={storagePublicPrefix(process.env.SUPABASE_URL)}
        />
      </div>
    </>
  );
}
