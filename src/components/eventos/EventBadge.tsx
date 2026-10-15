import { cn } from "@/lib/utils";
import type { CalendarActivityCategory, CalendarActivityStatus } from "@/lib/calendar-types";

export function CategoryBadge({
  category,
  className,
}: {
  category: CalendarActivityCategory;
  className?: string;
}) {
  switch (category) {
    case "talk":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 border border-crimson/30 bg-crimson/10 px-2.5 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.14em] text-crimson-text",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
          AIR Talk
        </span>
      );
    case "workshop":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 border border-rose bg-rose/20 px-2.5 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.14em] text-text",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-crimson" />
          Workshop
        </span>
      );
    case "competition":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 border border-mauve/40 bg-mauve/15 px-2.5 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.14em] text-text",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-mauve" />
          Competencia
        </span>
      );
    case "meetup":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 border border-border bg-bg2 px-2.5 py-1 font-mono text-[.68rem] font-semibold uppercase tracking-[.14em] text-text2",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-text3" />
          Encuentro
        </span>
      );
  }
}

export function StatusBadge({
  status,
  className,
}: {
  status: CalendarActivityStatus;
  className?: string;
}) {
  switch (status) {
    case "today":
      return (
        <span
          className={cn(
            "border border-crimson bg-crimson px-2 py-0.5 font-mono text-[.65rem] font-bold uppercase tracking-[.16em] text-white",
            className
          )}
        >
          HOY
        </span>
      );
    case "upcoming":
      return (
        <span
          className={cn(
            "border border-border-h px-2 py-0.5 font-mono text-[.65rem] uppercase tracking-[.14em] text-mauve",
            className
          )}
        >
          Próximo
        </span>
      );
    case "past":
      return (
        <span
          className={cn(
            "border border-border px-2 py-0.5 font-mono text-[.65rem] uppercase tracking-[.14em] text-text3",
            className
          )}
        >
          Realizado
        </span>
      );
  }
}
