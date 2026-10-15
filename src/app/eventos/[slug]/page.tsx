import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/events";
import { formatEventDate, isUpcoming } from "@/lib/dates";
import { Button } from "@/components/shared/Button";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { buildMetadata } from "@/lib/seo";

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

  const upcoming = isUpcoming(event.startsAt, event.endsAt);

  return (
    <section className="px-15 py-32 max-md:px-5.5 max-md:py-24">
      <RevealOnScroll>
        <Link href="/eventos" className="mb-7 inline-flex items-center gap-2 text-[.84rem] text-text2 transition-all hover:gap-3 hover:text-crimson-text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 rotate-180" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Volver a eventos
        </Link>

        <span
          className={
            upcoming
              ? "mb-4 inline-block rounded-full bg-[rgba(143,82,97,0.08)] px-3.5 py-1.5 font-mono text-[.6rem] uppercase tracking-[.1em] text-mauve"
              : "mb-4 inline-block rounded-full bg-[rgba(164,12,76,0.07)] px-3.5 py-1.5 font-mono text-[.6rem] uppercase tracking-[.1em] text-crimson-text"
          }
        >
          {upcoming ? "Próximo" : "Pasado"}
        </span>
        <h1 className="mb-2 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-tight text-text">{event.title}</h1>
        <p className="mb-6 font-mono text-[.78rem] text-text3">
          {formatEventDate(event.startsAt, event.endsAt)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        <p className="mb-9 max-w-[620px] text-[.95rem] leading-[1.75] text-text2">{event.description}</p>

        {event.externalUrl ? (
          <Button href={event.externalUrl} external variant="primary">
            {upcoming ? "Inscribirme" : "Ver más"}
          </Button>
        ) : (
          <p className="text-[.86rem] text-text3">
            Todavía no hay inscripción abierta para este evento.{" "}
            <Link href="/contacto" className="font-semibold text-crimson-text">
              Escribinos
            </Link>{" "}
            si querés más información.
          </p>
        )}
      </RevealOnScroll>
    </section>
  );
}
