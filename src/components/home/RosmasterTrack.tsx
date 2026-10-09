"use client";

import { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/** La pista corre con el scroll: avanza exactamente lo que se scrollea, así el robot parece rodar sobre ella. */
function RunwayGrid({ reduced }: { reduced: boolean }) {
  const gridRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!gridRef.current) return;
    // La grilla se repite cada 4 unidades: el módulo hace el bucle sin saltos
    gridRef.current.position.x = reduced ? 0 : -((window.scrollY * 0.012) % 4);
  });

  return (
    <group ref={gridRef} position={[0, -0.75, 0]}>
      {/* Pista de prueba de alta velocidad con grilla rosa sobre fondo blanco */}
      <gridHelper args={[60, 40, "#ff2a6d", "#e8a4be"]} position={[0, 0, 0]} />
      {/* Línea guía central fluorescente */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 0.08]} />
        <meshBasicMaterial color="#ff2a6d" transparent opacity={0.75} />
      </mesh>
      {/* Sombra sutil de contacto para apoyar el robot en el suelo */}
      <mesh receiveShadow position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 24]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
    </group>
  );
}

const emptySubscribe = () => () => {};

export function RosmasterTrack() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const reduced = usePrefersReducedMotion();
  const bandRef = useRef<HTMLElement>(null);
  // Sin banda a la vista no se dibuja nada: el canvas deja de gastar GPU fuera de pantalla.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={bandRef}
      id="rosmaster-track"
      data-seam="slalom"
      className="relative w-full bg-[#0e0407] py-4 sm:py-8 overflow-hidden select-none"
      aria-label="ROSMASTER X3 CAD"
    >
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px]">
        {mounted ? (
          <Canvas
            camera={{ position: [0, 1.8, 6.2], fov: 42 }}
            shadows
            frameloop={inView ? "always" : "never"}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={1.4} />
            <hemisphereLight args={["#ffffff", "#f5ccd8", 1.2]} />
            <directionalLight
              position={[8, 14, 6]}
              intensity={2.2}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-4, 3, 2]} intensity={2.0} color="#ff2a6d" />
            <pointLight position={[4, 2, -2]} intensity={1.5} color="#a40c4c" />

            {/* Grid de pista continua en rosa */}
            <RunwayGrid reduced={reduced} />

            {/* El robot no vive acá: lo dibuja SeamRobot, que cruza la banda sobre esta pista */}
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-[.74rem] uppercase tracking-widest text-[#a40c4c]/40 animate-pulse">
              Cargando modelo CAD...
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
