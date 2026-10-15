"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { sweptXYHit } from "./arm-catch";

// Paleta industrial refinada AIR Club
const CRIMSON = "#a40c4c";
const CRIMSON_LIGHT = "#be185d";
const TITANIUM = "#2f2d33";
const SLATE_DARK = "#423f47";
const ALUMINUM = "#dce0e6";
const CHROME = "#f0f2f6";
const ACCENT_GLOW = "#ff2a6d";
const BALL_COLOR = "#c26179"; // mauve de la paleta (--mauve en modo oscuro); antes lima "#d4f434"

// Pose de reposo exacta (sin sway, sin puntero, sin click): es el frame que queda "congelado"
// mientras convive con la foto fija en ArmHero, y es la misma pose con la que se genera esa foto
// (ver arm-hero-still.ts). Al no depender de lerp ni del reloj, es 100% determinista.
const REST_POSE = {
  baseY: 0,
  shoulderZ: 0.06,
  elbowZ: -0.12,
  wristZ: 0.06,
  wristX: 0,
  gripDistance: 0.045,
};

// ---------- Pelota agarrable: click-y-arrastrá, el brazo intenta robartela ----------
// Misma idea que src/../../../brazo/sitio/arm-interactive.js (2D), llevada al brazo 3D real.
const BALL_RADIUS = 0.075;
const FLOOR_Y = -0.985; // mismo nivel que el anillo de sombra de contacto de la base
const BALL_HOME = { x: 0, y: 1.22, z: 0.15 }; // el "punto" de la I, bien separado de la pinza
const GRAVITY = 3.2;
const STEAL_FLASH_MS = 260; // cuanto se ve la pinza cerrada antes de que la pelota reaparezca

// Geometria real del brazo (debe coincidir con las posiciones/largos de las meshes de abajo):
// pivote de hombro en (0,-0.62,0), luego 0.72 hasta el codo, luego 0.58 hasta la muñeca.
const SHOULDER_PIVOT_Y = -0.62;
const ARM_L1 = 0.72;
const ARM_L2 = 0.58;
const FINGER_REACH = 0.18; // desde la muñeca hasta donde cierran los dedos, aprox
const CATCH_DIST = 0.2; // radio de robo EN EL PLANO X-Y (se ignora z), ver arm-catch.ts
// La fisica de la pelota corre en pasos fijos de 1/60s, sin importar los cuadros por segundo reales:
// con pasos proporcionales al cuadro, a pocos FPS la gravedad de UN cuadro ya superaba el umbral de
// rebote (0.25) y la pelota "saltaba" para siempre en vez de asentarse, y la friccion (que se
// aplicaba por cuadro) la dejaba rodar mucho mas lejos, fuera del alcance del brazo.
const PHYSICS_DT = 1 / 60;
const MAX_SUBSTEPS = 10;

type BallState = "resting" | "held" | "thrown" | "stolen";

// Camara FIJA: nunca se aleja ni se desplaza. La foto fija de ArmHero es un recorte de este mismo
// render, asi que para que el canvas vivo y la foto coincidan 1:1 en cualquier tamaño de pantalla
// la proyeccion del brazo tiene que ser siempre la misma; lo unico que cambia entre pantallas es
// la ventana de render (setViewOffset, ver CameraView), no la perspectiva.
// Esta LEJOS (z=10) a proposito: el canvas cubre toda la seccion, asi que la pelota se puede llevar
// muy lejos del eje optico, y con una camara cercana la distorsion de perspectiva de los bordes la
// estira en horizontal (a z=3.85 medimos ancho/alto = 1.7-1.8 en los costados: un poroto). A z=10 el
// estiramiento cae a ~1.15 y el brazo se ve con la perspectiva plana de siempre. El fov se calcula
// para que el alto de mundo visible en el plano del brazo (z=0) sea el mismo de antes (el que
// dimensiona la foto): al mover la camara hay que recapturar la foto (ver ArmHero.tsx).
const CAMERA_DISTANCE = 10;
const WORLD_VIEW_HEIGHT = 2 * 3.85 * Math.tan((18 * Math.PI) / 180); // alto de mundo en z=0 (ver arm-hero-still.ts)
const CAMERA_FOV_DEG = (2 * Math.atan(WORLD_VIEW_HEIGHT / (2 * CAMERA_DISTANCE)) * 180) / Math.PI;
const CAMERA_POSITION: [number, number, number] = [0, -0.05, CAMERA_DISTANCE];

// Vista del brazo, en px CSS relativos al canvas (calculada por ArmHero): (cx, cy) es donde cae el
// eje optico de la camara y h es cuantos px ocupa el alto completo del frustum a esa camara.
export type ArmView = { cx: number; cy: number; h: number };

// Punto del plano z=`z` que ve el pixel de coordenadas NDC (ndcX, ndcY) con la camara actual.
// Reemplaza a state.viewport de R3F, que ignora el view offset y asume que el origen del mundo
// esta en el centro del canvas (con el brazo descentrado, la pelota no quedaba bajo el cursor).
const _near = new THREE.Vector3();
const _far = new THREE.Vector3();
function ndcToWorld(camera: THREE.Camera, ndcX: number, ndcY: number, z: number, out: { x: number; y: number }) {
  _near.set(ndcX, ndcY, -1).unproject(camera);
  _far.set(ndcX, ndcY, 1).unproject(camera);
  const t = (z - _near.z) / (_far.z - _near.z);
  out.x = _near.x + (_far.x - _near.x) * t;
  out.y = _near.y + (_far.y - _near.y) * t;
}
const _pt = { x: 0, y: 0 };
const _tip = new THREE.Vector3();
const _bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
// Bordes visibles del canvas en el plano z (la camara no rota, asi que son un rectangulo).
function visibleBounds(camera: THREE.Camera, z: number) {
  ndcToWorld(camera, -1, -1, z, _pt);
  _bounds.minX = _pt.x;
  _bounds.minY = _pt.y;
  ndcToWorld(camera, 1, 1, z, _pt);
  _bounds.maxX = _pt.x;
  _bounds.maxY = _pt.y;
  return _bounds;
}

// Direccion mundial (mismo plano X-Y que hombro/codo/muñeca) de un link cuando su rotation.z es
// "angle": con angle=0 el link apunta derecho para arriba (+Y), y rotation.z positivo lo inclina
// hacia -X — es la rotacion real que aplica Three.js, no una convencion elegida a mano.
function armDir(angle: number) {
  return { x: -Math.sin(angle), y: Math.cos(angle) };
}

// Cinematica inversa analitica de 2 eslabones (hombro+codo) para que la MUÑECA llegue a un punto
// cualquiera del plano de flexión. Es el mismo enfoque geometrico que se probó en el intento
// archivado de pelota interactiva (rama archive/hero-ball-interactive, descartada) — acá se
// reutiliza solo la matemática de la IK, recalibrada a ARM_L1/ARM_L2 actuales, no esa mecánica.
// Devuelve tambien la posicion real (analitica) de la muñeca resultante: como el brazo no siempre
// esta totalmente estirado, la muñeca NO queda sobre la recta pivote->target, asi que para saber
// hacia donde tienen que apuntar los DEDOS hace falta saber desde donde arrancan de verdad.
function solveShoulderElbow(dx: number, dy: number) {
  const maxReach = ARM_L1 + ARM_L2 - 0.02;
  const d = THREE.MathUtils.clamp(Math.hypot(dx, dy), 0.15, maxReach);
  const cosElbow = (d * d - ARM_L1 * ARM_L1 - ARM_L2 * ARM_L2) / (2 * ARM_L1 * ARM_L2);
  const elbowMag = Math.acos(THREE.MathUtils.clamp(cosElbow, -1, 1));
  const alpha = Math.atan2(dx, dy);
  const cosBeta = (ARM_L1 * ARM_L1 + d * d - ARM_L2 * ARM_L2) / (2 * ARM_L1 * d);
  const beta = Math.acos(THREE.MathUtils.clamp(cosBeta, -1, 1));
  const shoulderZ = -(alpha + beta);
  const elbowZ = elbowMag;

  const shoulderDir = armDir(shoulderZ);
  const elbowX = shoulderDir.x * ARM_L1;
  const elbowY = shoulderDir.y * ARM_L1;
  const wristDir = armDir(shoulderZ + elbowZ);
  const wristX = elbowX + wristDir.x * ARM_L2;
  const wristY = elbowY + wristDir.y * ARM_L2;

  return { shoulderZ, elbowZ, wristX, wristY };
}

function ArmModel({
  isHovered,
  isClicked,
  frozen,
}: {
  isHovered: boolean;
  isClicked: boolean;
  frozen: boolean;
}) {
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const leftFingerRef = useRef<THREE.Group>(null);
  const rightFingerRef = useRef<THREE.Group>(null);

  const ballMeshRef = useRef<THREE.Mesh>(null);
  const ballShadowRef = useRef<THREE.Mesh>(null);
  const ballPos = useRef(new THREE.Vector3(BALL_HOME.x, BALL_HOME.y, BALL_HOME.z));
  const ballVel = useRef(new THREE.Vector3(0, 0, 0));
  const ballState = useRef<BallState>("resting");
  const dragHistory = useRef<{ x: number; y: number; t: number }[]>([]);
  const stolenAt = useRef(0);
  // posicion de la pelota y de la punta de la pinza en el cuadro anterior (para el barrido de robo)
  const prevBall = useRef(new THREE.Vector3());
  const prevTip = useRef(new THREE.Vector3());
  const hasPrev = useRef(false);

  const handleBallDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (frozen || ballState.current === "stolen") return;
    ballState.current = "held";
    ballVel.current.set(0, 0, 0);
    dragHistory.current = [{ x: ballPos.current.x, y: ballPos.current.y, t: performance.now() }];
    if (typeof document !== "undefined") document.body.style.cursor = "grabbing";
  }, [frozen]);

  const handleBallUp = useCallback(() => {
    if (typeof document !== "undefined") document.body.style.cursor = "default";
    if (ballState.current !== "held") return;
    const h = dragHistory.current;
    let vx = 0;
    let vy = 0;
    if (h.length >= 2) {
      const first = h[0];
      const last = h[h.length - 1];
      const dt = Math.max((last.t - first.t) / 1000, 0.016);
      vx = THREE.MathUtils.clamp((last.x - first.x) / dt, -6, 6);
      vy = THREE.MathUtils.clamp((last.y - first.y) / dt, -4, 8);
    }
    ballVel.current.set(vx, vy, 0);
    ballState.current = "thrown";
  }, []);

  useEffect(() => {
    window.addEventListener("pointerup", handleBallUp);
    return () => window.removeEventListener("pointerup", handleBallUp);
  }, [handleBallUp]);

  // Animación física y respuesta interactiva al cursor
  useFrame((state, delta) => {
    // Mientras esta "congelado" (recien montado, conviviendo con la foto fija) se fuerza la
    // pose de reposo frame a frame en vez de dejar que el lerp la alcance gradualmente: asi el
    // primer frame ya es exactamente igual a la foto, sin transición visible de por medio.
    if (frozen) {
      if (baseRef.current) baseRef.current.rotation.y = REST_POSE.baseY;
      if (shoulderRef.current) shoulderRef.current.rotation.z = REST_POSE.shoulderZ;
      if (elbowRef.current) elbowRef.current.rotation.z = REST_POSE.elbowZ;
      if (wristRef.current) {
        wristRef.current.rotation.z = REST_POSE.wristZ;
        wristRef.current.rotation.x = REST_POSE.wristX;
      }
      if (leftFingerRef.current && rightFingerRef.current) {
        leftFingerRef.current.position.x = -REST_POSE.gripDistance;
        rightFingerRef.current.position.x = REST_POSE.gripDistance;
      }
      return;
    }

    const t = state.clock.getElapsedTime();
    const ptrX = state.pointer.x; // -1 to 1
    const ptrY = state.pointer.y; // -1 to 1

    // ---------- 0. Física + estado de la pelota ----------
    if (ballState.current === "held") {
      // Sigue al puntero: se proyecta el pixel del puntero al plano de la pelota con la camara real
      // (ndcToWorld), asi queda justo bajo el cursor aunque el brazo no este en el centro del canvas.
      // Sin límite de "hasta dónde llega el brazo": se puede soltar en cualquier punto del
      // canvas, se estire el brazo lo que se estire (si no llega, se queda estirado sin robarla,
      // no la retiene una pared invisible).
      const b = visibleBounds(state.camera, ballPos.current.z);
      ndcToWorld(state.camera, ptrX, ptrY, ballPos.current.z, _pt);
      ballPos.current.x = THREE.MathUtils.clamp(_pt.x, b.minX + 0.15, b.maxX - 0.15);
      ballPos.current.y = THREE.MathUtils.clamp(_pt.y, FLOOR_Y + BALL_RADIUS, b.maxY - 0.15);
      const now = performance.now();
      dragHistory.current.push({ x: ballPos.current.x, y: ballPos.current.y, t: now });
      while (dragHistory.current.length > 0 && now - dragHistory.current[0].t > 90) {
        dragHistory.current.shift();
      }
    } else if (ballState.current === "thrown") {
      const b = visibleBounds(state.camera, ballPos.current.z);
      const minX = b.minX + 0.25; // pared = borde real de la pantalla, no un tope fijo
      const maxX = b.maxX - 0.25;
      const ceilY = b.maxY - 0.15; // mismo margen de arriba que al arrastrarla
      const steps = Math.min(Math.max(Math.round(delta / PHYSICS_DT), 1), MAX_SUBSTEPS);
      const dt = Math.min(delta, MAX_SUBSTEPS * PHYSICS_DT) / steps;
      for (let i = 0; i < steps && ballState.current === "thrown"; i++) {
        ballVel.current.y -= GRAVITY * dt;
        ballPos.current.x += ballVel.current.x * dt;
        ballPos.current.y += ballVel.current.y * dt;
        if (ballPos.current.y <= FLOOR_Y + BALL_RADIUS) {
          ballPos.current.y = FLOOR_Y + BALL_RADIUS;
          if (Math.abs(ballVel.current.y) > 0.25) {
            ballVel.current.y = -ballVel.current.y * 0.55; // rebote con perdida
            ballVel.current.x *= 0.8; // friccion al pegar
          } else {
            ballVel.current.y = 0;
            ballVel.current.x *= Math.pow(0.9, dt / PHYSICS_DT); // friccion rodando (0.9 por cada 1/60s)
            if (Math.abs(ballVel.current.x) < 0.02) {
              ballVel.current.x = 0;
              ballState.current = "resting"; // se asienta donde cayó, se puede volver a agarrar
            }
          }
        }
        if (ballPos.current.x > maxX) {
          ballPos.current.x = maxX;
          ballVel.current.x = -Math.abs(ballVel.current.x) * 0.6;
        } else if (ballPos.current.x < minX) {
          ballPos.current.x = minX;
          ballVel.current.x = Math.abs(ballVel.current.x) * 0.6;
        }
        if (ballPos.current.y > ceilY) {
          ballPos.current.y = ceilY;
          ballVel.current.y = -Math.abs(ballVel.current.y) * 0.55; // mismo rebote que contra el piso
        }
      }
    } else if (ballState.current === "stolen" && performance.now() - stolenAt.current > STEAL_FLASH_MS) {
      // recien cuando termina el "flash" de la pinza cerrada reaparece en su lugar de siempre
      ballPos.current.set(BALL_HOME.x, BALL_HOME.y, BALL_HOME.z);
      ballVel.current.set(0, 0, 0);
      ballState.current = "resting";
    }

    if (ballMeshRef.current) {
      ballMeshRef.current.position.copy(ballPos.current);
      ballMeshRef.current.visible = ballState.current !== "stolen";
      if (ballState.current !== "held") {
        ballMeshRef.current.rotation.x += (ballVel.current.x || 0.6) * delta * 3;
      }
    }
    if (ballShadowRef.current) {
      const height = Math.max(ballPos.current.y - (FLOOR_Y + BALL_RADIUS), 0);
      const scale = Math.max(1 - height * 0.55, 0.18);
      ballShadowRef.current.position.set(ballPos.current.x, FLOOR_Y + 0.002, ballPos.current.z);
      ballShadowRef.current.scale.set(scale, scale, scale);
      (ballShadowRef.current.material as THREE.MeshBasicMaterial).opacity =
        ballState.current === "stolen" ? 0 : Math.max(0.22 - height * 0.12, 0.03);
    }

    const ballActive = ballState.current === "held" || ballState.current === "thrown";
    const stealing = ballState.current === "stolen" && performance.now() - stolenAt.current < STEAL_FLASH_MS;

    // ---------- 1. Detección de robo: la pinza se acerca lo suficiente a la pelota ----------
    // Se barre TODO el recorrido entre el cuadro anterior y este (pelota y punta de la pinza), en el
    // plano X-Y: ver arm-catch.ts para el por qué (el offset z de la pelota y los pocos FPS hacian que
    // una pelota pegada a la pinza no se robara).
    if (ballActive && wristRef.current) {
      _tip.set(0, FINGER_REACH, 0);
      wristRef.current.localToWorld(_tip);
      if (!hasPrev.current) {
        prevBall.current.copy(ballPos.current);
        prevTip.current.copy(_tip);
      }
      const hit = sweptXYHit(prevBall.current, ballPos.current, prevTip.current, _tip, CATCH_DIST);
      prevBall.current.copy(ballPos.current);
      prevTip.current.copy(_tip);
      hasPrev.current = true;
      if (hit) {
        ballState.current = "stolen";
        stolenAt.current = performance.now();
        hasPrev.current = false;
        if (typeof document !== "undefined") document.body.style.cursor = "default";
      }
    } else {
      hasPrev.current = false;
    }

    // ---------- 2. Objetivo de las articulaciones: perseguir la pelota o el idle de siempre ----------
    const idleSwayX = Math.sin(t * 1.4) * 0.035;
    const idleSwayY = Math.cos(t * 1.6) * 0.025;
    const clickPitch = isClicked ? 0.28 : 0;

    let targetBaseY: number;
    let targetShoulderZ: number;
    let targetElbowZ: number;
    let targetWristZ: number;
    let targetGrip: number;
    let rate: number;

    if (ballActive || stealing) {
      // La IK de hombro+codo resuelve en el plano X-Y del mundo (igual que el idle de siempre:
      // rotation.z de esos dos joints ES ese plano). La base se mantiene sin girar (targetBaseY=0)
      // mientras persigue: si la base rota, rota TODO lo que cuelga de ella (hombro/codo/muñeca)
      // y la cuenta de la IK — que asume que esa rotacion es cero — queda apuntando a otro lado.
      // Antes esto no se notaba porque la pelota se arrastraba en un area chica (poco dx, giro
      // minimo); apenas se pudo arrastrar por toda la pantalla el desvio se volvio bien visible.
      const dx = ballPos.current.x; // con signo
      const dy = ballPos.current.y - SHOULDER_PIVOT_Y;
      const rawD = Math.hypot(dx, dy) || 0.001;
      // Apuntar la MUÑECA un poco mas cerca que la pelota (a FINGER_REACH de distancia), para que
      // sean los DEDOS los que terminen de cubrir esa distancia — si no, la muñeca se pasa de largo.
      const shrink = Math.max(rawD - FINGER_REACH, 0.15) / rawD;
      const ik = solveShoulderElbow(dx * shrink, dy * shrink);
      targetBaseY = 0;
      targetShoulderZ = ik.shoulderZ;
      targetElbowZ = ik.elbowZ;
      // Los dedos tienen que apuntar desde donde la muñeca QUEDA REALMENTE hacia la pelota REAL
      // (no el punto reducido de arriba, y no "derecho para arriba" — la muñeca no esta sobre la
      // recta pivote->pelota salvo que el brazo este del todo estirado).
      targetWristZ = Math.atan2(-(dx - ik.wristX), dy - ik.wristY) - targetShoulderZ - targetElbowZ;
      targetGrip = stealing ? 0.03 : 0.075;
      rate = stealing ? 14 : 9;
    } else {
      // El idle/hover/click de siempre, sin la pelota de por medio
      targetBaseY = -ptrX * 0.45 + idleSwayX;
      targetShoulderZ = 0.06 + ptrY * 0.22 - clickPitch + idleSwayY;
      targetElbowZ = -0.12 - ptrY * 0.28 + clickPitch * 1.2 - idleSwayY * 0.7;
      targetWristZ = 0.06 + ptrY * 0.12 - clickPitch * 0.5;
      targetGrip = isClicked ? 0.035 : isHovered ? 0.062 : 0.045 + Math.sin(t * 2.2) * 0.006;
      rate = 6;
    }

    // factor de suavizado por cuadro, acotado a 1: a pocos FPS delta*rate pasaba de 1 y el lerp se pasaba de largo
    const k = (r: number) => Math.min(delta * r, 1);
    if (baseRef.current) {
      baseRef.current.rotation.y = THREE.MathUtils.lerp(baseRef.current.rotation.y, targetBaseY, k(rate));
    }
    if (shoulderRef.current) {
      shoulderRef.current.rotation.z = THREE.MathUtils.lerp(shoulderRef.current.rotation.z, targetShoulderZ, k(rate));
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.z = THREE.MathUtils.lerp(elbowRef.current.rotation.z, targetElbowZ, k(rate));
    }
    if (wristRef.current) {
      wristRef.current.rotation.z = THREE.MathUtils.lerp(wristRef.current.rotation.z, targetWristZ, k(rate + 1));
      wristRef.current.rotation.x = THREE.MathUtils.lerp(wristRef.current.rotation.x, 0, k(rate));
    }
    if (leftFingerRef.current && rightFingerRef.current) {
      leftFingerRef.current.position.x = THREE.MathUtils.lerp(leftFingerRef.current.position.x, -targetGrip, k(9));
      rightFingerRef.current.position.x = THREE.MathUtils.lerp(rightFingerRef.current.position.x, targetGrip, k(9));
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ===== SOMBRA DE CONTACTO BASE (Grounded physical shadow) ===== */}
      <mesh position={[0, -0.986, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.38, 36]} />
        <meshBasicMaterial color="#000000" opacity={0.16} transparent />
      </mesh>

      {/* ===== SOMBRA DE CONTACTO DE LA PELOTA ===== */}
      <mesh ref={ballShadowRef} position={[BALL_HOME.x, FLOOR_Y + 0.002, BALL_HOME.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BALL_RADIUS * 1.15, 24]} />
        <meshBasicMaterial color="#000000" opacity={0.12} transparent />
      </mesh>

      {/* ===== PELOTA INTERACTIVA: click y arrastrá — el brazo intenta robartela ===== */}
      <mesh
        ref={ballMeshRef}
        position={[BALL_HOME.x, BALL_HOME.y, BALL_HOME.z]}
        castShadow
        onPointerDown={frozen ? undefined : handleBallDown}
        onPointerOver={() => {
          if (typeof document !== "undefined") document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (typeof document !== "undefined" && ballState.current !== "held") document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial color={BALL_COLOR} roughness={0.3} metalness={0.15} emissive={BALL_COLOR} emissiveIntensity={0.12} />
        {/* Costura ecuatorial tipo pelota de tenis */}
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[BALL_RADIUS * 0.98, 0.005, 12, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
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

// Aplica la ventana de render del canvas: la camara queda fija (CAMERA_POSITION, sin rotar) y solo
// se elige que recorte del mismo frustum se dibuja en el canvas grande. El frustum "virtual"
// mide view.h px de alto (los que ocupaba el canvas angosto original, o sea el espaciador donde
// vive la foto fija) y view.h * aspect de ancho (pixeles cuadrados); su centro es el eje optico.
// Se desplaza para que ese centro caiga en (view.cx, view.cy) del canvas real. Resultado: el
// brazo se dibuja con la misma perspectiva y a la misma escala px/unidad que en la foto, en
// cualquier tamaño de pantalla. `camera.manual = true` evita que R3F pise aspect/proyeccion en
// cada resize (los recalculamos nosotros con el tamaño real del canvas).
function CameraView({ view }: { view: ArmView }) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    const camera = get().camera as THREE.PerspectiveCamera & { manual?: boolean };
    camera.manual = true;
    camera.aspect = size.width / size.height;
    const fullH = view.h;
    const fullW = fullH * camera.aspect;
    camera.setViewOffset(fullW, fullH, fullW / 2 - view.cx, fullH / 2 - view.cy, size.width, size.height);
    camera.updateMatrixWorld();
  }, [get, size.width, size.height, view.cx, view.cy, view.h]);
  return null;
}

// Avisa al hero cuando ya se dibujó un frame real (no alcanza con "el bundle bajó": WebGL todavia
// tiene que crear el contexto y compilar los shaders del modelo antes de pintar algo en pantalla).
// Espera a que CameraView haya aplicado la ventana (camera.manual): un frame con la proyeccion
// por defecto de R3F no coincidiria con la foto.
function FirstFrameSignal({ onReady }: { onReady?: () => void }) {
  const firedRef = useRef(false);
  useFrame((state) => {
    if (firedRef.current) return;
    if (!(state.camera as THREE.PerspectiveCamera & { manual?: boolean }).manual) return;
    firedRef.current = true;
    onReady?.();
  });
  return null;
}

export default function RobotArm3D({
  isHovered = false,
  isClicked = false,
  frozen = false,
  onReady,
  view,
}: {
  isHovered?: boolean;
  isClicked?: boolean;
  frozen?: boolean;
  onReady?: () => void;
  // Ventana de render calculada por useArmView en ArmHero.tsx (ver CameraView).
  view: ArmView;
}) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        // rotation explicita: sin ella R3F le aplica lookAt(0,0,0) y la camara queda inclinada.
        camera={{ position: CAMERA_POSITION, rotation: [0, 0, 0], fov: CAMERA_FOV_DEG }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        {/* Iluminación de estudio multi-punto industrial */}
        <ambientLight intensity={1.35} />
        <directionalLight position={[4, 5, 4]} intensity={2.0} />
        <directionalLight position={[-4, 3, 3]} intensity={1.3} color="#e8eeff" />
        <directionalLight position={[0, 4, -4]} intensity={1.7} color="#ffffff" />
        <pointLight position={[0, -0.95, 1.2]} intensity={1.6} color={ACCENT_GLOW} distance={3.5} />

        <ArmModel isHovered={isHovered} isClicked={isClicked} frozen={frozen} />
        <CameraView view={view} />
        <FirstFrameSignal onReady={onReady} />
      </Canvas>
    </div>
  );
}
