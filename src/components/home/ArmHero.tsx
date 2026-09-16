"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { scrambleText } from "@/lib/scramble";

// Pose objetivo (la "i" del logo) y pose inicial (plegado).
const FINAL = { a0: 13, a1: -30, a2: 32, a3: -13, open: 1 };
const START = { a0: -42, a1: 104, a2: -118, a3: 46, open: 0.06 };
const GRIP = 44; // apertura maxima de la pinza, en grados

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function easeBack(t: number) {
  const c = 1.35;
  t = clamp(t, 0, 1);
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
function easeIO(t: number) {
  t = clamp(t, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function stag(p: number, from: number, to: number, ease: (t: number) => number) {
  return ease(clamp((p - from) / (to - from), 0, 1));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Transforms iniciales (pose START) para que el SSR ya renderice el brazo plegado,
// sin esperar al primer frame de JS.
const START_TRANSFORMS = {
  j0: `translate(200,628) rotate(${START.a0})`,
  j1: `translate(0,-150) rotate(${START.a1})`,
  j2: `translate(0,-130) rotate(${START.a2})`,
  j3: `translate(0,-99) rotate(${START.a3})`,
  f0: `rotate(${-GRIP * START.open})`,
  f1: `rotate(${GRIP * START.open})`,
};

export function ArmHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const j0Ref = useRef<SVGGElement>(null);
  const j1Ref = useRef<SVGGElement>(null);
  const j2Ref = useRef<SVGGElement>(null);
  const j3Ref = useRef<SVGGElement>(null);
  const f0Ref = useRef<SVGGElement>(null);
  const f1Ref = useRef<SVGGElement>(null);
  const letterARef = useRef<HTMLSpanElement>(null);
  const letterRRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const uniRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const heroFixedTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function pose(p: number, idleT: number) {
      const t0 = stag(p, 0.0, 0.62, easeBack);
      const t1 = stag(p, 0.1, 0.72, easeBack);
      const t2 = stag(p, 0.22, 0.82, easeBack);
      const t3 = stag(p, 0.36, 0.9, easeBack);
      const tf = stag(p, 0.55, 1.0, easeBack);

      const settled = p >= 1 && !reduced;
      const sway1 = settled ? Math.sin(idleT * 0.9) * 1.1 : 0;
      const sway2 = settled ? Math.sin(idleT * 0.9 + 1.2) * 0.8 : 0;

      const a0 = lerp(START.a0, FINAL.a0, t0);
      const a1 = lerp(START.a1, FINAL.a1, t1) + sway1;
      const a2 = lerp(START.a2, FINAL.a2, t2) + sway2;
      const a3 = lerp(START.a3, FINAL.a3, t3) - sway1 * 0.6;
      const open = lerp(START.open, FINAL.open, tf);

      j0Ref.current?.setAttribute("transform", `translate(200,628) rotate(${a0})`);
      j1Ref.current?.setAttribute("transform", `translate(0,-150) rotate(${a1})`);
      j2Ref.current?.setAttribute("transform", `translate(0,-130) rotate(${a2})`);
      j3Ref.current?.setAttribute("transform", `translate(0,-99) rotate(${a3})`);
      f0Ref.current?.setAttribute("transform", `rotate(${-GRIP * open})`);
      f1Ref.current?.setAttribute("transform", `rotate(${GRIP * open})`);
    }

    function getProgress() {
      const track = trackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const h = track.offsetHeight - window.innerHeight;
      if (h <= 0) return 1;
      return clamp(-rect.top / h, 0, 1);
    }

    if (reduced) {
      pose(1, 0);
      letterARef.current?.classList.add("on");
      letterRRef.current?.classList.add("on");
      subtitleRef.current?.classList.add("on");
      if (subtitleRef.current) subtitleRef.current.textContent = subtitleRef.current.dataset.scramble ?? "";
      uniRef.current?.classList.add("off");
      hintRef.current?.classList.add("hidden");
      heroFixedTextRef.current?.classList.add("visible");
      return;
    }

    let idleT = 0;
    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      idleT += 0.016;
      const p = getProgress();
      const armP = easeIO(clamp(p / 0.72, 0, 1));
      pose(armP, idleT);

      const showLetters = p > 0.72;
      letterARef.current?.classList.toggle("on", showLetters);
      letterRRef.current?.classList.toggle("on", showLetters);

      const subtitle = subtitleRef.current;
      if (subtitle) {
        const shouldShow = p > 0.78;
        subtitle.classList.toggle("on", shouldShow);
        if (shouldShow && !subtitle.dataset.scrambled) {
          subtitle.dataset.scrambled = "1";
          scrambleText(subtitle, subtitle.dataset.scramble ?? subtitle.textContent ?? "", 700);
        } else if (!shouldShow) {
          delete subtitle.dataset.scrambled;
        }
      }

      uniRef.current?.classList.toggle("off", p > 0.15);
      hintRef.current?.classList.toggle("hidden", p > 0.05);
      heroFixedTextRef.current?.classList.toggle("visible", p > 0.85);
    }
    frame();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="arm-scroll-track" ref={trackRef}>
      <div className="arm-sticky">
        <div className="arm-overlay">
          <div className="arm-university" ref={uniRef}>
            Universidad de San Andrés
          </div>
          <div className="arm-stage-row">
            <span className="hero-letter" ref={letterARef}>
              A
            </span>
            {/* El brazo ES la i */}
            <svg id="armSvg" viewBox="80 0 240 720" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <defs>
                <g id="segBody">
                  <rect x="-19" y="-150" width="38" height="150" rx="19" fill="#c9748e" />
                  <rect x="-8" y="-132" width="9" height="98" rx="4.5" fill="#f2cdd9" transform="rotate(3)" />
                </g>
              </defs>

              <g id="armBase">
                <rect x="140" y="668" width="120" height="26" rx="4" fill="#5a2130" />
                <path d="M155 668 a45 42 0 0 1 90 0 z" fill="#8a3b52" />
                <circle cx="200" cy="650" r="15" fill="#f2cdd9" />
                <circle cx="200" cy="650" r="15" fill="none" stroke="#5a2130" strokeWidth="5" />
              </g>

              <g ref={j0Ref} transform={START_TRANSFORMS.j0}>
                <use href="#segBody" />
                <circle r="24" fill="#6b2d3e" />
                <circle r="13" fill="#a44b62" />
                <circle r="5.5" fill="#3c1220" />

                <g ref={j1Ref} transform={START_TRANSFORMS.j1}>
                  <g transform="scale(.9,.87)">
                    <use href="#segBody" />
                  </g>
                  <circle r="21" fill="#6b2d3e" />
                  <circle r="11" fill="#a44b62" />
                  <circle r="4.8" fill="#3c1220" />

                  <g ref={j2Ref} transform={START_TRANSFORMS.j2}>
                    <g transform="scale(.78,.66)">
                      <use href="#segBody" />
                    </g>
                    <circle r="17" fill="#6b2d3e" />
                    <circle r="9" fill="#a44b62" />
                    <circle r="4" fill="#3c1220" />

                    <g ref={j3Ref} transform={START_TRANSFORMS.j3}>
                      <g transform="scale(.6,.34)">
                        <use href="#segBody" />
                      </g>
                      <circle r="13" fill="#6b2d3e" />
                      <circle r="6.5" fill="#a44b62" />
                      <circle r="3" fill="#3c1220" />

                      {/* Cabeza + pinza de 2 dedos (gancho en L, como una garra mecanica real) */}
                      <g transform="translate(0,-51)">
                        <circle r="15" fill="#6b2d3e" />
                        <circle r="8" fill="#c9748e" />
                        <circle r="3.4" fill="#3c1220" />
                        <g ref={f0Ref} transform={START_TRANSFORMS.f0}>
                          <line x1="0" y1="0" x2="0" y2="-34" stroke="#b05a74" strokeWidth="8" strokeLinecap="round" />
                          <circle cy="-34" r="6.5" fill="#6b2d3e" />
                          <line x1="0" y1="-34" x2="10" y2="-34" stroke="#8a3b52" strokeWidth="7" strokeLinecap="round" />
                          <circle cx="10" cy="-34" r="5" fill="#8a3b52" />
                        </g>
                        <g ref={f1Ref} transform={START_TRANSFORMS.f1}>
                          <line x1="0" y1="0" x2="0" y2="-34" stroke="#b05a74" strokeWidth="8" strokeLinecap="round" />
                          <circle cy="-34" r="6.5" fill="#6b2d3e" />
                          <line x1="0" y1="-34" x2="-10" y2="-34" stroke="#8a3b52" strokeWidth="7" strokeLinecap="round" />
                          <circle cx="-10" cy="-34" r="5" fill="#8a3b52" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            <span className="hero-letter" ref={letterRRef}>
              R
            </span>
          </div>
          <div className="hero-subtitle" ref={subtitleRef} data-scramble="Artificial Intelligence & Robotics Club">
            Artificial Intelligence &amp; Robotics Club
          </div>
        </div>

        <div className="scroll-hint" ref={hintRef}>
          <span>scroll</span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7" cy="6" r="2" fill="currentColor">
              <animate attributeName="cy" values="6;13;6" dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <div className="hero-fixed-text" ref={heroFixedTextRef}>
          <p className="mb-5.5 text-[1rem] leading-[1.7] text-text2">
            Inteligencia artificial y robótica, en comunidad.
            <br />
            Robótica móvil · Navegación autónoma · IA aplicada.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/eventos"
              className="border-trail relative inline-flex items-center gap-2 overflow-hidden rounded-full border-[1.5px] border-crimson bg-crimson px-6.5 py-3.5 font-body text-[.88rem] font-medium text-white transition-all duration-350 ease-club hover:-translate-y-0.5 hover:border-magenta hover:bg-magenta hover:shadow-[0_8px_30px_rgba(164,12,76,0.3)]"
            >
              Ver eventos
            </Link>
            <a
              href="#nosotros"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("nosotros")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-border-h px-6.5 py-3.5 font-body text-[.88rem] font-medium text-text transition-all duration-350 ease-club hover:-translate-y-0.5 hover:bg-card-h"
            >
              Quiénes somos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
