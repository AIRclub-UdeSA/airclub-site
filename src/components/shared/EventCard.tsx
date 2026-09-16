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
    <div className="group relative block h-full overflow-hidden rounded-lg border-[1.5px] border-border bg-white transition-all duration-450 ease-club hover:border-crimson/30 hover:shadow-[0_20px_50px_rgba(164,12,76,0.1)] dark:bg-[#1a0810]">
      <div className={compact ? "px-5 pb-3 pt-5" : "px-7 pb-4 pt-7"}>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-block rounded-full px-3.5 py-1.5 font-mono text-[.6rem] uppercase tracking-[.1em]",
              upcoming ? "bg-[rgba(143,82,97,0.08)] text-mauve" : "bg-[rgba(164,12,76,0.07)] text-crimson-text"
            )}
          >
            {upcoming ? "Próximo" : "Pasado"}
          </span>
          {daysUntil && (
            <span className="inline-block rounded-full border border-border-h px-3.5 py-1.5 font-mono text-[.6rem] uppercase tracking-[.1em] text-text3">
              {daysUntil}
            </span>
          )}
        </div>
        <h3 className={compact ? "mb-1 font-display text-[1.05rem] font-bold text-text" : "mb-1 font-display text-[1.25rem] font-bold text-text"}>
          {event.title}
        </h3>
        <p className="font-mono text-[.68rem] text-text3">
          {formatEventDate(event.startsAt, event.endsAt)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>
      <div className={compact ? "px-5 pb-5" : "px-7 pb-7"}>
        {!compact && <p className="mb-4.5 text-[.86rem] leading-[1.65] text-text2">{event.description}</p>}
        <div className="flex items-center gap-2 text-[.84rem] font-semibold text-crimson-text transition-[gap] duration-300 group-hover:gap-3.5">
          {isExternal ? "Ver más" : "Ver detalle"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <TiltCard className="h-full rounded-lg">
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
