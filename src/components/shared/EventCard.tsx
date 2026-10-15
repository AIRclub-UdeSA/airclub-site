import Link from "next/link";
import type { EventItem } from "@/lib/events";
import { formatDaysUntil, formatEventDate, isUpcoming } from "@/lib/dates";
import { TiltCard } from "@/components/shared/TiltCard";
import { cn } from "@/lib/utils";

export function EventCard({ event, compact = false }: { event: EventItem; compact?: boolean }) {
  const upcoming = isUpcoming(event.startsAt, event.endsAt);
  const href = event.externalUrl ?? `/eventos/${event.slug}`;
  const isExternal = Boolean(event.externalUrl);
  const daysUntil = upcoming ? formatDaysUntil(event.startsAt) : null;

  const cardInner = (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-card border-[1.5px] border-border bg-card transition-all duration-300 ease-club hover:border-crimson hover:-translate-y-1">
      <div className={compact ? "p-6 pb-3" : "p-8 pb-4"}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-block rounded-full px-3.5 py-1 font-mono text-[.62rem] uppercase tracking-[.14em] font-semibold",
              upcoming ? "bg-crimson/10 text-crimson-text" : "bg-black/5 dark:bg-white/10 text-text3"
            )}
          >
            {upcoming ? "Próximo" : "Pasado"}
          </span>
          {daysUntil && (
            <span className="inline-block rounded-full border border-border px-3 py-1 font-mono text-[.62rem] uppercase tracking-[.12em] text-mauve">
              {daysUntil}
            </span>
          )}
        </div>
        <h3 className={compact ? "mb-1.5 font-display text-[1.15rem] font-bold text-text leading-tight" : "mb-2 font-display text-[1.35rem] font-bold text-text leading-tight"}>
          {event.title}
        </h3>
        <p className="font-mono text-[.72rem] text-text3 tracking-wide">
          {formatEventDate(event.startsAt, event.endsAt)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>
      <div className={compact ? "p-6 pt-2" : "p-8 pt-3"}>
        {!compact && <p className="mb-5 font-body text-[.9rem] leading-[1.65] text-text2">{event.description}</p>}
        <div className="inline-flex items-center gap-2 font-mono text-[.76rem] font-semibold uppercase tracking-[.1em] text-crimson-text transition-[gap] duration-200 group-hover:gap-3">
          {isExternal ? "Ver convocatoria" : "Ver detalle"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <TiltCard className="h-full rounded-card">
      {isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
          {cardInner}
        </a>
      ) : (
        <Link href={href} className="block h-full">
          {cardInner}
        </Link>
      )}
    </TiltCard>
  );
}
