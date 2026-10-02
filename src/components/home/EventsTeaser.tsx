import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getUnifiedCalendarActivities } from "@/lib/calendar";
import type { CalendarActivity } from "@/lib/calendar-types";
import { getContactReason } from "@/lib/contact";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { ActivityPanel, activityActionClass } from "@/components/eventos/ActivityPanel";

const MAX_ACTIVITIES = 3;

/** Lleva a /eventos con el detalle de esa actividad abierto (el mismo que abre el calendario). */
const detailHref = (a: CalendarActivity) => `/eventos?evento=${encodeURIComponent(a.slug)}`;

function DetailLink({ activity, compact = false }: { activity: CalendarActivity; compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href={detailHref(activity)}
        className="group inline-flex items-center gap-1.5 font-mono text-[.76rem] font-semibold uppercase tracking-[.12em] text-crimson-text"
      >
        Ver detalles
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    );
  }
  return (
    <Link href={detailHref(activity)} className={activityActionClass}>
      Ver detalles y participar
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

/**
 * Las próximas actividades salen de la misma fuente y con el mismo panel que /eventos (`ActivityPanel`), así las dos
 * páginas son idénticas. Hay como máximo 3 y las cajas cambian de forma según cuántas hay: una sola va a todo el ancho;
 * con dos o tres, una grande y las demás más chicas apiladas al costado.
 */
export async function EventsTeaser() {
  const [{ activities }, talk, workshop] = await Promise.all([
    getUnifiedCalendarActivities(),
    getContactReason("charla"),
    getContactReason("workshop"),
  ]);
  // Mismo criterio que la "próxima actividad" de /eventos: lo que viene o es hoy, en orden cronológico.
  const upcoming = activities.filter((a) => a.isUpcoming || a.status === "today").slice(0, MAX_ACTIVITIES);
  const [first, ...rest] = upcoming;

  // Las dos formas de proponer una actividad salen del mismo correo del club, con plantilla para completar.
  const PROPOSALS = [
    { title: "Charla", desc: "Tesis, proyectos en desarrollo o casos de la industria.", href: talk.href },
    { title: "Workshop", desc: "Contanos qué te gustaría aprender.", href: workshop.href },
  ];

  return (
    <>
    <section id="actividades" className="px-4 sm:px-8 md:px-12 pt-20 sm:pt-32 pb-12 max-w-[1440px] mx-auto">
      <div className="mb-10 sm:mb-14">
        <RevealOnScroll>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/80">
            <h2 className="font-display text-[clamp(1.2rem,6vw,3.8rem)] sm:text-[clamp(2.4rem,5vw,3.8rem)] font-black leading-[0.95] tracking-tight text-text uppercase">
              Próximas <span className="text-crimson">actividades</span>
            </h2>
            <Link
              href="/eventos"
              className="group inline-flex items-center gap-1.5 font-mono text-[.82rem] uppercase tracking-[.14em] font-semibold text-text hover:text-crimson transition-colors"
            >
              <span>Ver calendario completo</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 text-crimson" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>

      {!first ? (
        <div className="py-12 text-center border border-dashed border-border/80 p-8">
          <p className="font-mono text-[.82rem] uppercase tracking-wider text-text3">
            No hay actividades programadas por el momento.
          </p>
        </div>
      ) : rest.length === 0 ? (
        /* Una sola: a todo el ancho, igual que el destacado de /eventos */
        <RevealOnScroll>
          <ActivityPanel activity={first} variant="wide" label="Próxima Actividad" action={<DetailLink activity={first} />} />
        </RevealOnScroll>
      ) : (
        /* Dos o tres: una grande (7 columnas) y las demás, más chicas y apiladas (5 columnas) */
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
          <RevealOnScroll className="h-full lg:col-span-7">
            <ActivityPanel activity={first} variant="tall" label="Próxima Actividad" action={<DetailLink activity={first} />} />
          </RevealOnScroll>
          <div className="flex flex-col gap-4 lg:col-span-5">
            {rest.map((activity, idx) => (
              <RevealOnScroll key={activity.id} delay={(idx + 1) as 1 | 2} className="flex-1">
                <ActivityPanel activity={activity} variant="compact" action={<DetailLink activity={activity} compact />} />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      )}
    </section>

    {/* Banda "Proponer actividad": ocupa TODO el ancho de la ventana (fuera del contenedor angosto de la
        sección), con esquinas rectas y el mismo borde fino que el carrusel de la landing (WordSlideshow), sin
        resplandores. Fondo rubí #520b2f y rosa de acento #ff4d8d: los de la diapositiva "AIR TALKS". El
        contenido se alinea con la grilla del resto de la sección (max-w-7xl + mismos paddings). */}
    <div className="relative w-full overflow-hidden border-y border-white/10 bg-[#520b2f] mb-20 sm:mb-32">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 sm:px-8 sm:py-16 md:px-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div className="font-mono text-[.74rem] font-semibold uppercase tracking-[.2em] text-[#ff4d8d]">
            Convocatoria abierta
          </div>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,3.1vw,2.7rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            Proponé una charla o un workshop
          </h2>
          <p className="mt-5 max-w-[40ch] font-body text-[1.02rem] leading-relaxed text-white/75">
            Escribinos con el tema y 2 líneas de qué trata.
          </p>
        </div>

        <div className="lg:col-span-6 flex flex-col divide-y divide-white/15 border-y border-white/15">
          {PROPOSALS.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group flex min-h-[88px] items-center gap-5 py-5 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90 sm:px-2"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-[1.25rem] font-bold leading-tight text-white">{item.title}</h3>
                <p className="mt-1 text-[.9rem] leading-relaxed text-white/65">{item.desc}</p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/25 text-white transition-colors group-hover:border-[#ff4d8d] group-hover:bg-[#ff4d8d]">
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
