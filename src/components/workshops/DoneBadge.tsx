"use client";

import { Check } from "lucide-react";
import { useWorkshopProgress } from "./WorkshopProgress";

/**
 * Sello "Hecho" para un workshop que la persona ya marcó (talleres presenciales; la ruta tiene el suyo). El texto va en
 * `text2` y no en `text3`: sobre el lienzo `text3` no llega a 4.5:1 (3.5:1 en claro, 4.3:1 en oscuro) y "hecho" se leía como
 * deshabilitado. Los sellos de la ruta, las cajas y el panel de la página del taller usan el mismo color.
 */
export function DoneBadge({ slug, className = "" }: { slug: string; className?: string }) {
  const { completed } = useWorkshopProgress();
  if (!completed.has(slug)) return null;
  return (
    <span
      className={`inline-flex -rotate-3 items-center gap-1 border border-text/30 bg-bg px-2 py-1 font-mono text-[.66rem] font-semibold uppercase tracking-[.18em] text-text2 ${className}`}
    >
      <Check size={11} aria-hidden="true" /> Hecho
    </span>
  );
}
