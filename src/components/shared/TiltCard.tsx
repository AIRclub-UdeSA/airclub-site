"use client";

import { useRef } from "react";

export function TiltCard({
  children,
  max = 6,
  scale = 1.015,
  lift = 5,
  className,
}: {
  children: React.ReactNode;
  max?: number;
  scale?: number;
  lift?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  function canTilt() {
    return matchMedia("(hover: hover) and (pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function onMouseEnter() {
    if (!canTilt() || !ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
    ref.current.style.transition = "transform .12s ease-out";
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!canTilt() || !ref.current) return;
    if (!rectRef.current) rectRef.current = ref.current.getBoundingClientRect();
    const rect = rectRef.current;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    ref.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale}) translateY(${-lift}px)`;
  }

  function onMouseLeave() {
    if (!ref.current) return;
    ref.current.style.transition = "transform .5s cubic-bezier(.4,0,.2,1)";
    ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)";
    rectRef.current = null;
  }

  return (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      className={className}
    >
      {children}
    </div>
  );
}
