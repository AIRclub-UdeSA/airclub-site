"use client";

import { Canvas } from "@react-three/fiber";

/**
 * La pista, fija: el piso no se mueve. Antes corría con el scroll y, con el robot y los conos encima, se veían
 * deslizarse sobre un piso que se iba para otro lado.
 */
function RunwayGrid() {
  return (
    <group position={[0, -0.75, 0]}>
      {/* Pista de prueba de alta velocidad con grilla rosa sobre fondo blanco */}
      <gridHelper args={[60, 40, "#ff2a6d", "#e8a4be"]} position={[0, 0, 0]} />
      {/* Línea guía central fluorescente */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 0.08]} />
        <meshBasicMaterial color="#ff2a6d" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

/** El canvas de la pista de RosmasterTrack. Va en su propio archivo para que three y fiber se bajen recién cerca de la banda. */
export function RunwayCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 1.8, 6.2], fov: 42 }}
      // Fija: se dibuja al cargar y al cambiar de tamaño, no en cada cuadro
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.4} />
      <hemisphereLight args={["#ffffff", "#f5ccd8", 1.2]} />
      <directionalLight position={[8, 14, 6]} intensity={2.2} />
      <pointLight position={[-4, 3, 2]} intensity={2.0} color="#ff2a6d" />
      <pointLight position={[4, 2, -2]} intensity={1.5} color="#a40c4c" />

      {/* Grid de pista continua en rosa */}
      <RunwayGrid />

      {/* El robot no vive acá: lo dibuja SeamRobot, que cruza la banda sobre esta pista */}
    </Canvas>
  );
}
