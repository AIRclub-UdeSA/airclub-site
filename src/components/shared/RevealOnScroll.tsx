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

    if (typeof window !== "undefined") {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("visible");
        return;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px -20px 0px" }
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
