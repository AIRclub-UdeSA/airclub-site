import { notFound } from "next/navigation";
import { requireSectionView } from "@/lib/admin/permissions";
import { getEventPreviewBySlug } from "@/lib/events";
import { EventDetail } from "@/components/eventos/EventDetail";

// Vista previa de un evento tal como se ve en /eventos/<slug>, borrador incluido. Está en /admin: pide sesión con acceso a
// "eventos" (sin sesión redirige al login), no se cachea (lee la sesión en cada pedido) y hereda el noindex de /admin.
// Las charlas no tienen algo equivalente: /admin/talks muestra los borradores apagados en el cronograma.
export default async function VistaPreviaEventoPage({ params }: PageProps<"/admin/vista-previa/eventos/[slug]">) {
  await requireSectionView("eventos");
  const { slug } = await params;
  const found = await getEventPreviewBySlug(slug);
  if (!found) notFound();

  return <EventDetail event={found.event} preview={{ status: found.status }} />;
}
