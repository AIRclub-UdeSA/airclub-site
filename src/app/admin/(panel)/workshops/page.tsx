import Link from "next/link";
import { fetchWorkshopRows } from "@/lib/workshops";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { storagePublicPrefix } from "@/lib/storage-url";
import { WorkshopsManager, type AdminTrack } from "./WorkshopsManager";

export default async function AdminWorkshopsPage() {
  const admin = await requireSectionAccess("workshops");

  // Incluye los borradores: el panel los muestra marcados, /workshops no.
  const rows = await fetchWorkshopRows({ includeDrafts: true });
  const tracks: AdminTrack[] = rows.map((t) => ({
    id: t.id,
    key: t.key,
    title: t.title,
    label: t.label,
    summary: t.summary,
    setupUrl: t.setupUrl,
    repoUrl: t.repoUrl,
    status: t.status,
    guides: t.guides.map((g) => ({
      id: g.id,
      trackId: g.trackId,
      slug: g.slug,
      week: g.week,
      title: g.title,
      summary: g.summary,
      outcome: g.outcome,
      minutesMin: g.minutesMin,
      minutesMax: g.minutesMax,
      level: g.level,
      ros2Package: g.ros2Package,
      requires: g.requires,
      guideUrl: g.guideUrl,
      codeUrl: g.codeUrl,
      status: g.status,
    })),
    sessions: t.sessions.map((s) => ({
      id: s.id,
      trackId: s.trackId,
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      description: s.description,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      dateLabel: s.dateLabel,
      location: s.location,
      instructor: s.instructor,
      recordingUrl: s.recordingUrl,
      status: s.status,
      media: s.media.map((m) => ({
        type: m.type,
        src: m.src,
        poster: m.poster ?? "",
        lightBg: m.lightBg,
        objectFit: (m.objectFit as "contain" | "cover" | null) ?? undefined,
      })),
      slides: s.slides.map(({ title, embedUrl, openUrl }) => ({ title, embedUrl, openUrl })),
      links: s.links.map(({ label, url }) => ({ label, url })),
    })),
  }));

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-prose text-sm text-text2">
        Los workshops de <Link href="/workshops" className="font-medium text-crimson-text hover:underline">/workshops</Link>, en
        el orden de sus cajas. Cada uno tiene sus guías asincrónicas (la ruta) y sus talleres presenciales que ya pasaron, con
        fotos, diapositivas y grabación. Los talleres que vienen, con fecha e inscripción, siguen siendo eventos. Los borradores
        no se ven en el sitio. Los cambios se ven sin redeploy.
      </p>
      <WorkshopsManager tracks={tracks} showLogsLink={admin.role === "ADMIN"} storagePrefix={storagePublicPrefix(process.env.SUPABASE_URL)} />
    </div>
  );
}
