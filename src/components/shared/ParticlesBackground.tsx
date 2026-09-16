"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  sx: number;
  sy: number;
  o: number;
  c: string;
};

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const mobile = matchMedia("(max-width: 768px)").matches;
    const mouse = { x: -1000, y: -1000 };

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    document.addEventListener("mousemove", onMouseMove);

    function makeParticle(): Particle {
      const colors = ["164,12,76", "143,82,97", "192,140,148"];
      const r = Math.random();
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * 1.8 + 0.4,
        sx: (Math.random() - 0.5) * 0.35,
        sy: (Math.random() - 0.5) * 0.35,
        o: Math.random() * 0.45 + 0.12,
        c: r > 0.6 ? colors[0] : r > 0.5 ? colors[1] : colors[2],
      };
    }

    const count = Math.min(mobile ? 45 : 100, Math.floor((window.innerWidth * window.innerHeight) / 14000));
    const particles: Particle[] = Array.from({ length: count }, makeParticle);

    function updateAndDraw(p: Particle) {
      p.x += p.sx;
      p.y += p.sy;
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 130) {
        const f = (130 - d) / 130;
        p.x -= dx * f * 0.015;
        p.y -= dy * f * 0.015;
        p.o = Math.min(p.o + 0.02, 0.5);
      }
      if (p.x < 0 || p.x > canvas!.width || p.y < 0 || p.y > canvas!.height) {
        Object.assign(p, makeParticle());
      }
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${p.c},${p.o})`;
      ctx!.fill();
    }

    function drawLines() {
      if (mobile) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(164,12,76,${(1 - d / 110) * 0.13})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    }

    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach(updateAndDraw);
      drawLines();
    }
    if (count > 0) frame();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
