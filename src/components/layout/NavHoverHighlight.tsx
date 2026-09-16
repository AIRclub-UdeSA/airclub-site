"use client";

import { useRef } from "react";

export function NavHoverHighlight({ children }: { children: React.ReactNode }) {
  const navRef = useRef<HTMLUListElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);

  function moveTo(el: HTMLElement) {
    const nav = navRef.current;
    const highlight = highlightRef.current;
    if (!nav || !highlight) return;
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    highlight.style.width = `${r.width}px`;
    highlight.style.height = `${r.height}px`;
    highlight.style.transform = `translate(${r.left - navRect.left}px, ${r.top - navRect.top}px)`;
    highlight.style.opacity = "1";
  }

  function hide() {
    if (highlightRef.current) highlightRef.current.style.opacity = "0";
  }

  return (
    <ul
      ref={navRef}
      className="relative flex items-center gap-6"
      onMouseLeave={hide}
      onMouseOver={(e) => {
        const target = (e.target as HTMLElement).closest("a");
        if (target) moveTo(target);
      }}
    >
      <span
        ref={highlightRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-0 h-0 w-0 rounded-lg bg-gradient-to-br from-[rgba(164,12,76,0.1)] to-[rgba(164,12,76,0.16)] opacity-0 transition-[transform,width,height,opacity] duration-300 ease-club"
      />
      {children}
    </ul>
  );
}
