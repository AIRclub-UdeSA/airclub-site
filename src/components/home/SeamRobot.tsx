"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRosmasterModel, ROSMASTER_UNITS } from "./RosmasterModel";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * El Rosmaster como mascota de la página: un solo robot en un canvas fijo sobre toda la ventana que se asoma por las
 * uniones entre secciones, juega un rato y se vuelve a esconder. Cada unión se marca con `data-seam` y su escena se
 * recorre con el scroll (se puede ir y volver). El canvas se recorta con la forma de la unión (la colina o las
 * almenas), así que el robot sale de *atrás* de ella: lo que queda por debajo de la línea no se ve.
 *
 *  - summit:  se asoma por detrás de la primera colina, mira a los lados, se esconde, vuelve a asomarse, sube a la cima,
 *             saluda con dos saltitos y baja por el otro lado.
 *  - slalom:  entra por el borde derecho de la pista, mira la cuenta regresiva y la cruza de derecha a izquierda
 *             esquivando tres conos, con el LiDAR barriendo adelante.
 *  - jump:    se asoma por detrás de la segunda colina, mira hacia adelante y sale disparado en un salto con vuelta, como
 *             un delfín, para zambullirse del otro lado.
 *  - peek:    se asoma por encima de las almenas de la convocatoria, mira a los lados, se agacha, vuelve a subir, saluda y
 *             se va rodando por las almenas.
 *
 * Todo pasa en espacio vacío, así que el robot nunca tapa texto. No recibe clics (`pointer-events-none`).
 */

type Kind = "summit" | "slalom" | "jump" | "peek";
type Crossing = { kind: Kind; el: HTMLElement; s0: number; s1: number };

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Valor en `u` de una pista de puntos [u, valor]; entre puntos arranca y frena suave (como un personaje, no una máquina). */
function track(u: number, keys: [number, number][]) {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (u <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], smooth(keys[i - 1][0], keys[i][0], u));
  }
  return keys[keys.length - 1][1];
}

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
      // la pista: mientras la banda sube desde el borde inferior hasta un poco más de la mitad de la pantalla
      const k = H + r.height;
      out.push({ kind, el, s0: top - H + 0.02 * k, s1: top - H + 0.42 * k });
    } else {
      // colinas y almenas: mientras la unión recorre casi toda la pantalla (largo, para que sea pausado). La colina de
      // salida arranca un poco más tarde porque queda al pie de la pista y su ventana no puede pisar la del slalom.
      out.push({ kind, el, s0: top - (kind === "jump" ? 0.8 : 1.0) * H, s1: top - (kind === "jump" ? 0.2 : 0.1) * H });
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

function hillScene(c: Crossing) {
  const svg = c.el.querySelector("svg");
  const path = svg?.querySelector("path");
  const rect = svg?.getBoundingClientRect();
  const W = window.innerWidth;
  const crestX = rect ? rect.left + parseFloat(c.el.dataset.peak ?? "0.5") * rect.width : W / 2;
  const ground = (x: number) => (svg && path && rect ? hillAt(path, rect, x) : { y: c.el.getBoundingClientRect().top, angle: 0 });
  return { W, crestX, ground };
}

// Recorte del canvas: la región por encima de la unión, para que el robot salga de atrás de ella.
function hillClip(c: Crossing) {
  const svg = c.el.querySelector("svg");
  const path = svg?.querySelector("path");
  if (!svg || !path) return "none";
  const rect = svg.getBoundingClientRect();
  const end = path.getTotalLength() - VIEWBOX_W - 1;
  const N = 64;
  const pts: string[] = [];
  let first = "";
  let last = "";
  for (let i = 0; i <= N; i++) {
    const pt = path.getPointAtLength(1 + ((end - 1) * i) / N);
    const p = `${(rect.left + (pt.x / VIEWBOX_W) * rect.width).toFixed(1)}px ${(rect.top + (pt.y / VIEWBOX_H) * rect.height).toFixed(1)}px`;
    if (i === 0) first = p;
    if (i === N) last = p;
    pts.push(p);
  }
  const yStart = first.split(" ")[1];
  const yEnd = last.split(" ")[1];
  return `polygon(0px 0px, ${window.innerWidth}px 0px, ${window.innerWidth}px ${yEnd}, ${pts.reverse().join(", ")}, 0px ${yStart})`;
}

// Las almenas (TalksBattlement): 14px de alto, merlones de 24 y huecos de 24 en un viewBox de 1440, centradas y "slice".
const MERLON = 24;
const BATTLEMENT_H = 14;
function battlementClip(el: HTMLElement) {
  const W = window.innerWidth;
  const top = el.getBoundingClientRect().top;
  const s = Math.max(W / 1440, 1);
  const offset = (W - 1440 * s) / 2;
  const pts: string[] = [];
  for (let k = Math.floor(-offset / (MERLON * s)) - 1; offset + k * MERLON * s < W; k++) {
    const y = (k % 2 === 0 ? top - BATTLEMENT_H : top).toFixed(1);
    pts.push(`${(offset + k * MERLON * s).toFixed(1)}px ${y}px`, `${(offset + (k + 1) * MERLON * s).toFixed(1)}px ${y}px`);
  }
  return `polygon(0px 0px, ${pts.join(", ")}, ${W}px 0px)`;
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

const SINK = 0.95; // cuánto de su alto baja el robot para esconderse del todo (sink = 1)

function poseFor(c: Crossing, u: number): Pose {
  const W = window.innerWidth;
  const seamSize = clamp(W * 0.07 + 20, 80, 120);

  if (c.kind === "summit") {
    const { crestX, ground } = hillScene(c);
    const x0 = crestX - 0.12 * W;
    const x = track(u, [[0, x0], [0.5, x0], [0.62, crestX], [0.8, crestX], [1, crestX + 0.16 * W]]);
    // asoma, se agacha, vuelve a asomar, sube, saluda y se zambulle del otro lado
    const sink = track(u, [[0, 1], [0.12, 1], [0.28, 0.55], [0.36, 0.55], [0.42, 0.85], [0.5, 0.2], [0.62, 0], [0.8, 0], [0.95, 0.6], [1, 1]]);
    const yaw = track(u, [[0, 0.25], [0.12, 0.25], [0.2, -0.7], [0.28, 0.9], [0.36, 0.2], [0.62, FACE_CAM], [0.8, FACE_CAM], [0.92, FACE_R]]);
    const g = ground(x);
    const hop = u > 0.62 && u < 0.8 ? Math.abs(Math.sin(((u - 0.62) / 0.18) * Math.PI * 2)) * seamSize * 0.18 : 0;
    const cam = smooth(0.45, 0.6, u) * (1 - smooth(0.8, 0.93, u));
    return { x, y: g.y + sink * seamSize * SINK - hop, angle: g.angle * (1 - cam * 0.6), size: seamSize, yaw, depth: 0, scan: false };
  }

  if (c.kind === "jump") {
    const { crestX, ground } = hillScene(c);
    const x0 = crestX - 0.1 * W;
    const x1 = Math.min(crestX + 0.22 * W, 0.95 * W);
    const x = track(u, [[0, x0], [0.3, x0], [0.8, x1], [1, x1]]);
    // se asoma, mira adelante, sale disparado en un arco con vuelta y se zambulle del otro lado
    const sink = track(u, [[0, 1], [0.08, 1], [0.2, 0.55], [0.3, 0.55], [0.38, 0], [0.7, 0], [0.8, 0.9], [0.86, 1], [1, 1]]);
    const t = clamp((u - 0.3) / 0.5);
    const arc = Math.sin(Math.PI * t) * seamSize * 1.5;
    const flip = -Math.PI * 2 * smooth(0.15, 0.85, t);
    const yaw = track(u, [[0, FACE_CAM], [0.08, FACE_CAM], [0.18, FACE_R], [1, FACE_R]]);
    const g = ground(x);
    return { x, y: g.y + sink * seamSize * SINK - arc, angle: g.angle + flip, size: seamSize, yaw, depth: 0, scan: false };
  }

  if (c.kind === "peek") {
    // se asoma en un hueco entre columnas de texto; en pantallas angostas, al centro
    const peekX = (W >= 768 ? 0.53 : 0.5) * W;
    const groundY = c.el.getBoundingClientRect().top - BATTLEMENT_H; // la punta de las almenas
    const x = track(u, [[0, peekX], [0.74, peekX], [1, peekX + 0.2 * W]]);
    // asoma la cabeza, mira a los lados, se agacha, sube del todo, saluda y se va rodando
    const sink = track(u, [[0, 1], [0.12, 1], [0.3, 0.6], [0.4, 0.6], [0.46, 0.9], [0.56, 0.1], [0.66, 0], [0.9, 0], [1, 0.9]]);
    const yaw = track(u, [[0, 0.25], [0.12, 0.25], [0.18, -0.8], [0.26, 0.9], [0.34, 0.25], [0.66, FACE_CAM], [0.76, FACE_R], [1, FACE_R]]);
    const hop = u > 0.66 && u < 0.78 ? Math.abs(Math.sin(((u - 0.66) / 0.12) * Math.PI * 2)) * seamSize * 0.18 : 0;
    return { x, y: groundY + sink * seamSize * SINK - hop, angle: 0, size: seamSize, yaw, depth: 0, scan: false };
  }

  // slalom: entra por el borde derecho, mira la cuenta regresiva y cruza esquivando tres conos;
  // más abajo en pantalla = más cerca = más grande
  const r = c.el.getBoundingClientRect();
  const base = r.top + r.height * 0.64;
  const trackSize = clamp(W * 0.22, 130, 300);
  const wu = clamp((u - 0.18) / 0.82); // avance del zigzag (arranca después de mirar)
  const weave = Math.sin(wu * Math.PI * 3);
  const heading = Math.cos(wu * Math.PI * 3);
  const look = smooth(0.02, 0.08, u) - smooth(0.12, 0.2, u);
  return {
    x: W * (1.0 - wu * 1.12),
    y: base + weave * r.height * 0.12,
    angle: -0.03,
    size: trackSize * (1 + weave * 0.16),
    yaw: lerp(FACE_L + heading * 0.45, FACE_CAM, look), // gira hacia donde va: más hacia cámara cuando se acerca
    depth: weave * 80,
    scan: u > 0.2,
  };
}

// Conos de la pista: fijos en pantalla, en los tres puntos donde el robot está en el extremo del zigzag.
const CONE_U = [1 / 6, 1 / 2, 5 / 6];

function Robot({ reduced, clipRef }: { reduced: boolean; clipRef: RefObject<HTMLDivElement | null> }) {
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
    const kind = hit.crossing.kind;
    // Al empezar una escena nueva se arranca desde su posición (nada de volar desde la anterior)
    if (s.el !== hit.crossing.el) {
      s.el = hit.crossing.el;
      s.u = hit.u;
    }
    // Amortiguado sobre el avance (no sobre la posición): así el robot sigue pegado a la unión aunque la página se mueva
    s.u += (hit.u - s.u) * (1 - Math.exp(-delta * 6));
    const pose = poseFor(hit.crossing, s.u);
    const speed = Math.abs(pose.x - s.x) / Math.max(delta, 1e-3);
    s.x = pose.x;

    // El canvas se recorta con la forma de la unión: el robot sale de atrás de la colina o de las almenas
    if (clipRef.current) {
      clipRef.current.style.clipPath = reduced
        ? "none"
        : kind === "summit" || kind === "jump"
          ? hillClip(hit.crossing)
          : kind === "peek"
            ? battlementClip(hit.crossing.el)
            : "none";
    }

    const { width: W, height: H } = frame.size;
    // La suspensión vibra solo mientras avanza por el piso (no en el aire ni parado)
    const rolling = kind === "slalom";
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
    if (kind === "slalom") {
      const r = hit.crossing.el.getBoundingClientRect();
      const base = r.top + r.height * 0.64;
      const size = clamp(window.innerWidth * 0.22, 130, 300) * 0.2;
      CONE_U.forEach((cu, i) => {
        const m = cones.current[i];
        if (!m) return;
        const appear = smooth(0.05, 0.2, hit.u) * (1 - smooth(0.92, 1, hit.u));
        m.visible = appear > 0.01;
        m.position.set(window.innerWidth * (1.0 - cu * 1.12) - W / 2, H / 2 - base + size * 0.5, 0);
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
  const clipRef = useRef<HTMLDivElement>(null);
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
      ref={clipRef}
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
        <Robot reduced={reduced} clipRef={clipRef} />
      </Canvas>
    </div>
  );
}
