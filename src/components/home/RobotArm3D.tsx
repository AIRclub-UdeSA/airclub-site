"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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

const FLOOR_Y = -0.915; // Altura física del suelo considerando el radio de la pelota (0.065)
const BALL_RADIUS = 0.065;

type BallState = "waiting" | "dropping" | "floor" | "reaching" | "grabbed" | "dragged" | "thrown";

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

  const ballPos = useRef(new THREE.Vector3(0.65, 2.3, 0.1));
  const ballVel = useRef(new THREE.Vector3(0, 0, 0));
  const ballState = useRef<BallState>("waiting");
  const [, setIsBallActive] = useState(false);
  const [, setIsCursorGrabbing] = useState(false);

  // Historial del puntero para cálculo de inercia y tiro
  const dragHistory = useRef<{ x: number; y: number; t: number }[]>([]);
  const holdTimer = useRef(0);

  // Iniciar la caída de la pelota tras ~2.6 segundos de contemplación del Hero
  useEffect(() => {
    const timeout = setTimeout(() => {
      ballPos.current.set(0.65, 2.2, 0.1);
      ballVel.current.set(-0.25, -0.6, 0);
      ballState.current = "dropping";
      setIsBallActive(true);
    }, 2600);

    return () => clearTimeout(timeout);
  }, []);

  // Handlers para arrastrar y lanzar la pelota con el cursor
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    ballState.current = "dragged";
    ballVel.current.set(0, 0, 0);
    setIsCursorGrabbing(true);
    dragHistory.current = [];
  }, []);

  const handlePointerUp = useCallback(() => {
    if (ballState.current === "dragged") {
      setIsCursorGrabbing(false);
      // Calcular velocidad de lanzamiento desde el historial reciente
      const history = dragHistory.current;
      if (history.length >= 2) {
        const oldest = history[0];
        const latest = history[history.length - 1];
        const dt = Math.max(latest.t - oldest.t, 0.016);
        const vx = (latest.x - oldest.x) / dt;
        const vy = (latest.y - oldest.y) / dt;
        ballVel.current.set(
          THREE.MathUtils.clamp(vx * 0.75, -8, 8),
          THREE.MathUtils.clamp(vy * 0.75, -6, 9),
          0
        );
      } else {
        ballVel.current.set(0, 0, 0);
      }
      ballState.current = "thrown";
    }
  }, []);

  // Loop de simulación física, cinemática y renderizado
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05); // Prevenir saltos por caída de framerate
    const t = state.clock.getElapsedTime();
    const ptrX = state.pointer.x; // -1 a 1
    const ptrY = state.pointer.y; // -1 a 1

    // 1. SIMULACIÓN FÍSICA DE LA PELOTA
    if (ballState.current === "dropping" || ballState.current === "thrown") {
      // Gravedad
      ballVel.current.y -= 11.8 * delta;
      ballPos.current.x += ballVel.current.x * delta;
      ballPos.current.y += ballVel.current.y * delta;
      ballPos.current.z = 0.1;

      // Colisión contra el suelo
      if (ballPos.current.y <= FLOOR_Y) {
        ballPos.current.y = FLOOR_Y;
        if (Math.abs(ballVel.current.y) > 0.45) {
          ballVel.current.y = -ballVel.current.y * 0.60; // Rebote elástico
          ballVel.current.x *= 0.85; // Fricción en el suelo
        } else {
          ballVel.current.y = 0;
          ballVel.current.x *= 0.90; // Fricción por rodamiento
          if (Math.abs(ballVel.current.x) < 0.05) {
            ballVel.current.x = 0;
            ballState.current = "reaching";
          }
        }
      }

      // Rebote contra los laterales del escenario
      const BOUNDARY_X = 1.75;
      if (ballPos.current.x > BOUNDARY_X) {
        ballPos.current.x = BOUNDARY_X;
        ballVel.current.x = -Math.abs(ballVel.current.x) * 0.65;
      } else if (ballPos.current.x < -BOUNDARY_X) {
        ballPos.current.x = -BOUNDARY_X;
        ballVel.current.x = Math.abs(ballVel.current.x) * 0.65;
      }
    } else if (ballState.current === "dragged") {
      // Movimiento directo guiado por el cursor
      const worldX = THREE.MathUtils.clamp((state.pointer.x * state.viewport.width) / 2, -1.8, 1.8);
      const worldY = THREE.MathUtils.clamp((state.pointer.y * state.viewport.height) / 2, FLOOR_Y, 1.6);
      ballPos.current.x = THREE.MathUtils.lerp(ballPos.current.x, worldX, delta * 28);
      ballPos.current.y = THREE.MathUtils.lerp(ballPos.current.y, worldY, delta * 28);
      ballPos.current.z = 0.1;

      // Registrar historial de arrastre para inercia
      dragHistory.current.push({ x: worldX, y: worldY, t });
      if (dragHistory.current.length > 5) dragHistory.current.shift();
    }

    // 2. CÁLCULO CINEMÁTICO DIRECTO DEL BRAZO (FORWARD KINEMATICS)
    const currentBaseY = baseRef.current?.rotation.y ?? 0;
    const currentShoulderZ = shoulderRef.current?.rotation.z ?? 0;
    const currentElbowZ = elbowRef.current?.rotation.z ?? 0;
    const currentWristZ = wristRef.current?.rotation.z ?? 0;

    // Cinemática directa en el plano del brazo para la punta de la pinza
    const ex = -0.72 * Math.sin(currentShoulderZ);
    const ey = -0.62 + 0.72 * Math.cos(currentShoulderZ);
    const wx = ex - 0.58 * Math.sin(currentShoulderZ + currentElbowZ);
    const wy = ey + 0.58 * Math.cos(currentShoulderZ + currentElbowZ);
    const tipPlanarX = wx - 0.16 * Math.sin(currentShoulderZ + currentElbowZ + currentWristZ);
    const tipPlanarY = wy + 0.16 * Math.cos(currentShoulderZ + currentElbowZ + currentWristZ);

    const gripperWorldX = tipPlanarX * Math.cos(currentBaseY);
    const gripperWorldZ = -tipPlanarX * Math.sin(currentBaseY);
    const gripperWorldY = tipPlanarY;

    // Distancia tridimensional entre la pinza y la pelota
    const distToBall = Math.hypot(
      gripperWorldX - ballPos.current.x,
      gripperWorldY - ballPos.current.y,
      gripperWorldZ - ballPos.current.z
    );

    // Detección de captura
    if (ballState.current === "reaching" && distToBall < 0.16) {
      ballState.current = "grabbed";
      holdTimer.current = 0;
    }

    // Si está agarrada, la pelota sigue estrictamente la pinza
    if (ballState.current === "grabbed") {
      holdTimer.current += delta;
      ballPos.current.set(gripperWorldX, gripperWorldY, gripperWorldZ);
    }

    // Actualizar mallas 3D de la pelota y su sombra proyectada en el suelo
    if (ballMeshRef.current) {
      ballMeshRef.current.position.copy(ballPos.current);
      ballMeshRef.current.visible = ballState.current !== "waiting";
      if (ballState.current === "dragged" || ballState.current === "thrown") {
        ballMeshRef.current.rotation.x += delta * 6;
        ballMeshRef.current.rotation.z += delta * 4;
      }
    }

    if (shadowMeshRef.current) {
      const heightAboveFloor = Math.max(ballPos.current.y - FLOOR_Y, 0);
      const shadowScale = Math.max(1 - heightAboveFloor * 0.45, 0.25);
      const shadowOpacity = Math.max(0.24 - heightAboveFloor * 0.12, 0.04);
      shadowMeshRef.current.position.set(ballPos.current.x, -0.985, ballPos.current.z);
      shadowMeshRef.current.scale.set(shadowScale, shadowScale, shadowScale);
      (shadowMeshRef.current.material as THREE.MeshBasicMaterial).opacity =
        ballState.current !== "waiting" ? shadowOpacity : 0;
    }

    // 3. CONTROL DE ARTICULACIONES DEL BRAZO (TARGET ANGLES & CLAMPS)
    let targetBaseY = 0;
    let targetShoulderZ = 0;
    let targetElbowZ = 0;
    let targetWristZ = 0;
    let targetGrip = 0.18; // Separación normal de dedos

    const idleSwayX = Math.sin(t * 1.4) * 0.03;
    const idleSwayY = Math.cos(t * 1.6) * 0.02;
    const clickPitch = isClicked ? 0.26 : 0;

    if (ballState.current === "waiting") {
      // Estado inicial: 'I' del logo AIR respondiendo elegantemente al cursor con límites seguros
      targetBaseY = THREE.MathUtils.clamp(-ptrX * 0.42 + idleSwayX, -0.65, 0.65);
      targetShoulderZ = THREE.MathUtils.clamp(0.06 + ptrY * 0.20 - clickPitch + idleSwayY, -0.30, 0.40);
      targetElbowZ = THREE.MathUtils.clamp(-0.12 - ptrY * 0.25 + clickPitch * 1.1 - idleSwayY * 0.7, -0.50, 0.25);
      targetWristZ = THREE.MathUtils.clamp(0.06 + ptrY * 0.10 - clickPitch * 0.5, -0.30, 0.30);
      targetGrip = isClicked ? 0.04 : isHovered ? 0.30 : 0.18 + Math.sin(t * 2.2) * 0.04;
    } else if (ballState.current === "reaching") {
      // Brazo buscando activamente la pelota en el suelo
      targetBaseY = THREE.MathUtils.clamp(-ballPos.current.x * 0.42, -0.72, 0.72);

      // Cinemática inversa plana hacia la pelota
      const dx = THREE.MathUtils.clamp(ballPos.current.x, -0.95, 0.95);
      const dy = THREE.MathUtils.clamp(ballPos.current.y - -0.62, -0.6, 0.4);
      const dist = Math.hypot(dx, dy);
      const reach = THREE.MathUtils.clamp(dist, 0.25, 1.34);
      const cosElbow = (reach * reach - 0.72 * 0.72 - 0.70 * 0.70) / (2 * 0.72 * 0.70);
      const elbowAng = Math.acos(THREE.MathUtils.clamp(cosElbow, -1, 1));
      const angleTarget = Math.atan2(dx, -dy);
      const cosShoulder = (0.72 * 0.72 + reach * reach - 0.70 * 0.70) / (2 * 0.72 * reach);
      const beta = Math.acos(THREE.MathUtils.clamp(cosShoulder, -1, 1));

      targetShoulderZ = THREE.MathUtils.clamp(-(angleTarget - beta), -0.65, 0.50);
      targetElbowZ = THREE.MathUtils.clamp(elbowAng - 0.65, -0.60, 0.65);
      targetWristZ = THREE.MathUtils.clamp(-targetShoulderZ * 0.5, -0.35, 0.35);
      targetGrip = 0.28; // Abrir pinza para agarrar
    } else if (ballState.current === "grabbed") {
      // Brazo sosteniendo y levantando la pelota con orgullo
      targetBaseY = THREE.MathUtils.clamp(-ballPos.current.x * 0.25 + Math.sin(t * 1.5) * 0.04, -0.5, 0.5);
      targetShoulderZ = -0.16 + Math.sin(t * 1.2) * 0.03; // Elevar ligeramente
      targetElbowZ = 0.42 + Math.cos(t * 1.2) * 0.03;
      targetWristZ = -0.12;
      targetGrip = 0.045; // Pinza firmemente cerrada sobre la pelota
    } else if (ballState.current === "dragged" || ballState.current === "dropping" || ballState.current === "thrown") {
      // El brazo sigue con atención el vuelo o movimiento de la pelota
      targetBaseY = THREE.MathUtils.clamp(-ballPos.current.x * 0.40, -0.70, 0.70);
      targetShoulderZ = THREE.MathUtils.clamp(ballPos.current.y * 0.18 - 0.05, -0.40, 0.35);
      targetElbowZ = THREE.MathUtils.clamp(-ballPos.current.y * 0.22 + 0.10, -0.45, 0.35);
      targetWristZ = THREE.MathUtils.clamp(ballPos.current.x * 0.15, -0.25, 0.25);
      targetGrip = 0.24; // Pinza abierta en guardia
    }

    // 4. INTERPOLACIÓN FÍSICA SUAVE (LERP) PARA CADA ARTICULACIÓN
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
      // Mantener rotación en X neutralizada a 0 para eliminar giros extraños y gimbal lock
      wristRef.current.rotation.x = THREE.MathUtils.lerp(wristRef.current.rotation.x, 0, delta * 8);
    }
    if (leftFingerRef.current && rightFingerRef.current) {
      leftFingerRef.current.position.x = THREE.MathUtils.lerp(leftFingerRef.current.position.x, -targetGrip, delta * 10);
      rightFingerRef.current.position.x = THREE.MathUtils.lerp(rightFingerRef.current.position.x, targetGrip, delta * 10);
    }
  });

  return (
    <group
      position={[0, 0, 0]}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ===== SOMBRA DE CONTACTO DE LA PELOTA ===== */}
      <mesh ref={shadowMeshRef} position={[0.65, -0.985, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BALL_RADIUS * 1.1, 24]} />
        <meshBasicMaterial color="#000000" opacity={0} transparent />
      </mesh>

      {/* ===== PELOTA INTERACTIVA AIR CLUB ===== */}
      <mesh
        ref={ballMeshRef}
        position={[0.65, 2.2, 0.1]}
        castShadow
        onPointerDown={handlePointerDown}
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
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="absolute -top-[16%] -bottom-[16%] -left-[25%] -right-[25%]">
        <Canvas
          camera={{ position: [0, 0, 4.0], fov: 36 }}
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
    </div>
  );
}

