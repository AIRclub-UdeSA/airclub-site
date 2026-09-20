"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";

// Fallback visual mientras carga el bundle 3D WebGL (mantiene proporciones exactas sin layout shift)
function FallbackArm() {
  return (
    <div className="w-full h-full flex items-center justify-center animate-pulse opacity-80" aria-hidden="true">
      <svg viewBox="0 0 100 240" className="h-full w-auto max-h-full" fill="none">
        <rect x="25" y="220" width="50" height="16" rx="4" fill="#1c1619" />
        <rect x="35" y="200" width="30" height="22" rx="4" fill="#2a2226" />
        <rect x="42" y="110" width="16" height="92" rx="8" fill="#a40c4c" />
        <circle cx="50" cy="108" r="10" fill="#e0dadf" />
        <rect x="44" y="40" width="12" height="70" rx="6" fill="#2a2226" />
        <circle cx="50" cy="38" r="8" fill="#e0dadf" />
        <rect x="40" y="24" width="20" height="12" rx="3" fill="#a40c4c" />
        <path d="M42 24 L38 12 M58 24 L62 12" stroke="#1c1619" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const RobotArm3D = dynamic(() => import("./RobotArm3D"), {
  ssr: false,
  loading: () => <FallbackArm />,
});

export function ArmHero() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleEnter = () => {
    setIsClicked(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("air-enter-club"));
    }
    setTimeout(() => {
      document.getElementById("contenido")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => setIsClicked(false), 800);
    }, 150);
  };

  return (
    <section className="arm-gate-screen select-none" aria-label="Pantalla de bienvenida AIR Club">
      <div className="relative arm-stage-row">
        <span className="hero-letter">A</span>
        {/* Espaciador tipográfico para mantener el kerning exacto del logo AIR */}
        <div className="arm-canvas-container pointer-events-none" />
        <span className="hero-letter">R</span>

        {/* Escenario 3D interactivo que abarca el ancho de la pantalla pero respeta la altura exacta del stage sin tapar el botón */}
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-auto flex items-end justify-center">
          <RobotArm3D isHovered={isHovered} isClicked={isClicked} />
        </div>
      </div>

      {/* Gate Action: Botón de entrada al club estilo Flying Papers */}
      <div className="mt-12 sm:mt-16 flex flex-col items-center">
        <button
          type="button"
          onClick={handleEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="gate-action-btn group"
        >
          <span>Entrar al club</span>
          <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-1" />
        </button>
      </div>
    </section>
  );
}

