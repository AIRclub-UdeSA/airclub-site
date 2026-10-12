"use client";

import { Check } from "lucide-react";
import { useWorkshopProgress } from "./WorkshopProgress";

/** Sello "Hecho" para un workshop que la persona ya marcó (talleres presenciales; la ruta tiene el suyo). */
export function DoneBadge({ slug, className = "" }: { slug: string; className?: string }) {
  const { completed } = useWorkshopProgress();
  if (!completed.has(slug)) return null;
  return (
    <span
      className={`inline-flex -rotate-3 items-center gap-1 border border-text/30 bg-bg px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em] text-text3 ${className}`}
    >
      <Check size={11} aria-hidden="true" /> Hecho
    </span>
  );
}
