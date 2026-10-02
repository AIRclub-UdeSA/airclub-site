import { Clock, MapPin } from "lucide-react";
import type { CalendarActivity } from "@/lib/calendar-types";
import { CategoryBadge } from "./EventBadge";
import { cn } from "@/lib/utils";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

function format(iso: string | undefined, options: Intl.DateTimeFormatOptions) {
  return iso ? new Intl.DateTimeFormat("es-AR", { timeZone: TIME_ZONE, ...options }).format(new Date(iso)) : undefined;
}

/** Título a mostrar: si todavía está "a confirmar", se antepone el subtítulo (por ejemplo "AIR Talk — A confirmar"). */
function displayTitle(a: CalendarActivity) {
  return a.subtitle && a.title.toLowerCase().includes("a confirmar") ? `${a.subtitle} — ${a.title}` : a.title;
}

/** La fecha como ancla: el día en Anton y, al lado, mes y año en mono. */
function DateBlock({ activity, size }: { activity: CalendarActivity; size: "lg" | "md" | "sm" }) {
  const day = format(activity.startsAt, { day: "2-digit" }) ?? "—";
  const month = format(activity.startsAt, { month: "long" }) ?? "Por anunciar";
  const year = format(activity.startsAt, { year: "numeric" }) ?? "";
  return (
    <div className="flex items-baseline gap-3">
      <span
        className={cn(
          "font-logo leading-none text-text",
          size === "lg" && "text-[clamp(3.5rem,7vw,5.5rem)]",
          size === "md" && "text-[clamp(3rem,5vw,4.2rem)]",
          size === "sm" && "text-[clamp(2.4rem,3.4vw,3rem)]"
        )}
      >
        {day}
      </span>
      <div className="font-mono text-[.78rem] uppercase leading-snug tracking-[.14em] text-text2">
        <div>{month}</div>
        <div className="text-text3">{year}</div>
      </div>
    </div>
  );
}

/** Clases del botón principal de un panel (el mismo en /eventos y en la landing). */
export const activityActionClass =
  "inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2 font-mono text-[.78rem] font-semibold uppercase tracking-[.1em] text-white transition-colors hover:bg-crimson/90";

/**
 * El panel de una actividad, compartido por /eventos y por la landing: contorno de 1px, fondo `bg-bg2` y la fecha en
 * Anton como ancla. Tres formas, de la más ancha a la más chica: `wide` (la próxima actividad, a todo el ancho),
 * `tall` (vertical y grande) y `compact` (vertical y chico). El llamador pone la acción (botón o enlace) en `action`.
 */
export function ActivityPanel({
  activity,
  variant,
  label,
  action,
  className,
}: {
  activity: CalendarActivity;
  variant: "wide" | "tall" | "compact";
  /** Rótulo sobre la fecha, por ejemplo "Próxima Actividad". */
  label?: string;
  action: React.ReactNode;
  className?: string;
}) {
  const wide = variant === "wide";
  const compact = variant === "compact";

  const meta = (
    <div className="flex flex-wrap items-center gap-2">
      <CategoryBadge category={activity.category} />
      {activity.location && !compact && (
        <span className="inline-flex items-center gap-1 font-mono text-[.72rem] text-text3">
          <MapPin className="h-3.5 w-3.5 text-mauve" />
          {activity.location}
        </span>
      )}
    </div>
  );

  const body = (
    <>
      <h2
        className={cn(
          // Syne en mayúscula es muy ancha: con palabras largas ("DESBLOQUEANDO") el mínimo tiene que ser chico y, por las
          // dudas, la palabra puede partirse; si no, ensancha toda la página en mobile.
          "font-display font-extrabold uppercase tracking-tight text-text [overflow-wrap:anywhere]",
          compact
            ? "text-[1.05rem] leading-[1.15] sm:text-[1.15rem]"
            : "text-[clamp(1.05rem,5vw,1.5rem)] leading-[1.1] sm:text-[clamp(1.4rem,2.6vw,2.1rem)]"
        )}
      >
        {displayTitle(activity)}
      </h2>
      <p
        className={cn(
          "mt-2 font-body leading-relaxed text-text2",
          compact ? "line-clamp-2 text-[.88rem]" : "line-clamp-3 text-[.92rem] lg:line-clamp-2"
        )}
      >
        {activity.description}
      </p>
    </>
  );

  if (wide) {
    return (
      <article className={cn("relative border border-text bg-bg2 p-6 transition-all sm:p-8 md:p-10", className)}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="flex flex-col border-b border-border pb-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            {label && (
              <span className="mb-2 font-mono text-[.76rem] font-bold uppercase tracking-[.18em] text-mauve">{label}</span>
            )}
            <DateBlock activity={activity} size="lg" />
            {activity.timeLabel && (
              <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[.78rem] text-text3">
                <Clock className="h-3.5 w-3.5 text-mauve" />
                {activity.timeLabel}
              </p>
            )}
          </div>

          <div className="flex flex-col justify-between gap-4 lg:col-span-8 lg:pl-4">
            <div>
              <div className="mb-2.5">{meta}</div>
              {body}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {action}
              {activity.capacity && (
                <span className="font-mono text-[.74rem] uppercase tracking-[.1em] text-text3">
                  Cupos: {activity.capacity} lugares
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col justify-between gap-6 border border-text bg-bg2",
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8 md:p-10",
        className
      )}
    >
      <div>
        {label && (
          <span className="mb-3 block font-mono text-[.76rem] font-bold uppercase tracking-[.18em] text-mauve">{label}</span>
        )}
        <DateBlock activity={activity} size={compact ? "sm" : "md"} />
        {activity.timeLabel && !compact && (
          <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[.78rem] text-text3">
            <Clock className="h-3.5 w-3.5 text-mauve" />
            {activity.timeLabel}
          </p>
        )}
        <div className={compact ? "mt-4" : "mt-6"}>
          <div className="mb-2.5">{meta}</div>
          {body}
        </div>
      </div>
      <div className={compact ? "border-t border-border pt-4" : ""}>{action}</div>
    </article>
  );
}
