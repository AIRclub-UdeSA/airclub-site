import Link from "next/link";
import { EyeOff } from "lucide-react";
import type { EventItem } from "@/lib/events";
import { formatEventDate, isUpcoming } from "@/lib/dates";
import { Button } from "@/components/shared/Button";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { JsonLd } from "@/components/shared/JsonLd";
import { eventJsonLd } from "@/lib/structured-data";
import { defaultCtaLabel, isRegistrationOpen } from "@/lib/event-registration";
import { EventRegistration } from "@/components/eventos/EventRegistration";

const PREVIEW_STATUS_LABEL = { DRAFT: "Borrador, no publicado", CANCELLED: "Cancelado, no se ve en el sitio", PUBLISHED: "Publicado" } as const;

/**
 * La ficha de un evento: la de `/eventos/<slug>` y su vista previa del panel (`/admin/vista-previa/eventos/<slug>`).
 * Con `preview`, un aviso arriba dice el estado y el botón de inscripción se muestra pero no se puede usar (el servidor
 * solo inscribe en eventos publicados).
 */
export function EventDetail({ event, preview }: { event: EventItem; preview?: { status: keyof typeof PREVIEW_STATUS_LABEL } }) {
  const upcoming = isUpcoming(event.startsAt, event.endsAt);
  // Individual o de equipo: el botón abre el diálogo de inscripción en la página. Con link externo es un enlace; sin inscripción, un aviso.
  const ownType = event.registrationType === "INDIVIDUAL" || event.registrationType === "TEAM" ? event.registrationType : undefined;
  const registrable = upcoming && ownType !== undefined && isRegistrationOpen(event);
  const externalUrl = event.registrationType === "EXTERNAL_LINK" ? event.externalUrl : undefined;

  const registration = registrable ? (
    <EventRegistration
      event={{
        slug: event.slug,
        title: event.title,
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt?.toISOString(),
        allDay: event.allDay,
        location: event.location,
        description: event.description,
        registrationType: ownType!,
        label: event.ctaLabel || defaultCtaLabel(ownType),
      }}
    />
  ) : externalUrl ? (
    <Button href={externalUrl} external variant="primary">
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
  );

  return (
    <section className="px-15 py-32 max-md:px-5.5 max-md:py-24">
      {/* Una vista previa no tiene que dejar rastro para los buscadores: sin datos estructurados (la ruta ya lleva noindex). */}
      {!preview && <JsonLd data={eventJsonLd(event)} />}
      <RevealOnScroll>
        {preview && (
          <div role="status" className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-1 border border-text bg-bg2 px-5 py-3">
            <span className="inline-flex items-center gap-2 font-mono text-[.76rem] font-bold uppercase tracking-[.14em] text-crimson-text">
              <EyeOff className="size-4" aria-hidden="true" />
              Vista previa: {PREVIEW_STATUS_LABEL[preview.status]}
            </span>
            <span className="text-[.86rem] text-text2">Solo la ve quien tiene acceso a Eventos en el panel. El botón de inscripción se activa al publicar.</span>
          </div>
        )}
        <Link
          href={preview ? "/admin/eventos" : "/eventos"}
          className="mb-7 inline-flex items-center gap-2 text-[.84rem] text-text2 transition-all hover:gap-3 hover:text-crimson-text"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 rotate-180" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          {preview ? "Volver al panel de eventos" : "Volver a eventos"}
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
          {formatEventDate(event.startsAt, event.endsAt, event.allDay)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        <p className="mb-9 max-w-[620px] text-[.95rem] leading-[1.75] text-text2">{event.description}</p>

        {preview ? <div inert>{registration}</div> : registration}
      </RevealOnScroll>
    </section>
  );
}
