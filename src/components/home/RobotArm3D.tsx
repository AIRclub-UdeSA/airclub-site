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

    // 4. Muñeca estabilizada sin torsiones invertidas
    if (wristRef.current) {
      const targetWristZ = 0.06 + ptrY * 0.12 - clickPitch * 0.5;
      wristRef.current.rotation.z = THREE.MathUtils.lerp(wristRef.current.rotation.z, targetWristZ, delta * 7);
      wristRef.current.rotation.x = THREE.MathUtils.lerp(wristRef.current.rotation.x, 0, delta * 6);
    }

    // 5. Pinza bimanual paralela en rango mecánico seguro
    const gripDistance = isClicked ? 0.035 : isHovered ? 0.062 : 0.045 + Math.sin(t * 2.2) * 0.006;
    if (leftFingerRef.current && rightFingerRef.current) {
      leftFingerRef.current.position.x = THREE.MathUtils.lerp(leftFingerRef.current.position.x, -gripDistance, delta * 9);
      rightFingerRef.current.position.x = THREE.MathUtils.lerp(rightFingerRef.current.position.x, gripDistance, delta * 9);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ===== SOMBRA DE CONTACTO BASE (Grounded physical shadow) ===== */}
      <mesh position={[0, -0.986, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.38, 36]} />
        <meshBasicMaterial color="#000000" opacity={0.16} transparent />
      </mesh>

      {/* ===== BASE FIJA INDUSTRIAL (Pedestal mecanizado completo) ===== */}
      {/* Brida de apoyo circular inferior (Piso metálico) */}
      <mesh position={[0, -0.96, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.30, 0.34, 0.05, 36]} />
        <meshStandardMaterial color={TITANIUM} roughness={0.32} metalness={0.75} />
      </mesh>

      {/* Anillo de pernos / bisel en aluminio mecanizado */}
      <mesh position={[0, -0.918, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.30, 0.035, 36]} />
        <meshStandardMaterial color={ALUMINUM} roughness={0.2} metalness={0.88} />
      </mesh>

      {/* Anillo LED perimetral de status activo AIR */}
      <mesh position={[0, -0.895, 0]}>
        <torusGeometry args={[0.25, 0.01, 16, 40]} />
        <meshStandardMaterial color={ACCENT_GLOW} emissive={CRIMSON} emissiveIntensity={0.9} />
      </mesh>

      {/* Cuello cilíndrico de la base */}
      <mesh position={[0, -0.85, 0]} castShadow>
        <cylinderGeometry args={[0.20, 0.25, 0.10, 32]} />
        <meshStandardMaterial color={TITANIUM} roughness={0.28} metalness={0.7} />
      </mesh>

      {/* ===== TORRETA GIRATORIA (EJE 1 - YAW) ===== */}
      <group ref={baseRef} position={[0, -0.80, 0]}>
        {/* Cuerpo de la torreta */}
        <mesh position={[0, 0.07, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.20, 0.14, 32]} />
          <meshStandardMaterial color={TITANIUM} roughness={0.26} metalness={0.75} />
        </mesh>

        {/* Bridas laterales carmesí del soporte de hombro */}
        <mesh position={[0.11, 0.18, 0]} castShadow>
          <boxGeometry args={[0.04, 0.22, 0.17]} />
          <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
        </mesh>
        <mesh position={[-0.11, 0.18, 0]} castShadow>
          <boxGeometry args={[0.04, 0.22, 0.17]} />
          <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
        </mesh>

        {/* Eje pasante central cromado */}
        <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.26, 28]} />
          <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.92} />
        </mesh>

        {/* ===== HOMBRO (EJE 2 - PITCH) ===== */}
        <group ref={shoulderRef} position={[0, 0.18, 0]}>
          {/* BRAZO PRINCIPAL (LINK 1 - Chasis aerodinámico) */}
          <group position={[0, 0.36, 0]}>
            {/* Viga estructural derecha en Carmesí AIR */}
            <mesh position={[0.075, 0, 0]} castShadow>
              <boxGeometry args={[0.035, 0.70, 0.11]} />
              <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
            </mesh>
            {/* Viga estructural izquierda en Carmesí AIR */}
            <mesh position={[-0.075, 0, 0]} castShadow>
              <boxGeometry args={[0.035, 0.70, 0.11]} />
              <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
            </mesh>
            {/* Núcleo estructural interno en titanio satinado */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.10, 0.65, 0.07]} />
              <meshStandardMaterial color={SLATE_DARK} roughness={0.35} metalness={0.7} />
            </mesh>
            {/* Varillas de guía y refuerzo en aluminio pulido */}
            <mesh position={[0.098, 0, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.62, 16]} />
              <meshStandardMaterial color={ALUMINUM} roughness={0.18} metalness={0.88} />
            </mesh>
            <mesh position={[-0.098, 0, 0]}>
              <cylinderGeometry args={[0.007, 0.007, 0.62, 16]} />
              <meshStandardMaterial color={ALUMINUM} roughness={0.18} metalness={0.88} />
            </mesh>
          </group>

          {/* ===== CODO (EJE 3 - PITCH) ===== */}
          <group ref={elbowRef} position={[0, 0.72, 0]}>
            {/* Articulación de codo cilíndrica mecanizada */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.075, 0.075, 0.22, 28]} />
              <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.9} />
            </mesh>
            {/* Aros de retén laterales en carmesí */}
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.07, 0.012, 16, 28]} />
              <meshStandardMaterial color={CRIMSON_LIGHT} roughness={0.25} metalness={0.5} />
            </mesh>
            <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.07, 0.012, 16, 28]} />
              <meshStandardMaterial color={CRIMSON_LIGHT} roughness={0.25} metalness={0.5} />
            </mesh>

            {/* ANTEBRAZO (LINK 2 - Estructura de precisión) */}
            <group position={[0, 0.29, 0]}>
              {/* Caña central cilíndrica */}
              <mesh castShadow>
                <cylinderGeometry args={[0.055, 0.07, 0.56, 28]} />
                <meshStandardMaterial color={TITANIUM} roughness={0.3} metalness={0.7} />
              </mesh>
              {/* Cubierta superior esculpida en carmesí */}
              <mesh position={[0, 0.015, 0.04]} castShadow>
                <boxGeometry args={[0.085, 0.46, 0.032]} />
                <meshStandardMaterial color={CRIMSON} roughness={0.25} metalness={0.45} />
              </mesh>
              {/* Conducto flexible de señal */}
              <mesh position={[0, 0.015, -0.05]}>
                <cylinderGeometry args={[0.011, 0.011, 0.46, 16]} />
                <meshStandardMaterial color={ALUMINUM} roughness={0.2} metalness={0.8} />
              </mesh>
            </group>

            {/* ===== MUÑECA (EJES 4/5/6) ===== */}
            <group ref={wristRef} position={[0, 0.58, 0]}>
              {/* Rodamiento de muñeca */}
              <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.045, 0.055, 0.06, 24]} />
                <meshStandardMaterial color={CHROME} roughness={0.15} metalness={0.92} />
              </mesh>
              {/* Placa de anclaje de la pinza */}
              <mesh position={[0, 0.075, 0]} castShadow>
                <boxGeometry args={[0.16, 0.035, 0.09]} />
                <meshStandardMaterial color={CRIMSON} roughness={0.28} metalness={0.5} />
              </mesh>

              {/* Sensor óptico central LED */}
              <mesh position={[0, 0.09, 0.04]}>
                <sphereGeometry args={[0.014, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive={ACCENT_GLOW} emissiveIntensity={1.8} />
              </mesh>

              {/* Guía lineal horizontal de la pinza */}
              <mesh position={[0, 0.105, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.011, 0.011, 0.18, 16]} />
                <meshStandardMaterial color={ALUMINUM} roughness={0.15} metalness={0.9} />
              </mesh>

              {/* ===== PINZA PARALELA INDUSTRIAL (Dedo Izquierdo) ===== */}
              <group ref={leftFingerRef} position={[-0.05, 0.12, 0]}>
                <mesh position={[0, 0.025, 0]} castShadow>
                  <boxGeometry args={[0.028, 0.045, 0.055]} />
                  <meshStandardMaterial color={TITANIUM} roughness={0.3} metalness={0.75} />
                </mesh>
                <mesh position={[0, 0.11, 0]} castShadow>
                  <boxGeometry args={[0.020, 0.15, 0.045]} />
                  <meshStandardMaterial color={ALUMINUM} roughness={0.22} metalness={0.85} />
                </mesh>
                <mesh position={[0.009, 0.115, 0]}>
                  <boxGeometry args={[0.006, 0.11, 0.035]} />
                  <meshStandardMaterial color={CRIMSON} roughness={0.65} metalness={0.2} />
                </mesh>
              </group>

              {/* ===== PINZA PARALELA INDUSTRIAL (Dedo Derecho) ===== */}
              <group ref={rightFingerRef} position={[0.05, 0.12, 0]}>
                <mesh position={[0, 0.025, 0]} castShadow>
                  <boxGeometry args={[0.028, 0.045, 0.055]} />
                  <meshStandardMaterial color={TITANIUM} roughness={0.3} metalness={0.75} />
                </mesh>
                <mesh position={[0, 0.11, 0]} castShadow>
                  <boxGeometry args={[0.020, 0.15, 0.045]} />
                  <meshStandardMaterial color={ALUMINUM} roughness={0.22} metalness={0.85} />
                </mesh>
                <mesh position={[-0.009, 0.115, 0]}>
                  <boxGeometry args={[0.006, 0.11, 0.035]} />
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
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, -0.05, 3.85], fov: 36 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        {/* Iluminación de estudio multi-punto industrial */}
        <ambientLight intensity={1.35} />
        <directionalLight position={[4, 5, 4]} intensity={2.0} />
        <directionalLight position={[-4, 3, 3]} intensity={1.3} color="#e8eeff" />
        <directionalLight position={[0, 4, -4]} intensity={1.7} color="#ffffff" />
        <pointLight position={[0, -0.95, 1.2]} intensity={1.6} color={ACCENT_GLOW} distance={3.5} />

        <ArmModel isHovered={isHovered} isClicked={isClicked} />
      </Canvas>
    </div>
  );
}

