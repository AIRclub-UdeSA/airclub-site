"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Precarga del modelo CAD oficial
useGLTF.preload("/models/rosmaster_unified.glb");

function CadRobot({ speedBoost }: { speedBoost: boolean }) {
  const { scene } = useGLTF("/models/rosmaster_unified.glb");
  const robotRigRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Object3D[]>([]);
  const lidarRef = useRef<THREE.Object3D | null>(null);

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

    const detectedWheels: THREE.Object3D[] = [];

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

      if (child.name && child.name.toLowerCase().includes("wheel")) {
        detectedWheels.push(child);
      }
    });

    wheelsRef.current = detectedWheels;
    lidarRef.current = root.getObjectByName("lidar_sensor") || null;

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

  // Animación continua de avance a alta velocidad y rotación de actuadores
  const progressRef = useRef(-4);

  useFrame((state, delta) => {
    const speed = speedBoost ? 7.2 : 4.4;
    // Ancho visible exacto del viewport a z=0 para que entre y salga sin pausas vacías
    const bound = Math.max(state.viewport.width / 2 + 1.5, 4.8);

    // Avance de la pista en X
    progressRef.current += delta * speed;
    if (progressRef.current > bound) {
      progressRef.current = -bound; // Reinicio dinámico exacto al salir por la derecha
    }

    if (robotRigRef.current) {
      robotRigRef.current.position.x = progressRef.current;
      // Posicionado estrictamente encima de la grilla (-0.75) con vibración de suspensión
      robotRigRef.current.position.y = -0.745 + Math.abs(Math.sin(state.clock.elapsedTime * 24)) * 0.008;
      robotRigRef.current.rotation.z = -0.03; // Pitch leve hacia adelante
      // Rotado hacia la derecha (+X) con ligera inclinación hacia la cámara (3/4 dinámico)
      robotRigRef.current.rotation.y = Math.PI / 2 + 0.28;
    }

    // Rotación de ruedas mecanum con el avance (eje de rodamiento hacia adelante)
    wheelsRef.current.forEach((w) => {
      w.rotation.y += delta * speed * 3.2;
    });

    // Rotación rápida del escáner LiDAR 360°
    if (lidarRef.current) {
      lidarRef.current.rotation.y += delta * 16;
    }
  });

  return (
    <group ref={robotRigRef} position={[-10, -0.745, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

function RunwayGrid() {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.position.x -= delta * 3.8;
      if (gridRef.current.position.x < -4) {
        gridRef.current.position.x = 0;
      }
    }
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

export function RosmasterTrack() {
  const [mounted, setMounted] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="rosmaster-track"
      className="relative w-full bg-white dark:bg-[#0e0407] border-y border-border py-4 sm:py-8 overflow-hidden select-none"
      aria-label="ROSMASTER X3 CAD"
    >
      <div
        className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setSpeedBoost(true)}
        onMouseLeave={() => setSpeedBoost(false)}
      >
        {mounted ? (
          <Canvas
            camera={{ position: [0, 1.8, 6.2], fov: 42 }}
            shadows
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
            <RunwayGrid />

            {/* Robot CAD animado sin círculos ni elementos sobrantes */}
            <CadRobot speedBoost={speedBoost} />
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
