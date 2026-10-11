"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRosmasterModel, ROSMASTER_UNITS } from "./RosmasterModel";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { setWheelSpeed } from "@/lib/smooth-scroll";
import { buildSlalom, createSlalomState, FACE_CAM, FACE_L, FACE_R, type SlalomState } from "./slalom-scene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * El Rosmaster en la pista del Challenge JAR: un solo robot en un canvas fijo sobre toda la ventana que corre el slalom
 * sobre la banda marcada con `data-seam="slalom"` (RosmasterTrack). La escena es una línea de tiempo de GSAP con reloj
 * propio (ver `slalom-scene.ts`), no depende de la velocidad del scroll.
 *
 *  - Arranca cuando el borde superior de la banda entra a la pantalla y se repite mientras la banda está a la vista.
 *  - Va atada a la banda: si se sigue scrolleando, se va con ella. Al salir por arriba queda en pausa y sigue donde estaba
 *    si se vuelve; solo se descarta (y arranca de cero) cuando la banda sale por completo por abajo.
 *  - Durante la primera vuelta la rueda rinde menos (DWELL_SPEED) para que alcance a verse; después vuelve a la normal.
 *  - Con movimiento reducido el robot queda quieto sobre la pista mientras la banda está a la vista.
 *
 * Todo pasa sobre la banda, así que el robot no tapa texto. No recibe clics (`pointer-events-none`).
 */

type Run = {
  el: HTMLElement;
  state: SlalomState;
  /** Null solo en la versión quieta de movimiento reducido. */
  tl: gsap.core.Timeline | null;
};

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// La escena arranca cuando el borde superior de la banda llega a esta altura de la pantalla (0 = arriba, 1 = abajo)...
const START_AT = 0.9;
// ...y su ventana termina cuando el borde inferior de la banda llega a esta altura (casi arriba del todo)
const END_AT = 0.05;
// Solo se descarta cuando el borde superior de la banda sale por completo por abajo
const RESET_AT = 1.05;
// Altura del carril (la línea roja de la pista) dentro de la banda
const LANE = 0.64;
// Hasta que el carril sube, el robot va por el piso visible de la banda (a FLOOR px del borde inferior de la pantalla) y se
// achica para caber en ella: no pisa lo que hay encima. Crece a medida que la banda sube, como si se acercara.
const FLOOR = 14;
// Mientras corre la primera vuelta la rueda rinde esto (1 = normal), para que alcance a verse. Sube y baja suave.
const DWELL_SPEED = 0.4;

const trackSizeFor = (W: number) => clamp(W * 0.22, 130, 300);
/**
 * Posición horizontal sobre la pista: u = 0 en el borde derecho y u = 1 ya afuera por la izquierda. La vuelta termina
 * a 0,7 veces el tamaño del robot del borde (lo que más sobresale es el abanico del LiDAR, a 0,64 por delante del
 * centro): así sale entero y vuelve a entrar por la derecha sin que se vea el salto. Robot y conos usan la misma cuenta.
 */
const laneX = (u: number, W: number) => lerp(W, -(trackSizeFor(W) * 0.7 + 16), u);

type Pose = {
  x: number;
  y: number;
  size: number;
  /** Hacia dónde mira (rotación en Y). */
  yaw: number;
  /** Profundidad: positivo = más cerca de la cámara (pasa por delante de los conos). */
  depth: number;
  /** Muestra el barrido del LiDAR. */
  scan: boolean;
  /** Altura del carril (para ubicar los conos). */
  lane: number;
};

/** Entra por el borde derecho, mira la cuenta regresiva y cruza esquivando tres conos; más abajo = más cerca = más grande. */
function slalomPose(el: HTMLElement, st: SlalomState): Pose {
  const W = window.innerWidth;
  const r = el.getBoundingClientRect();
  const lane = Math.min(r.top + r.height * LANE, window.innerHeight - FLOOR);
  const weave = Math.sin(st.wu * Math.PI * 3);
  const heading = Math.cos(st.wu * Math.PI * 3);
  // el robot mide más o menos su tamaño de alto: lo que entre en el piso visible de la banda (con aire arriba)
  const size = Math.min(trackSizeFor(W), Math.max(0, lane - r.top - 8) / 1.05);
  return {
    lane,
    x: laneX(st.wu, W) + st.x * W,
    y: lane + weave * Math.min(r.height * 0.12, (lane - r.top) * 0.2),
    size: size * (1 + weave * 0.16),
    yaw: lerp(FACE_L + heading * 0.45, FACE_CAM, st.look), // gira hacia donde va; más hacia cámara cuando se acerca
    depth: weave * 80,
    scan: st.wu > 0.02,
  };
}

// Conos de la pista: fijos en pantalla, en los tres puntos donde el robot está en el extremo del zigzag.
const CONE_U = [1 / 6, 1 / 2, 5 / 6];

/** Luz de estudio con reflejos: sin esto los metales del CAD quedan planos y oscuros. Se genera en el cliente, sin descargar nada. */
function setupStudioLight({ gl, scene }: { gl: THREE.WebGLRenderer; scene: THREE.Scene }) {
  const pmrem = new THREE.PMREMGenerator(gl);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;
  pmrem.dispose();
}

/** Mancha suave de sombra de contacto (gradiente radial). */
function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.85)");
    grad.addColorStop(0.45, "rgba(0,0,0,0.45)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Centra la geometría de una pieza en su propio nodo para poder girarla sobre su eje sin que orbite. */
function centerPivot(node: THREE.Object3D | undefined) {
  const mesh = node as THREE.Mesh | undefined;
  if (!mesh?.isMesh) return null;
  mesh.geometry = mesh.geometry.clone();
  mesh.geometry.computeBoundingBox();
  const c = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
  mesh.geometry.translate(-c.x, -c.y, -c.z);
  mesh.position.add(c);
  return mesh;
}

/**
 * Separa la torreta del LiDAR para que gire solo ella, como en el RPLIDAR real. En el CAD `lidar_sensor` es una sola
 * malla (base, motor, polea, correa y torreta juntas), así que se parte en piezas conectadas: el eje es el centro de la
 * pieza más alta (la tapa) y va a la torreta toda pieza que quede entera dentro del círculo de la tapa y arriba de la
 * base. La polea y la correa se salen de ese círculo y quedan quietas con la base. Devuelve la torreta, centrada en
 * su eje, como hija de la malla original (que se queda con la base).
 */
function splitLidarTurret(node: THREE.Object3D | undefined) {
  const mesh = node as THREE.Mesh | undefined;
  if (!mesh?.isMesh) return null;
  // Al volver a montar (modo estricto de React) ya está partida
  if (mesh.userData.turret) return mesh.userData.turret as THREE.Mesh;
  const geo = mesh.geometry.index ? mesh.geometry : null;
  if (!geo?.index) return null;
  const pos = geo.attributes.position;
  const index = geo.index.array;

  // Piezas conectadas. El CAD repite vértices en la misma posición, así que se sueldan por posición antes de unir.
  const weld = new Int32Array(pos.count);
  const byKey = new Map<string, number>();
  for (let v = 0; v < pos.count; v++) {
    const key = `${Math.round(pos.getX(v) * 1000)},${Math.round(pos.getY(v) * 1000)},${Math.round(pos.getZ(v) * 1000)}`;
    let w = byKey.get(key);
    if (w === undefined) byKey.set(key, (w = byKey.size));
    weld[v] = w;
  }
  const parent = Int32Array.from({ length: byKey.size }, (_, i) => i);
  const find = (a: number) => {
    while (parent[a] !== a) a = parent[a] = parent[parent[a]];
    return a;
  };
  for (let t = 0; t < index.length; t += 3) {
    const a = find(weld[index[t]]);
    parent[find(weld[index[t + 1]])] = a;
    parent[find(weld[index[t + 2]])] = a;
  }
  type Piece = { tris: number[]; box: THREE.Box3 };
  const pieces = new Map<number, Piece>();
  const p = new THREE.Vector3();
  for (let t = 0; t < index.length; t += 3) {
    const root = find(weld[index[t]]);
    let piece = pieces.get(root);
    if (!piece) pieces.set(root, (piece = { tris: [], box: new THREE.Box3() }));
    piece.tris.push(t);
    for (let k = 0; k < 3; k++) piece.box.expandByPoint(p.fromBufferAttribute(pos, index[t + k]));
  }

  geo.computeBoundingBox();
  const all = geo.boundingBox!;
  const cap = [...pieces.values()].reduce((a, b) => (b.box.max.y > a.box.max.y ? b : a));
  const axis = cap.box.getCenter(new THREE.Vector3());
  const radius = ((cap.box.max.x - cap.box.min.x) / 2) * 1.05;
  const baseTop = all.min.y + (all.max.y - all.min.y) * 0.4;
  const inTurret = (piece: Piece) => {
    if (piece.box.min.y < baseTop) return false;
    for (const t of piece.tris)
      for (let k = 0; k < 3; k++) {
        p.fromBufferAttribute(pos, index[t + k]);
        if (Math.hypot(p.x - axis.x, p.z - axis.z) > radius) return false;
      }
    return true;
  };

  const baseIdx: number[] = [];
  const turretIdx: number[] = [];
  for (const piece of pieces.values()) {
    const out = inTurret(piece) ? turretIdx : baseIdx;
    for (const t of piece.tris) out.push(index[t], index[t + 1], index[t + 2]);
  }
  if (!turretIdx.length) return null;

  const baseGeo = geo.clone();
  baseGeo.setIndex(baseIdx);
  const turretGeo = geo.clone();
  turretGeo.setIndex(turretIdx);
  turretGeo.translate(-axis.x, 0, -axis.z);
  mesh.geometry = baseGeo;
  const turret = new THREE.Mesh(turretGeo, mesh.material);
  turret.castShadow = mesh.castShadow;
  turret.receiveShadow = mesh.receiveShadow;
  turret.position.set(axis.x, 0, axis.z);
  mesh.add(turret);
  mesh.userData.turret = turret;
  return turret;
}

/** Con movimiento reducido el robot queda quieto, al centro de la pista, mientras la banda está a la vista. */
let stillRun: Run | null = null;
function reducedRun(): Run | null {
  const el = document.querySelector<HTMLElement>('[data-seam="slalom"]');
  const r = el?.getBoundingClientRect();
  if (!el || !r || r.top >= window.innerHeight || r.bottom <= 0) return null;
  if (stillRun?.el !== el) {
    const state = createSlalomState();
    state.x = 0;
    state.wu = 0.39;
    state.look = 1;
    stillRun = { el, state, tl: null };
  }
  return stillRun;
}

// Avisa a SeamRobot que cambió la escena activa (para prender o apagar el canvas)
let wakeNow: () => void = () => {};

function Robot({ reduced, runRef }: { reduced: boolean; runRef: RefObject<Run | null> }) {
  const model = useRosmasterModel();
  // Piezas con vida propia (se preparan una sola vez, al montar): del LiDAR gira solo la torreta
  const parts = useRef<{ lidar: THREE.Mesh | null; camera: THREE.Mesh | null }>({ lidar: null, camera: null });
  useEffect(() => {
    parts.current = {
      lidar: splitLidarTurret(model.getObjectByName("lidar_sensor")),
      camera: centerPivot(model.getObjectByName("rgbd_camera")),
    };
  }, [model]);
  const shadowTex = useShadowTexture();
  const rig = useRef<THREE.Group>(null);
  const yawGroup = useRef<THREE.Group>(null);
  const fan = useRef<THREE.Mesh>(null);
  const cones = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((frame) => {
    const g = rig.current;
    if (!g) return;
    cones.current.forEach((m) => m && (m.visible = false));
    const run = reduced ? reducedRun() : runRef.current;
    if (!run) {
      g.visible = false;
      return;
    }
    const { el, state: st } = run;
    const pose = slalomPose(el, st);

    const { width: W, height: Hc } = frame.size;
    g.visible = true;
    g.position.set(pose.x - W / 2, Hc / 2 - pose.y, pose.depth);
    g.rotation.z = -0.03;
    g.scale.setScalar(pose.size / ROSMASTER_UNITS);
    if (yawGroup.current) yawGroup.current.rotation.y = pose.yaw;

    // Vida propia: la torreta del LiDAR gira siempre (la base no) y la cámara cabecea cuando la escena lo pide
    const { lidar, camera } = parts.current;
    if (lidar) lidar.rotation.y = reduced ? 0 : frame.clock.elapsedTime * 5;
    if (camera) camera.rotation.x = st.nod;

    // LiDAR: un abanico que barre hacia adelante (el robot va hacia la izquierda)
    if (fan.current) {
      fan.current.visible = pose.scan && !reduced;
      fan.current.rotation.z = Math.sin(frame.clock.elapsedTime * 3.2) * 0.4;
    }

    // Conos de la pista
    const coneSize = Math.min(trackSizeFor(window.innerWidth) * 0.2, Math.max(0, pose.lane - el.getBoundingClientRect().top - 8) * 0.8);
    CONE_U.forEach((cu, i) => {
      const m = cones.current[i];
      if (!m) return;
      const appear = reduced ? 0 : st.cones;
      m.visible = appear > 0.01;
      m.position.set(laneX(cu, window.innerWidth) - W / 2, Hc / 2 - pose.lane + coneSize * 0.5, 0);
      m.scale.setScalar(coneSize * appear);
    });
  });

  return (
    <>
      <group ref={rig} visible={false}>
        {/* sombra de contacto: un plano sobre el piso, visto con la misma inclinación que el robot */}
        <group rotation={[0.3, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} renderOrder={-1}>
            <planeGeometry args={[ROSMASTER_UNITS * 1.15, ROSMASTER_UNITS * 0.9]} />
            <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.5} />
          </mesh>
        </group>
        {/* inclinado hacia la cámara para que se vea la parte de arriba */}
        <group rotation={[0.3, 0, 0]}>
          <group ref={yawGroup} rotation={[0, FACE_R, 0]}>
            <primitive object={model} />
          </group>
        </group>
        {/* abanico del LiDAR: un sector que apunta hacia -X y se mueve de lado a lado */}
        <mesh ref={fan} position={[-0.1, 1.3, 0]} scale={[ROSMASTER_UNITS * 0.6, ROSMASTER_UNITS * 0.6, 1]} visible={false}>
          <circleGeometry args={[1, 24, Math.PI - 0.32, 0.64]} />
          <meshBasicMaterial color="#ff2a6d" transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
      {CONE_U.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            cones.current[i] = m;
          }}
          visible={false}
        >
          <coneGeometry args={[0.5, 1, 20]} />
          <meshStandardMaterial color="#f0357f" roughness={0.45} />
        </mesh>
      ))}
    </>
  );
}

const emptySubscribe = () => () => {};

export function SeamRobot() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const reduced = usePrefersReducedMotion();
  // Fuera de la ventana de la banda el canvas no dibuja ni se ve: no gasta GPU mientras el robot no está en pantalla
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const runRef = useRef<Run | null>(null);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const on = reduced ? reducedRun() !== null : runRef.current !== null;
      if (on !== activeRef.current) {
        activeRef.current = on;
        setActive(on);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    wakeNow = schedule;
    check();
    // Solo con movimiento reducido el estado depende del scroll; con movimiento lo avisa la escena
    if (reduced) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    }
    return () => {
      wakeNow = () => {};
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // La banda tiene una ventana de pantalla (de que su borde superior llega a START_AT hasta que el inferior llega a
  // END_AT). Al entrar desde abajo arranca la escena; al salir por arriba queda en pausa y sigue donde estaba si se vuelve;
  // al salir por completo por abajo se descarta y la próxima vez arranca de cero.
  useGSAP(
    () => {
      if (!mounted || reduced) return;
      const el = document.querySelector<HTMLElement>('[data-seam="slalom"]');
      if (!el) return;
      let run: Run | null = null;
      let inWindow = false;
      let laps = 0;

      // Velocidad de la rueda: baja durante la primera vuelta y vuelve a la normal cuando termina o la banda se va
      const wheel = { speed: 1 };
      const dwell = (on: boolean) =>
        gsap.to(wheel, { speed: on ? DWELL_SPEED : 1, duration: 0.5, ease: "power2.out", overwrite: true, onUpdate: () => setWheelSpeed(wheel.speed) });

      const sync = () => {
        const live = run !== null && inWindow;
        if (live) run?.tl?.play();
        else run?.tl?.pause();
        runRef.current = live ? run : null;
        dwell(live && laps < 1);
        wakeNow();
      };
      const discard = () => {
        run?.tl?.kill();
        run = null;
        laps = 0;
      };
      const enter = () => {
        inWindow = true;
        if (!run) {
          const state = createSlalomState();
          run = {
            el,
            state,
            tl: buildSlalom(state, () => {
              laps++;
              sync();
            }),
          };
        }
        sync();
      };

      // Posición de scroll en la que el borde de la banda llega a `frac` de la altura de la pantalla
      const at = (frac: number, edge: "top" | "bottom" = "top") => () => {
        const r = el.getBoundingClientRect();
        return (edge === "bottom" ? r.bottom : r.top) + window.scrollY - frac * window.innerHeight;
      };
      ScrollTrigger.create({
        trigger: el,
        start: at(START_AT),
        end: at(END_AT, "bottom"),
        invalidateOnRefresh: true,
        onEnter: enter,
        onEnterBack: enter,
        onLeave: () => {
          inWindow = false;
          sync();
        },
      });
      ScrollTrigger.create({
        trigger: el,
        start: at(RESET_AT),
        invalidateOnRefresh: true,
        onLeaveBack: () => {
          inWindow = false;
          discard();
          sync();
        },
      });

      return () => {
        gsap.killTweensOf(wheel);
        setWheelSpeed(1);
        discard();
        runRef.current = null;
      };
    },
    { dependencies: [mounted, reduced] },
  );

  if (!mounted) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40" style={{ visibility: active ? "visible" : "hidden" }}>
      <Canvas
        orthographic
        // 1 unidad = 1 px de pantalla, con el origen al centro y el eje Y hacia arriba
        camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={setupStudioLight}
      >
        <ambientLight intensity={0.2} />
        <hemisphereLight args={["#ffffff", "#f5ccd8", 0.3]} />
        <directionalLight position={[300, 500, 400]} intensity={1.7} />
        <directionalLight position={[-400, 200, 300]} intensity={1.2} color="#ff2a6d" />
        <Robot reduced={reduced} runRef={runRef} />
      </Canvas>
    </div>
  );
}
