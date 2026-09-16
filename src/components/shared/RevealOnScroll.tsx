"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function RevealOnScroll({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay?: 1 | 2 | 3;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", delay === 1 && "reveal-d1", delay === 2 && "reveal-d2", delay === 3 && "reveal-d3", className)}
    >
      {children}
    </div>
  );
}
