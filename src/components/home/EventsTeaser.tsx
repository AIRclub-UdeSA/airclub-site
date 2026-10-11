import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getUnifiedCalendarActivities } from "@/lib/calendar";
import type { CalendarActivity } from "@/lib/calendar-types";
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
  const { activities } = await getUnifiedCalendarActivities();
  // Mismo criterio que la "próxima actividad" de /eventos: lo que viene o es hoy, en orden cronológico.
  const upcoming = activities.filter((a) => a.isUpcoming || a.status === "today").slice(0, MAX_ACTIVITIES);
  const [first, ...rest] = upcoming;

  return (
    <section id="actividades" className="px-4 sm:px-8 md:px-12 pt-20 sm:pt-32 pb-20 sm:pb-28 max-w-[1440px] mx-auto">
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
  );
}
