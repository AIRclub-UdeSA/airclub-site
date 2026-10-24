import { clsx } from "clsx";
import { FEEDBACK_STATUS_LABELS, type FeedbackStatusId } from "@/lib/feedback/rules";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

export function formatFeedbackDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(date);
}

/** Lo nuevo resalta en carmesí; lo cerrado (resuelto o descartado) queda apagado. */
export function StatusBadge({ status }: { status: FeedbackStatusId }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-wide",
        status === "NUEVO" && "bg-crimson text-white",
        status === "EN_CURSO" && "border border-crimson text-crimson-text",
        (status === "RESUELTO" || status === "DESCARTADO") && "border border-border text-text3",
      )}
    >
      {FEEDBACK_STATUS_LABELS[status]}
    </span>
  );
}
