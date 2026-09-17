"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Paleta industrial refinada AIR Club
const CRIMSON = "#a40c4c";
const CRIMSON_LIGHT = "#be185d";
const TITANIUM = "#2f2d33";
const SLATE_DARK = "#423f47";
const ALUMINUM = "#dce0e6";
const CHROME = "#f0f2f6";
const ACCENT_GLOW = "#ff2a6d";

function ArmModel({ isHovered, isClicked }: { isHovered: boolean; isClicked: boolean }) {
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const leftFingerRef = useRef<THREE.Group>(null);
  const rightFingerRef = useRef<THREE.Group>(null);

  // Animación física y respuesta interactiva al cursor
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const ptrX = state.pointer.x; // -1 to 1
    const ptrY = state.pointer.y; // -1 to 1

    // Respiración idle suave y orgánica
    const idleSwayX = Math.sin(t * 1.4) * 0.035;
    const idleSwayY = Math.cos(t * 1.6) * 0.025;

    // Movimiento reactivo al hacer click en "Entrar al club"
    const clickPitch = isClicked ? 0.28 : 0;

    // 1. Base giratoria (Yaw)
    if (baseRef.current) {
      const targetBaseY = -ptrX * 0.45 + idleSwayX;
      baseRef.current.rotation.y = THREE.MathUtils.lerp(baseRef.current.rotation.y, targetBaseY, delta * 6);
    }

    // 2. Articulación hombro (Pitch)
    if (shoulderRef.current) {
      const targetShoulderZ = 0.06 + ptrY * 0.22 - clickPitch + idleSwayY;
      shoulderRef.current.rotation.z = THREE.MathUtils.lerp(shoulderRef.current.rotation.z, targetShoulderZ, delta * 6);
    }

    // 3. Articulación codo (Pitch inverso para balancear la pose de 'I')
    if (elbowRef.current) {
      const targetElbowZ = -0.12 - ptrY * 0.28 + clickPitch * 1.2 - idleSwayY * 0.7;
      elbowRef.current.rotation.z = THREE.MathUtils.lerp(elbowRef.current.rotation.z, targetElbowZ, delta * 6);
    }

    // 4. Muñeca
    if (wristRef.current) {
      const targetWristZ = 0.06 + ptrY * 0.12 - clickPitch * 0.5;
      wristRef.current.rotation.z = THREE.MathUtils.lerp(wristRef.current.rotation.z, targetWristZ, delta * 7);
      wristRef.current.rotation.x = THREE.MathUtils.lerp(wristRef.current.rotation.x, ptrX * 0.25, delta * 6);
    }

    // 5. Pinza bimanual paralela
    const gripDistance = isClicked ? 0.04 : isHovered ? 0.32 : 0.18 + Math.sin(t * 2.2) * 0.04;
    if (leftFingerRef.current && rightFingerRef.current) {
      leftFingerRef.current.position.x = THREE.MathUtils.lerp(leftFingerRef.current.position.x, -gripDistance, delta * 9);
      rightFingerRef.current.position.x = THREE.MathUtils.lerp(rightFingerRef.current.position.x, gripDistance, delta * 9);
    }
  });

  return (
    <group position={[0, -1.95, 0]}>
      {/* ===== BASE FIJA INDUSTRIAL (Pedestal mecanizado) ===== */}
      {/* Brida de apoyo circular inferior */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.54, 0.08, 36]} />
        <meshStandardMaterial color={TITANIUM} roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Anillo de pernos / mecanizado en aluminio */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.44, 0.47, 0.05, 36]} />
        <meshStandardMaterial color={ALUMINUM} roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Anillo LED perimetral de status */}
      <mesh position={[0, 0.14, 0]}>
        <torusGeometry args={[0.41, 0.015, 16, 40]} />
        <meshStandardMaterial color={ACCENT_GLOW} emissive={CRIMSON} emissiveIntensity={0.8} />
      </mesh>

      {/* Cuello cilíndrico de la base */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.14, 32]} />
        <meshStandardMaterial color={TITANIUM} roughness={0.3} metalness={0.65} />
      </mesh>

      {/* ===== TORRETA GIRATORIA (EJE 1 - YAW) ===== */}
      <group ref={baseRef} position={[0, 0.29, 0]}>
        {/* Cuerpo de la torreta */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.35, 0.24, 32]} />
          <meshStandardMaterial color={TITANIUM} roughness={0.28} metalness={0.7} />
        </mesh>

        {/* Bridas laterales carmesí del soporte de hombro */}
        <mesh position={[0.18, 0.35, 0]} castShadow>
          <boxGeometry args={[0.07, 0.36, 0.28]} />
          <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
        </mesh>
        <mesh position={[-0.18, 0.35, 0]} castShadow>
          <boxGeometry args={[0.07, 0.36, 0.28]} />
          <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
        </mesh>

        {/* Eje pasante central cromado */}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.44, 28]} />
          <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.92} />
        </mesh>

        {/* ===== HOMBRO (EJE 2 - PITCH) ===== */}
        <group ref={shoulderRef} position={[0, 0.35, 0]}>
          {/* BRAZO PRINCIPAL (LINK 1 - Chasis aerodinámico) */}
          <group position={[0, 0.68, 0]}>
            {/* Viga estructural derecha en Carmesí AIR */}
            <mesh position={[0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 1.3, 0.18]} />
              <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
            </mesh>
            {/* Viga estructural izquierda en Carmesí AIR */}
            <mesh position={[-0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.06, 1.3, 0.18]} />
              <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
            </mesh>
            {/* Núcleo estructural interno en titanio satinado */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.16, 1.22, 0.12]} />
              <meshStandardMaterial color={SLATE_DARK} roughness={0.35} metalness={0.7} />
            </mesh>
            {/* Varillas de guía y refuerzo en aluminio pulido */}
            <mesh position={[0.16, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.15, 16]} />
              <meshStandardMaterial color={ALUMINUM} roughness={0.18} metalness={0.88} />
            </mesh>
            <mesh position={[-0.16, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.15, 16]} />
              <meshStandardMaterial color={ALUMINUM} roughness={0.18} metalness={0.88} />
            </mesh>
          </group>

          {/* ===== CODO (EJE 3 - PITCH) ===== */}
          <group ref={elbowRef} position={[0, 1.35, 0]}>
            {/* Articulación de codo cilíndrica mecanizada */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.36, 28]} />
              <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.9} />
            </mesh>
            {/* Aros de retén laterales en carmesí */}
            <mesh position={[0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.12, 0.02, 16, 32]} />
              <meshStandardMaterial color={CRIMSON_LIGHT} roughness={0.25} metalness={0.5} />
            </mesh>
            <mesh position={[-0.19, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.12, 0.02, 16, 32]} />
              <meshStandardMaterial color={CRIMSON_LIGHT} roughness={0.25} metalness={0.5} />
            </mesh>

            {/* ANTEBRAZO (LINK 2 - Estructura cilíndrica de precisión) */}
            <group position={[0, 0.58, 0]}>
              {/* Caña central cilíndrica */}
              <mesh castShadow>
                <cylinderGeometry args={[0.09, 0.12, 1.08, 28]} />
                <meshStandardMaterial color={TITANIUM} roughness={0.3} metalness={0.7} />
              </mesh>
              {/* Cubierta superior esculpida en carmesí */}
              <mesh position={[0, 0.04, 0.07]} castShadow>
                <boxGeometry args={[0.14, 0.85, 0.05]} />
                <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
              </mesh>
              {/* Cableado / conducto flexible decorativo */}
              <mesh position={[0, 0, -0.09]}>
                <cylinderGeometry args={[0.02, 0.02, 0.9, 16]} />
                <meshStandardMaterial color={ALUMINUM} roughness={0.2} metalness={0.8} />
              </mesh>
            </group>

            {/* ===== MUÑECA (EJES 4/5/6) ===== */}
            <group ref={wristRef} position={[0, 1.16, 0]}>
              {/* Rodamiento de muñeca */}
              <mesh position={[0, 0.06, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.09, 0.12, 24]} />
                <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.92} />
              </mesh>
              {/* Placa de anclaje de la pinza */}
              <mesh position={[0, 0.16, 0]} castShadow>
                <boxGeometry args={[0.26, 0.08, 0.16]} />
                <meshStandardMaterial color={CRIMSON} roughness={0.28} metalness={0.5} />
              </mesh>

              {/* Sensor óptico central LED */}
              <mesh position={[0, 0.2, 0.07]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive={ACCENT_GLOW} emissiveIntensity={1.8} />
              </mesh>

              {/* Guía lineal horizontal de la pinza */}
              <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.28, 16]} />
                <meshStandardMaterial color={ALUMINUM} roughness={0.15} metalness={0.9} />
              </mesh>

              {/* ===== PINZA PARALELA INDUSTRIAL (Dedo Izquierdo) ===== */}
              <group ref={leftFingerRef} position={[-0.09, 0.24, 0]}>
                {/* Deslizador del dedo */}
                <mesh position={[0, 0.05, 0]} castShadow>
                  <boxGeometry args={[0.045, 0.08, 0.09]} />
                  <meshStandardMaterial color={TITANIUM} roughness={0.3} metalness={0.75} />
                </mesh>
                {/* Garra vertical */}
                <mesh position={[0, 0.18, 0]} castShadow>
                  <boxGeometry args={[0.035, 0.22, 0.07]} />
                  <meshStandardMaterial color={ALUMINUM} roughness={0.22} metalness={0.85} />
                </mesh>
                {/* Almohadilla de agarre interior en goma carmesí */}
                <mesh position={[0.016, 0.2, 0]}>
                  <boxGeometry args={[0.012, 0.16, 0.06]} />
                  <meshStandardMaterial color={CRIMSON} roughness={0.65} metalness={0.2} />
                </mesh>
              </group>

              {/* ===== PINZA PARALELA INDUSTRIAL (Dedo Derecho) ===== */}
              <group ref={rightFingerRef} position={[0.09, 0.24, 0]}>
                {/* Deslizador del dedo */}
                <mesh position={[0, 0.05, 0]} castShadow>
                  <boxGeometry args={[0.045, 0.08, 0.09]} />
                  <meshStandardMaterial color={TITANIUM} roughness={0.3} metalness={0.75} />
                </mesh>
                {/* Garra vertical */}
                <mesh position={[0, 0.18, 0]} castShadow>
                  <boxGeometry args={[0.035, 0.22, 0.07]} />
                  <meshStandardMaterial color={ALUMINUM} roughness={0.22} metalness={0.85} />
                </mesh>
                {/* Almohadilla de agarre interior en goma carmesí */}
                <mesh position={[-0.016, 0.2, 0]}>
                  <boxGeometry args={[0.012, 0.16, 0.06]} />
                  <meshStandardMaterial color={CRIMSON} roughness={0.65} metalness={0.2} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function RobotArm3D({
  isHovered = false,
  isClicked = false,
}: {
  isHovered?: boolean;
  isClicked?: boolean;
}) {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0.35, 4.4], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        {/* Iluminación de estudio multi-punto */}
        {/* Luz ambiental difusa para levantar sombras */}
        <ambientLight intensity={1.3} />

        {/* Luz principal (Key light) con temperatura neutra/cálida */}
        <directionalLight position={[4, 6, 5]} intensity={2.0} />

        {/* Luz de relleno fría opuesta (Fill light) */}
        <directionalLight position={[-4, 3, 3]} intensity={1.4} color="#e8eeff" />

        {/* Luz de recorte (Rim light) trasera superior para marcar silueta metálica */}
        <directionalLight position={[0, 5, -4]} intensity={1.8} color="#ffffff" />

        {/* Luz de acento carmesí inferior sutil de la marca */}
        <pointLight position={[0, -1.8, 1.5]} intensity={1.5} color={ACCENT_GLOW} distance={4} />

        <ArmModel isHovered={isHovered} isClicked={isClicked} />
      </Canvas>
    </div>
  );
}

