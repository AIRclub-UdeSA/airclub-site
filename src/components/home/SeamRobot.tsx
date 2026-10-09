"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRosmasterModel, ROSMASTER_UNITS } from "./RosmasterModel";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Un solo Rosmaster, un solo canvas fijo sobre toda la ventana, que protagoniza una escena distinta en cada unión entre
 * secciones. Cada unión se marca en la página con `data-seam` y su escena se recorre con el scroll (se puede ir y volver):
 *
 *  - summit:  sube la primera colina, se frena en la cima, mira a cámara, da dos saltitos y baja por el otro lado.
 *  - slalom:  cruza la pista del JAR de derecha a izquierda esquivando tres conos, con el LiDAR barriendo adelante.
 *  - jump:    en la cima de la segunda colina salta, da una vuelta en el aire y aterriza en la bajada.
 *  - drop:    cae desde arriba sobre las almenas de la convocatoria, rebota tres veces, mira alrededor y se va.
 *
 * Todo pasa en espacio vacío, así que el robot nunca tapa texto. No recibe clics (`pointer-events-none`).
 */

type Kind = "summit" | "slalom" | "jump" | "drop";
type Crossing = { kind: Kind; el: HTMLElement; s0: number; s1: number };

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Hacia dónde mira el robot (rotación en Y): derecha y izquierda en tres cuartos, o casi de frente a cámara.
const FACE_R = Math.PI / 2 + 0.5;
const FACE_L = -FACE_R;
const FACE_CAM = 0.25;

// Ventana de scroll (en px de scrollY) en la que se recorre cada unión.
function findCrossings(): Crossing[] {
  const H = window.innerHeight;
  const out: Crossing[] = [];
  document.querySelectorAll<HTMLElement>("[data-seam]").forEach((el) => {
    const kind = el.dataset.seam as Kind;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    if (kind === "slalom") {
      // la pista: mientras la banda sube desde el borde inferior hasta la parte baja de la pantalla
      const k = H + r.height;
      out.push({ kind, el, s0: top - H + 0.06 * k, s1: top - H + 0.4 * k });
    } else {
      // colinas y almenas: mientras la unión recorre casi toda la pantalla
      out.push({ kind, el, s0: top - 0.9 * H, s1: top - 0.2 * H });
    }
  });
  out.sort((a, b) => a.s0 - b.s0);
  // Si dos ventanas se pisan (pantallas muy altas) la escena termina donde empieza la siguiente
  for (let i = 0; i < out.length - 1; i++) out[i].s1 = Math.min(out[i].s1, out[i + 1].s0);
  return out;
}

function currentCrossing(reduced: boolean) {
  const crossings = findCrossings();
  const H = window.innerHeight;
  if (reduced) {
    // Sin movimiento: el robot queda quieto, al centro de la pista, mientras la banda está a la vista
    const grid = crossings.find((c) => c.kind === "slalom");
    const r = grid?.el.getBoundingClientRect();
    return grid && r && r.top < H && r.bottom > 0 ? { crossing: grid, u: 0.5 } : null;
  }
  const sy = window.scrollY;
  const c = crossings.find((c) => sy >= c.s0 && sy <= c.s1);
  return c ? { crossing: c, u: (sy - c.s0) / (c.s1 - c.s0) } : null;
}

// Altura y pendiente de la colina (SectionEdge) en una x de pantalla, muestreando el trazado real del SVG.
const VIEWBOX_W = 1440;
const VIEWBOX_H = 101;
function hillAt(path: SVGPathElement, rect: DOMRect, screenX: number) {
  const vx = clamp(((screenX - rect.left) / rect.width) * VIEWBOX_W, 1, VIEWBOX_W - 1);
  // El trazado termina con un tramo vertical de 1px y el cierre por abajo (VIEWBOX_W): no cuentan para la curva
  const end = path.getTotalLength() - VIEWBOX_W - 1;
  let lo = 1;
  let hi = end;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).x < vx) lo = mid;
    else hi = mid;
  }
  const a = path.getPointAtLength(hi);
  const b = path.getPointAtLength(Math.min(hi + 10, end));
  const toY = (v: number) => rect.top + (v / VIEWBOX_H) * rect.height;
  const toX = (v: number) => rect.left + (v / VIEWBOX_W) * rect.width;
  return { y: toY(a.y), angle: Math.atan2(-(toY(b.y) - toY(a.y)), toX(b.x) - toX(a.x)) };
}

type Pose = {
  x: number;
  y: number;
  /** Giro en el plano de la pantalla (pendiente + vueltas en el aire). */
  angle: number;
  size: number;
  /** Hacia dónde mira (rotación en Y). */
  yaw: number;
  /** Profundidad: positivo = más cerca de la cámara (pasa por delante de los conos). */
  depth: number;
  /** Muestra el barrido del LiDAR. */
  scan: boolean;
};

const START = -0.12;
const END = 1.12;

function hillScene(c: Crossing) {
  const svg = c.el.querySelector("svg");
  const path = svg?.querySelector("path");
  const rect = svg?.getBoundingClientRect();
  const W = window.innerWidth;
  const crestX = rect ? rect.left + parseFloat(c.el.dataset.peak ?? "0.5") * rect.width : W / 2;
  const ground = (x: number) => (svg && path && rect ? hillAt(path, rect, x) : { y: c.el.getBoundingClientRect().top, angle: 0 });
  return { W, crestX, ground };
}

function poseFor(c: Crossing, u: number): Pose {
  const W = window.innerWidth;
  const seamSize = clamp(W * 0.07 + 20, 80, 120);
  const r = c.el.getBoundingClientRect();

  if (c.kind === "summit") {
    const { crestX, ground } = hillScene(c);
    let x: number;
    if (u < 0.4) {
      const t = u / 0.4;
      x = lerp(START * W, crestX, 1 - (1 - t) * (1 - t)); // llega frenando
    } else if (u < 0.64) {
      x = crestX;
    } else {
      const t = (u - 0.64) / 0.36;
      x = lerp(crestX, END * W, t * t); // arranca de a poco
    }
    // mira a cámara durante la pausa
    const toCam = smooth(0.4, 0.47, u) - smooth(0.57, 0.64, u);
    const g = ground(x);
    // dos saltitos mientras saluda
    const hop = u > 0.47 && u < 0.57 ? Math.abs(Math.sin(((u - 0.47) / 0.1) * Math.PI * 2)) * seamSize * 0.16 : 0;
    return { x, y: g.y - hop, angle: g.angle * (1 - toCam * 0.7), size: seamSize, yaw: lerp(FACE_R, FACE_CAM, toCam), depth: 0, scan: false };
  }

  if (c.kind === "jump") {
    const { crestX, ground } = hillScene(c);
    const landX = Math.min(crestX + 0.26 * W, 0.95 * W);
    let x: number;
    let lift = 0;
    let flip = 0;
    if (u < 0.34) {
      x = lerp(START * W, crestX, u / 0.34);
    } else if (u < 0.66) {
      const t = (u - 0.34) / 0.32;
      x = lerp(crestX, landX, t);
      lift = 4 * t * (1 - t) * seamSize * 1.3; // parábola
      flip = -Math.PI * 2 * smooth(0.1, 0.9, t); // vuelta hacia adelante
    } else {
      const t = (u - 0.66) / 0.34;
      x = lerp(landX, END * W, t);
    }
    const g = ground(x);
    return { x, y: g.y - lift, angle: g.angle + flip, size: seamSize, yaw: FACE_R, depth: 0, scan: false };
  }

  if (c.kind === "drop") {
    const groundY = r.top - 14; // la punta de las almenas
    // cae en un hueco entre columnas de texto; en pantallas angostas, al centro
    const dropX = (W >= 768 ? 0.53 : 0.5) * W;
    let x = dropX;
    let off = 0;
    let tilt = 0;
    let yaw = FACE_R;
    if (u < 0.45) {
      const t = u / 0.45;
      if (t < 0.5) {
        const s = t / 0.5;
        off = (groundY + seamSize * 1.2) * (1 - s * s); // caída libre desde arriba de la ventana
        tilt = -0.5 * (1 - s); // entra con la trompa para abajo
      } else if (t < 0.76) {
        off = seamSize * 1.5 * 4 * ((t - 0.5) / 0.26) * (1 - (t - 0.5) / 0.26);
      } else if (t < 0.9) {
        off = seamSize * 0.55 * 4 * ((t - 0.76) / 0.14) * (1 - (t - 0.76) / 0.14);
      } else {
        off = seamSize * 0.18 * 4 * ((t - 0.9) / 0.1) * (1 - (t - 0.9) / 0.1);
      }
    } else if (u < 0.62) {
      // mira alrededor
      yaw = FACE_R + Math.sin(((u - 0.45) / 0.17) * Math.PI * 2) * 0.9;
    } else {
      const t = (u - 0.62) / 0.38;
      x = lerp(dropX, END * W, t * t);
    }
    return { x, y: groundY - off, angle: tilt, size: seamSize, yaw, depth: 0, scan: false };
  }

  // slalom: de derecha a izquierda, esquivando tres conos; más abajo en pantalla = más cerca = más grande
  const weave = Math.sin(u * Math.PI * 3);
  const heading = Math.cos(u * Math.PI * 3);
  const base = r.top + r.height * 0.64;
  const trackSize = clamp(W * 0.22, 130, 300);
  return {
    x: W * (END - u * (END - START)),
    y: base + weave * r.height * 0.12,
    angle: -0.03,
    size: trackSize * (1 + weave * 0.16),
    yaw: FACE_L + heading * 0.45, // gira hacia donde va: más hacia cámara cuando se acerca
    depth: weave * 80,
    scan: true,
  };
}

// Conos de la pista: fijos en pantalla, en los tres puntos donde el robot está en el extremo del zigzag.
const CONE_U = [1 / 6, 1 / 2, 5 / 6];

function Robot({ reduced }: { reduced: boolean }) {
  const model = useRosmasterModel();
  const rig = useRef<THREE.Group>(null);
  const yawGroup = useRef<THREE.Group>(null);
  const fan = useRef<THREE.Mesh>(null);
  const cones = useRef<(THREE.Mesh | null)[]>([]);
  const state = useRef<{ el: HTMLElement | null; u: number; x: number }>({ el: null, u: 0, x: 0 });

  useFrame((frame, delta) => {
    const g = rig.current;
    if (!g) return;
    const hit = currentCrossing(reduced);
    cones.current.forEach((m) => m && (m.visible = false));
    if (!hit) {
      g.visible = false;
      state.current.el = null;
      return;
    }
    const s = state.current;
    // Al empezar una escena nueva se arranca desde su posición (nada de volar desde la anterior)
    if (s.el !== hit.crossing.el) {
      s.el = hit.crossing.el;
      s.u = hit.u;
    }
    // Amortiguado sobre el avance (no sobre la posición): así el robot sigue pegado a la unión aunque la página se mueva
    s.u += (hit.u - s.u) * (1 - Math.exp(-delta * 9));
    const pose = poseFor(hit.crossing, s.u);
    const speed = Math.abs(pose.x - s.x) / Math.max(delta, 1e-3);
    s.x = pose.x;

    const { width: W, height: H } = frame.size;
    // La suspensión vibra solo mientras avanza por el piso (no en el aire ni parado)
    const rolling = hit.crossing.kind === "slalom" || hit.crossing.kind === "summit";
    const rumble = reduced || !rolling ? 0 : Math.abs(Math.sin(frame.clock.elapsedTime * 22)) * 2.5 * Math.min(1, speed / 300);
    g.visible = true;
    g.position.set(pose.x - W / 2, H / 2 - pose.y + rumble, pose.depth);
    g.rotation.z = pose.angle;
    g.scale.setScalar(pose.size / ROSMASTER_UNITS);
    if (yawGroup.current) yawGroup.current.rotation.y = pose.yaw;

    // LiDAR: un abanico que barre hacia adelante (solo en la pista, el robot va hacia la izquierda)
    if (fan.current) {
      fan.current.visible = pose.scan && !reduced;
      fan.current.rotation.z = Math.sin(frame.clock.elapsedTime * 3.2) * 0.4;
    }

    // Conos de la pista
    if (hit.crossing.kind === "slalom") {
      const r = hit.crossing.el.getBoundingClientRect();
      const base = r.top + r.height * 0.64;
      const size = clamp(window.innerWidth * 0.22, 130, 300) * 0.2;
      CONE_U.forEach((cu, i) => {
        const m = cones.current[i];
        if (!m) return;
        const appear = smooth(0, 0.08, hit.u) * (1 - smooth(0.92, 1, hit.u));
        m.visible = appear > 0.01;
        m.position.set(window.innerWidth * (END - cu * (END - START)) - W / 2, H / 2 - base + size * 0.5, 0);
        m.scale.setScalar(size * appear);
      });
    }
  });

  return (
    <>
      <group ref={rig} visible={false}>
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
  // Fuera de una escena el canvas no dibuja ni se ve: no gasta GPU mientras el robot no está en pantalla
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const on = currentCrossing(reduced) !== null;
      if (on !== activeRef.current) {
        activeRef.current = on;
        setActive(on);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
      style={{ visibility: active ? "visible" : "hidden" }}
    >
      <Canvas
        orthographic
        // 1 unidad = 1 px de pantalla, con el origen al centro y el eje Y hacia arriba
        camera={{ zoom: 1, position: [0, 0, 1000], near: 0.1, far: 4000 }}
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <hemisphereLight args={["#ffffff", "#f5ccd8", 1.2]} />
        <directionalLight position={[300, 500, 400]} intensity={2.4} />
        <directionalLight position={[-400, 200, 300]} intensity={1.8} color="#ff2a6d" />
        <Robot reduced={reduced} />
      </Canvas>
    </div>
  );
}
