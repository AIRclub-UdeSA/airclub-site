import { ArrowUpRight } from "lucide-react";
import type { InPersonWorkshop } from "@/lib/workshops";
import { buildGoogleCalendarUrl } from "@/lib/calendar-types";
import { talkDateParts } from "@/lib/talk-format";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { CountHeading, SECTION_TITLE } from "@/components/shared/CountHeading";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;
const TIME_ZONE = "America/Argentina/Buenos_Aires";

function timeRange(startsAt: Date, endsAt?: Date) {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  return endsAt ? `${fmt(startsAt)} a ${fmt(endsAt)} hs` : `${fmt(startsAt)} hs`;
}

/**
 * Talleres presenciales que vienen. Salen de los eventos de categoría "workshop" (prisma/seed-data/events.ts): el
 * primero va en carmesí macizo, como la próxima charla de /talks; los demás, con contorno. Sin ninguno, un panel con la
 * trama de "lugar reservado" que lleva al recorrido asincrónico y a proponer uno.
 */
export function UpcomingWorkshops({ workshops }: { workshops: InPersonWorkshop[] }) {
  return (
    <section id="proximos" className="scroll-mt-24 pb-16 md:pb-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
        <RevealOnScroll>
          {workshops.length > 0 ? (
            <CountHeading n={workshops.length} title="Próximos talleres" />
          ) : (
            <h2 className={SECTION_TITLE}>Próximos talleres</h2>
          )}

          <div className="mt-8 grid grid-cols-1 gap-3">
            {workshops.length > 0 ? (
              workshops.map((w, i) => <WorkshopPanel key={w.slug} workshop={w} next={i === 0} />)
            ) : (
              <EmptyPanel />
            )}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function WorkshopPanel({ workshop, next }: { workshop: InPersonWorkshop; next: boolean }) {
  const date = talkDateParts(workshop.startsAt.toISOString(), workshop.endsAt?.toISOString());
  const calendarUrl = buildGoogleCalendarUrl({
    title: workshop.title,
    slug: workshop.slug,
    startsAt: workshop.startsAt.toISOString(),
    endsAt: workshop.endsAt?.toISOString(),
    description: workshop.description,
    location: workshop.location,
  });

  const facts = [
    { label: "Horario", value: timeRange(workshop.startsAt, workshop.endsAt) },
    { label: "Lugar", value: workshop.location ?? "Campus Victoria, UdeSA" },
    workshop.capacity ? { label: "Cupos", value: String(workshop.capacity) } : null,
    workshop.instructor ? { label: "A cargo de", value: workshop.instructor } : null,
    workshop.prerequisites ? { label: "Requisitos", value: workshop.prerequisites } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <article
      className={`grid min-w-0 grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-4 lg:p-10 ${
        next ? "bg-crimson text-white" : "border border-text text-text"
      }`}
    >
      <div className="lg:col-span-3">
        <p className={`font-mono text-[.78rem] uppercase tracking-[.16em] ${next ? "text-white/85" : "text-text3"}`}>
          {next ? "Próximo taller" : "Después"}
        </p>
        {date && (
          <div className="mt-3 flex items-end gap-4">
            <time
              dateTime={workshop.startsAt.toISOString().slice(0, 10)}
              className="font-logo text-[clamp(4.5rem,8vw,8rem)] leading-[0.8]"
            >
              {date.day}
            </time>
            <div className="pb-1 font-mono text-[.78rem] uppercase leading-snug tracking-[.14em] opacity-85">
              <div>{date.monthLong}</div>
              <div>{date.year}</div>
            </div>
          </div>
        )}
      </div>

      <div className="min-w-0 lg:col-span-5">
        <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold leading-[1.1] tracking-tight">
          {workshop.title}
        </h3>
        {workshop.tagline && (
          <p className="mt-2 font-mono text-[.74rem] uppercase tracking-[.14em] opacity-80">{workshop.tagline}</p>
        )}
        <p className={`mt-4 max-w-[60ch] text-[.98rem] leading-[1.7] ${next ? "text-white/85" : "text-text2"}`}>
          {workshop.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {workshop.externalUrl && (
            <a
              href={workshop.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] transition-colors ${
                next ? "bg-white text-crimson hover:bg-[#f5e8ec]" : "bg-crimson text-white hover:bg-crimson-hover"
              }`}
            >
              <span>{workshop.ctaLabel ?? "Inscribirme"}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
              {NEW_TAB_HINT}
            </a>
          )}
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[.78rem] uppercase tracking-[.12em] underline decoration-current/40 underline-offset-[6px] transition-colors hover:decoration-current"
          >
            Agendar
            {NEW_TAB_HINT}
          </a>
        </div>
      </div>

      <dl className={`grid min-w-0 grid-cols-1 content-start border-t pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 ${next ? "border-white/35" : "border-text"}`}>
        {facts.map((f) => (
          <div key={f.label} className="flex flex-col gap-1 py-2.5">
            <dt className="font-mono text-[.7rem] uppercase tracking-[.16em] opacity-70">{f.label}</dt>
            <dd className="text-[.98rem] leading-snug [overflow-wrap:anywhere]">{f.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function EmptyPanel() {
  return (
    <article className="relative isolate flex min-h-[20rem] flex-col justify-between gap-10 overflow-hidden border border-text p-6 text-text sm:p-8 lg:p-10">
      <div
        className="talk-hatch absolute inset-0 -z-10 [mask-image:linear-gradient(to_left,black,transparent_70%)]"
        aria-hidden="true"
      />
      <p className="font-mono text-[.78rem] uppercase tracking-[.16em] text-text3">Próximo taller presencial</p>
      <div>
        <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold leading-[1.1] tracking-tight">
          Todavía no hay fecha
        </h3>
        <p className="mt-3 max-w-[56ch] text-[.98rem] leading-[1.7] text-text2">
          Estamos armando el próximo encuentro en el Campus Victoria. Mientras tanto, el recorrido asincrónico está
          abierto; y si tenés algo para enseñar, este es el momento de proponerlo.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href="#asincronicos"
            className="inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3.5 font-mono text-[.78rem] font-semibold uppercase tracking-[.14em] text-white transition-colors hover:bg-crimson-hover"
          >
            Ver el recorrido
          </a>
          <a
            href="#proponer"
            className="font-mono text-[.78rem] uppercase tracking-[.12em] underline decoration-text/35 underline-offset-[6px] transition-colors hover:text-crimson-text hover:decoration-crimson-text"
          >
            Proponer un workshop
          </a>
        </div>
      </div>
    </article>
  );
}
