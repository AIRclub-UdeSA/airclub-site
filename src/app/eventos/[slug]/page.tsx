import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/events";
import { buildMetadata } from "@/lib/seo";
import { EventDetail } from "@/components/eventos/EventDetail";

// ISR: se revalida cada 60s y al guardar el evento en /admin/eventos (ver revalidateEventPages). Un borrador no llega
// acá (getEventBySlug solo trae lo publicado): se previsualiza en /admin/vista-previa/eventos/<slug>.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return buildMetadata({ title: "Evento no encontrado", description: "", path: `/eventos/${slug}` });

  return buildMetadata({
    title: `${event.title}, AIR Club UdeSA`,
    description: event.description,
    path: `/eventos/${event.slug}`,
  });
}

export default async function EventoDetailPage({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return <EventDetail event={event} />;
}
