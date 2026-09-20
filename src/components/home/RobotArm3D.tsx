"use client";

import { useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

// Paleta industrial refinada AIR Club
const CRIMSON = "#a40c4c";
const CRIMSON_LIGHT = "#be185d";
const TITANIUM = "#2f2d33";
const SLATE_DARK = "#423f47";
const ALUMINUM = "#dce0e6";
const CHROME = "#f0f2f6";
const ACCENT_GLOW = "#ff2a6d";
const BALL_LIME = "#d4f434"; // Lima tenis fluorescente de alta visibilidad

const FLOOR_Y = -0.921; // Altura física del centro de la pelota en reposo sobre el piso
const BALL_RADIUS = 0.065;

type BallState = "waiting" | "dropping" | "reaching" | "grabbed" | "dragged" | "thrown";

function solve2D(targetX: number, targetY: number) {
  const L1 = 0.72;
  const L2 = 0.62;
  const dx = targetX;
  const dy = targetY - (-0.62);
  const D = Math.hypot(dx, dy);
  const clampedD = THREE.MathUtils.clamp(D, 0.25, L1 + L2 - 0.02);

  const cosElbow = (clampedD * clampedD - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  const elAngle = Math.acos(THREE.MathUtils.clamp(cosElbow, -1, 1));

  const alpha = Math.atan2(dx, dy);
  const cosBeta = (L1 * L1 + clampedD * clampedD - L2 * L2) / (2 * L1 * clampedD);
  const beta = Math.acos(THREE.MathUtils.clamp(cosBeta, -1, 1));

  let shZ: number;
  let elZ: number;
  let wristZ: number;

  if (dx >= 0) {
    shZ = -(alpha + beta);
    elZ = elAngle;
    wristZ = -Math.PI - (shZ + elZ);
  } else {
    shZ = -(alpha - beta);
    elZ = -elAngle;
    wristZ = Math.PI - (shZ + elZ);
  }

  wristZ = Math.atan2(Math.sin(wristZ), Math.cos(wristZ));

  return { targetShoulderZ: shZ, targetElbowZ: elZ, targetWristZ: wristZ };
}

function InteractiveScene({ isHovered, isClicked }: { isHovered: boolean; isClicked: boolean }) {
  // Referencias mecánicas del brazo robótico
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const leftFingerRef = useRef<THREE.Group>(null);
  const rightFingerRef = useRef<THREE.Group>(null);

  // Referencias físicas y de malla de la pelota interactiva
  const ballMeshRef = useRef<THREE.Mesh>(null);
  const shadowMeshRef = useRef<THREE.Mesh>(null);

  const ballPos = useRef(new THREE.Vector3(0.65, 1.8, 0.28));
  const ballVel = useRef(new THREE.Vector3(0, 0, 0));
  const ballState = useRef<BallState>("waiting");
  const reachTimer = useRef(0);
  const isDragging = useRef(false);
  const dragHistory = useRef<{ x: number; y: number; t: number }[]>([]);

  // Iniciar la caída de la pelota tras ~2.0 segundos de contemplación del Hero
  useEffect(() => {
    const timeout = setTimeout(() => {
      ballPos.current.set(0.65, 1.8, 0.28);
      ballVel.current.set(-0.25, -0.6, 0);
      ballState.current = "dropping";
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Handlers para arrastrar y lanzar la pelota con el cursor
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = true;
    ballState.current = "dragged";
    ballVel.current.set(0, 0, 0);
    dragHistory.current = [
      { x: ballPos.current.x, y: ballPos.current.y, t: performance.now() }
    ];
    if (typeof document !== "undefined") {
      document.body.style.cursor = "grabbing";
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (typeof document !== "undefined") {
      document.body.style.cursor = "default";
    }
    if (ballState.current === "dragged") {
      isDragging.current = false;
      const h = dragHistory.current;
      if (h.length >= 2) {
        const first = h[0];
        const last = h[h.length - 1];
        const dt = Math.max((last.t - first.t) / 1000, 0.016);
        const vx = (last.x - first.x) / dt;
        const vy = (last.y - first.y) / dt;
        ballVel.current.set(
          THREE.MathUtils.clamp(vx * 1.05, -12, 12),
          THREE.MathUtils.clamp(vy * 1.05, -8, 14),
          0
        );
      } else {
        ballVel.current.set(0, 0, 0);
      }
      ballState.current = "thrown";
    }
  }, []);

  useEffect(() => {
    const onWindowPointerUp = () => {
      if (isDragging.current) {
        handlePointerUp();
      }
    };
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => window.removeEventListener("pointerup", onWindowPointerUp);
  }, [handlePointerUp]);

  // Loop de simulación física, cinemática y renderizado
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05); // Prevenir saltos por caída de framerate
    const t = state.clock.getElapsedTime();
    const ptrX = state.pointer.x; // -1 a 1
    const ptrY = state.pointer.y; // -1 a 1

    // 1. SIMULACIÓN FÍSICA DE LA PELOTA
    if (ballState.current === "dropping" || ballState.current === "thrown") {
      // Gravedad
      ballVel.current.y -= 12.0 * delta;
      ballPos.current.x += ballVel.current.x * delta;
      ballPos.current.y += ballVel.current.y * delta;
      ballPos.current.z = 0.28;

      // Colisión contra el suelo
      if (ballPos.current.y <= FLOOR_Y) {
        ballPos.current.y = FLOOR_Y;
        if (Math.abs(ballVel.current.y) > 0.35) {
          ballVel.current.y = -ballVel.current.y * 0.65; // Rebote elástico
          ballVel.current.x *= 0.82; // Fricción al impactar
        } else {
          ballVel.current.y = 0;
          ballVel.current.x *= 0.92; // Fricción por rodamiento
          if (Math.abs(ballVel.current.x) < 0.03) {
            ballVel.current.x = 0;
            // Asegurar que la pelota repose fuera del radio de la base para un alcance visual óptimo
            if (Math.abs(ballPos.current.x) < 0.38) {
              ballPos.current.x = ballPos.current.x >= 0 ? 0.46 : -0.46;
            }
            ballState.current = "reaching";
            reachTimer.current = 0;
          }
        }
      }

      // Rebote contra los laterales del escenario
      const boundX = Math.min(state.viewport.width / 2 - 0.2, 2.2);
      if (ballPos.current.x > boundX) {
        ballPos.current.x = boundX;
        ballVel.current.x = -Math.abs(ballVel.current.x) * 0.70;
      } else if (ballPos.current.x < -boundX) {
        ballPos.current.x = -boundX;
        ballVel.current.x = Math.abs(ballVel.current.x) * 0.70;
      }
    } else if (ballState.current === "dragged") {
      // Movimiento guiado en tiempo real por el cursor
      const halfW = state.viewport.width / 2;
      const halfH = state.viewport.height / 2;
      const worldX = THREE.MathUtils.clamp(state.pointer.x * halfW, -halfW + 0.2, halfW - 0.2);
      const worldY = THREE.MathUtils.clamp(state.pointer.y * halfH + 0.32, FLOOR_Y, 1.8);

      ballPos.current.x = worldX;
      ballPos.current.y = worldY;
      ballPos.current.z = 0.28;

      const now = performance.now();
      dragHistory.current.push({ x: worldX, y: worldY, t: now });
      while (dragHistory.current.length > 0 && now - dragHistory.current[0].t > 90) {
        dragHistory.current.shift();
      }
    }

    // Actualizar mallas 3D de la pelota y rotación
    if (ballMeshRef.current) {
      ballMeshRef.current.position.copy(ballPos.current);
      ballMeshRef.current.visible = ballState.current !== "waiting";
      if (ballState.current === "dragged" || ballState.current === "thrown" || ballState.current === "dropping") {
        ballMeshRef.current.rotation.z -= (ballVel.current.x !== 0 ? ballVel.current.x : 1) * delta * 4;
        ballMeshRef.current.rotation.x += delta * 3;
      }
    }

    // Sombra de contacto
    if (shadowMeshRef.current) {
      const heightAboveFloor = Math.max(ballPos.current.y - FLOOR_Y, 0);
      const shadowScale = Math.max(1 - heightAboveFloor * 0.45, 0.25);
      const shadowOpacity = Math.max(0.25 - heightAboveFloor * 0.12, 0.04);
      shadowMeshRef.current.position.set(ballPos.current.x, -0.985, ballPos.current.z);
      shadowMeshRef.current.scale.set(shadowScale, shadowScale, shadowScale);
      (shadowMeshRef.current.material as THREE.MeshBasicMaterial).opacity =
        ballState.current !== "waiting" ? shadowOpacity : 0;
    }

    // 2. CONTROL DE ARTICULACIONES DEL BRAZO (TARGET ANGLES & CLAMPS)
    let targetBaseY = 0;
    let targetShoulderZ = 0;
    let targetElbowZ = 0;
    let targetWristZ = 0;
    let targetGrip = 0.045; // Separación normal de reposo dentro del riel

    const idleSwayX = Math.sin(t * 1.4) * 0.03;
    const idleSwayY = Math.cos(t * 1.6) * 0.02;
    const clickPitch = isClicked ? 0.26 : 0;

    if (ballState.current === "waiting") {
      // Estado inicial: 'I' del logo AIR respondiendo elegantemente al cursor con límites seguros
      targetBaseY = THREE.MathUtils.clamp(-ptrX * 0.42 + idleSwayX, -0.65, 0.65);
      targetShoulderZ = THREE.MathUtils.clamp(0.06 + ptrY * 0.20 - clickPitch + idleSwayY, -0.30, 0.40);
      targetElbowZ = THREE.MathUtils.clamp(-0.12 - ptrY * 0.25 + clickPitch * 1.1 - idleSwayY * 0.7, -0.50, 0.25);
      targetWristZ = THREE.MathUtils.clamp(0.06 + ptrY * 0.10 - clickPitch * 0.5, -0.30, 0.30);
      targetGrip = isClicked ? 0.035 : isHovered ? 0.062 : 0.045 + Math.sin(t * 2.2) * 0.006;
    } else if (ballState.current === "reaching") {
      reachTimer.current += delta;

      // Base orientada suavemente hacia la pelota
      targetBaseY = THREE.MathUtils.clamp(ballPos.current.x * 0.35, -0.60, 0.60);

      // Cinemática inversa analítica exacta hacia la pelota en el suelo
      const ik = solve2D(ballPos.current.x, FLOOR_Y);
      targetShoulderZ = ik.targetShoulderZ;
      targetElbowZ = ik.targetElbowZ;
      targetWristZ = ik.targetWristZ;
      targetGrip = 0.065; // Abrir pinza para abarcar la pelota

      if (reachTimer.current > 0.95) {
        ballState.current = "grabbed";
      }
    } else if (ballState.current === "grabbed") {
      // El brazo sostiene y levanta la pelota hacia arriba con orgullo
      targetBaseY = Math.sin(t * 1.5) * 0.08;
      targetShoulderZ = -0.32 + Math.sin(t * 1.4) * 0.02;
      targetElbowZ = 0.78 + Math.cos(t * 1.4) * 0.02;
      targetWristZ = -0.28;
      targetGrip = 0.036; // Pinza firmemente cerrada sobre la pelota

      // La pelota sigue de forma exacta la punta de la pinza
      if (wristRef.current) {
        wristRef.current.updateWorldMatrix(true, false);
        const tipPos = new THREE.Vector3(0, 0.22, 0);
        wristRef.current.localToWorld(tipPos);
        ballPos.current.copy(tipPos);
      }
    } else if (ballState.current === "dragged" || ballState.current === "dropping" || ballState.current === "thrown") {
      // El brazo sigue con atención el vuelo o movimiento de la pelota
      targetBaseY = THREE.MathUtils.clamp(ballPos.current.x * 0.45, -0.75, 0.75);
      targetShoulderZ = THREE.MathUtils.clamp(-ballPos.current.x * 0.35 + (ballPos.current.y - 0.2) * 0.15, -0.7, 0.7);
      targetElbowZ = THREE.MathUtils.clamp(ballPos.current.x * 0.40 - ballPos.current.y * 0.25, -0.6, 0.8);
      targetWristZ = THREE.MathUtils.clamp(-ballPos.current.x * 0.2, -0.4, 0.4);
      targetGrip = 0.055;
    }

    // 3. Interpolación suave de articulaciones
    if (baseRef.current) {
      baseRef.current.rotation.y = THREE.MathUtils.lerp(baseRef.current.rotation.y, targetBaseY, delta * 6.5);
    }
    if (shoulderRef.current) {
      shoulderRef.current.rotation.z = THREE.MathUtils.lerp(shoulderRef.current.rotation.z, targetShoulderZ, delta * 6.5);
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.z = THREE.MathUtils.lerp(elbowRef.current.rotation.z, targetElbowZ, delta * 6.5);
    }
    if (wristRef.current) {
      wristRef.current.rotation.z = THREE.MathUtils.lerp(wristRef.current.rotation.z, targetWristZ, delta * 7.5);
      wristRef.current.rotation.x = THREE.MathUtils.lerp(wristRef.current.rotation.x, 0, delta * 8);
    }
    if (leftFingerRef.current && rightFingerRef.current) {
      leftFingerRef.current.position.x = THREE.MathUtils.lerp(leftFingerRef.current.position.x, -targetGrip, delta * 12);
      rightFingerRef.current.position.x = THREE.MathUtils.lerp(rightFingerRef.current.position.x, targetGrip, delta * 12);
    }
  });

  return (
    <group
      position={[0, 0, 0]}
      onPointerDown={(e) => {
        const p = e.point;
        if (Math.hypot(p.x - ballPos.current.x, p.y - ballPos.current.y) < 0.65) {
          handlePointerDown(e);
        }
      }}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ===== SOMBRA DE CONTACTO DE LA PELOTA ===== */}
      <mesh ref={shadowMeshRef} position={[0.65, -0.985, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BALL_RADIUS * 1.1, 24]} />
        <meshBasicMaterial color="#000000" opacity={0} transparent />
      </mesh>

      {/* ===== PELOTA INTERACTIVA AIR CLUB ===== */}
      <mesh
        ref={ballMeshRef}
        position={[0.65, 1.8, 0.28]}
        castShadow
        onPointerDown={handlePointerDown}
        onPointerOver={() => {
          if (typeof document !== "undefined") document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (typeof document !== "undefined" && !isDragging.current) document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={BALL_LIME}
          roughness={0.28}
          metalness={0.18}
          emissive={BALL_LIME}
          emissiveIntensity={0.15}
        />
        {/* Costura ecuatorial de precisión tipo pelota de tenis */}
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[BALL_RADIUS * 0.98, 0.005, 12, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Hit area generosa invisible para facilitar agarrar la pelota con el mouse */}
        <mesh
          onPointerDown={handlePointerDown}
          onPointerOver={() => {
            if (typeof document !== "undefined") document.body.style.cursor = "grab";
          }}
          onPointerOut={() => {
            if (typeof document !== "undefined" && !isDragging.current) document.body.style.cursor = "default";
          }}
        >
          <sphereGeometry args={[BALL_RADIUS * 3.5, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </mesh>
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
        camera={{ position: [0, 0.32, 4.3], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        {/* Iluminación de estudio multi-punto industrial */}
        <ambientLight intensity={1.35} />
        <directionalLight position={[4, 5, 4]} intensity={2.0} />
        <directionalLight position={[-4, 3, 3]} intensity={1.3} color="#e8eeff" />
        <directionalLight position={[0, 4, -4]} intensity={1.7} color="#ffffff" />
        <pointLight position={[0, -0.95, 1.2]} intensity={1.6} color={ACCENT_GLOW} distance={3.5} />

        <InteractiveScene isHovered={isHovered} isClicked={isClicked} />
      </Canvas>
    </div>
  );
}

