"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARM_HERO_STILL } from "./arm-hero-still";

// Cuanto tiempo conviven la foto fija y el brazo 3D (ya montado y "congelado" en la misma pose)
// antes de sacar la foto y soltarle la animación al brazo. Ver el flujo completo en ArmHero() más
// abajo: no alcanza con reaccionar al primer frame porque ese frame podría tardar en llegar (WebGL
// inicializando) o el navegador podría trabarse un instante justo después; este colchón asegura que
// cuando la foto se va, siempre hay algo ya estable debajo, no una animación a mitad de arrancar.
const HANDOFF_DELAY_MS = 500;

// Imagen fija mientras carga el brazo 3D WebGL: es una captura del propio RobotArm3D en su pose de
// reposo exacta (REST_POSE en RobotArm3D.tsx), no un dibujo aparte, asi que mientras el brazo esta
// "congelado" en esa misma pose son pixel a pixel el mismo frame. Va como data URI (no como archivo
// en /public) para que aparezca en el mismo frame que el resto del bundle, sin un request de red
// aparte que la demore. Para regenerarla si REST_POSE cambia: activar temporalmente
// `preserveDrawingBuffer: true` en el Canvas de RobotArm3D.tsx, forzar `frozen` y capturar el
// canvas del brazo (sin las letras A/R de al lado) con fondo transparente, y volver a correr el
// script que arma arm-hero-still.ts a partir de ese PNG.
function ArmStillImage({ ready }: { ready: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-out",
        ready ? "opacity-0" : "opacity-100"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- data URI: no aplica optimizacion de next/image */}
      <img src={ARM_HERO_STILL} alt="" className="h-full w-auto max-h-full object-contain" />
    </div>
  );
}

const RobotArm3D = dynamic(() => import("./RobotArm3D"), {
  ssr: false,
  loading: () => null,
});

export function ArmHero() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // 1. armPainted: RobotArm3D ya montó y pintó su primer frame, congelado en la misma pose que
  //    la foto (frozen=true mientras animationEnabled sea false) — conviven siendo indistinguibles.
  // 2. Tras HANDOFF_DELAY_MS ahí conviviendo sin sobresaltos: se saca la foto (arm3dReady) y se
  //    suelta la animación (animationEnabled) al mismo tiempo, así el brazo empieza a moverse
  //    justo cuando ya no queda nada tapando el canvas.
  const [armPainted, setArmPainted] = useState(false);
  const [arm3dReady, setArm3dReady] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(false);

  useEffect(() => {
    if (!armPainted) return;
    const id = setTimeout(() => {
      setArm3dReady(true);
      setAnimationEnabled(true);
    }, HANDOFF_DELAY_MS);
    return () => clearTimeout(id);
  }, [armPainted]);

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
      <div className="arm-stage-row">
        <span className="hero-letter">A</span>
        {/* El brazo robótico 3D interactivo formando la 'I' del logo AIR */}
        <div className="arm-canvas-container">
          <ArmStillImage ready={arm3dReady} />
          <RobotArm3D
            isHovered={isHovered}
            isClicked={isClicked}
            frozen={!animationEnabled}
            onReady={() => setArmPainted(true)}
          />
        </div>
        <span className="hero-letter">R</span>
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

