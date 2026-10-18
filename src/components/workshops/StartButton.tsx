"use client";

import { ArrowDown } from "lucide-react";
import { scrollToTarget } from "@/lib/smooth-scroll";

/** Baja a las cajas de los workshops con scroll suave (Lenis, o el nativo si no está activo), no con un salto de ancla. */
export function StartButton({ target, children, tone = "crimson" }: { target: string; children: React.ReactNode; tone?: "crimson" | "light" }) {
  return (
    <a
      href={target}
      onClick={(e) => {
        e.preventDefault();
        scrollToTarget(target, 1.5);
      }}
      className={`group inline-flex items-center gap-3 rounded-full px-7 py-4 font-mono text-[.8rem] font-semibold uppercase tracking-[.16em] transition-colors ${
        tone === "light" ? "bg-white text-crimson-text hover:bg-white/90" : "bg-crimson text-white hover:bg-crimson-hover"
      }`}
    >
      <span>{children}</span>
      <ArrowDown size={16} aria-hidden="true" className="transition-transform group-hover:translate-y-0.5 motion-reduce:transition-none" />
    </a>
  );
}
