"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-crimson text-white shadow-[0_4px_16px_rgba(164,12,76,0.3)] transition-all hover:-translate-y-0.5 hover:bg-magenta",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
