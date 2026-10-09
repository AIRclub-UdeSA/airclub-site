"use client";

import { useRef, useMemo, useState, useEffect, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

// Precarga del modelo CAD oficial
useGLTF.preload("/models/rosmaster_unified.glb");

/** Avance de la banda por la ventana: 0 cuando asoma por abajo, 1 cuando sale por arriba. */
function bandProgress(el: HTMLElement | null) {
  if (!el) return 0.5;
  const r = el.getBoundingClientRect();
  return Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
}

/** El tramo se recorre con el scroll de la página: el robot entra por la izquierda, cruza y sale por la derecha. */
function CadRobot({ bandRef, reduced }: { bandRef: RefObject<HTMLElement | null>; reduced: boolean }) {
  const { scene } = useGLTF("/models/rosmaster_unified.glb");
  const robotRigRef = useRef<THREE.Group>(null);

  // Clona la escena para aislar modificaciones de materiales y nodos
  const cloned = useMemo(() => {
    const root = scene.clone(true);

    // Ajuste específico de la cámara Orbbec Astra heredado de jar_site
    const rgbd = root.getObjectByName("rgbd_camera");
    if (rgbd) rgbd.position.z = -10;

    // Repintado con la paleta de identidad AIR Club
    const crimsonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#a40c4c"), // Carmesí oficial AIR Club
      roughness: 0.32,
      metalness: 0.72,
      envMapIntensity: 1.4,
    });

    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#b8828e"), // Titanio satinado rosado
      roughness: 0.3,
      metalness: 0.85,
    });

    const steelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c8d0d5"), // Acero maquinado
      roughness: 0.25,
      metalness: 0.9,
    });

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#161619"), // Fibra de carbono negra
      roughness: 0.75,
      metalness: 0.25,
    });

    const lidarMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a0612"), // Obsidiana vino para LiDAR
      roughness: 0.38,
      metalness: 0.6,
    });

    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const mat = mesh.material as THREE.Material;
        const matName = mat?.name || "";

        if (matName === "Chassis_Green") {
          mesh.material = crimsonMaterial;
        } else if (matName === "Standoff_Brass") {
          mesh.material = titaniumMaterial;
        } else if (matName === "Motor_Steel") {
          mesh.material = steelMaterial;
        } else if (matName === "Wheel_Carbon") {
          mesh.material = carbonMaterial;
        } else if (matName === "Lidar_Black") {
          mesh.material = lidarMaterial;
        }
      }
    });

    // Normalización y centrado de escala del CAD (1.32 unidades de referencia)
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.4 / maxDim;

    root.scale.setScalar(scale);
    // Alineamos el centro en X y Z a 0, y fijamos la base más baja de las ruedas exactamente en y = 0
    root.position.x = -center.x * scale;
    root.position.y = -box.min.y * scale;
    root.position.z = -center.z * scale;

    return root;
  }, [scene]);

  // La posición sale del scroll (no del reloj): al frenar el scroll el robot frena, y al volver hacia arriba retrocede.
  const xRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    // Ancho visible exacto del viewport a z=0 para que entre y salga sin pausas vacías
    const bound = Math.max(state.viewport.width / 2 + 1.5, 4.8);
    const target = reduced ? 0 : -bound + bandProgress(bandRef.current) * bound * 2;
    const prev = xRef.current ?? target;
    // Amortiguado: el robot tiene masa y no copia el scroll de golpe
    const x = prev + (target - prev) * (1 - Math.exp(-delta * 7));
    xRef.current = x;
    const speed = Math.abs(x - prev) / Math.max(delta, 1e-3);

    if (robotRigRef.current) {
      robotRigRef.current.position.x = x;
      // Posicionado estrictamente encima de la grilla (-0.75); la suspensión vibra solo mientras avanza
      robotRigRef.current.position.y = -0.745 + Math.abs(Math.sin(state.clock.elapsedTime * 24)) * 0.008 * Math.min(1, speed);
      robotRigRef.current.rotation.z = -0.03; // Pitch leve hacia adelante
      // Rotado hacia la derecha (+X) con ligera inclinación hacia la cámara (3/4 dinámico)
      robotRigRef.current.rotation.y = Math.PI / 2 + 0.28;
    }
  });

  return (
    <group ref={robotRigRef} position={[-10, -0.745, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

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

            {/* Robot CAD: avanza con el scroll de la página */}
            <CadRobot bandRef={bandRef} reduced={reduced} />
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
