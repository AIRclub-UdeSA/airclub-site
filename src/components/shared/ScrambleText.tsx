"use client";

import { useEffect, useRef } from "react";
import { scrambleText } from "@/lib/scramble";

export function ScrambleText({
  text,
  as: Tag = "span",
  className,
}: {
  text: string;
  as?: "span" | "h1" | "h2";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    return scrambleText(el, text, 650);
  }, [text]);

  return (
    // @ts-expect-error -- ref type varies with the polymorphic `as` tag
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
