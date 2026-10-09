"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRosmasterModel, ROSMASTER_UNITS } from "./RosmasterModel";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Un solo Rosmaster, un solo canvas fijo sobre toda la ventana, que viaja por las uniones entre secciones: sube la
 * colina que abre el tramo oscuro, cruza la pista del JAR, baja por la colina que lo cierra y corre sobre las almenas de
 * la convocatoria. Cada tramo está marcado en la página con `data-seam` ("hill", "grid" o "battlement") y se recorre con
 * el scroll: el robot entra por la izquierda, cruza y sale por la derecha. Todos los tramos pasan por espacio vacío, así
 * que el robot nunca tapa texto. No recibe clics (`pointer-events-none`).
 */

type Kind = "hill" | "grid" | "battlement";
type Crossing = { kind: Kind; el: HTMLElement; s0: number; s1: number };

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

// Ventana de scroll (en px de scrollY) en la que se recorre cada tramo.
function findCrossings(): Crossing[] {
  const H = window.innerHeight;
  const out: Crossing[] = [];
  document.querySelectorAll<HTMLElement>("[data-seam]").forEach((el) => {
    const kind = el.dataset.seam as Kind;
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    if (kind === "grid") {
      // la pista: mientras la banda sube desde el borde inferior hasta la parte baja de la pantalla
      const k = H + r.height;
      out.push({ kind, el, s0: top - H + 0.06 * k, s1: top - H + 0.38 * k });
    } else {
      // colinas y almenas: mientras la unión recorre casi toda la pantalla
      out.push({ kind, el, s0: top - 0.85 * H, s1: top - 0.25 * H });
    }
  });
  out.sort((a, b) => a.s0 - b.s0);
  // Si dos ventanas se pisan (pantallas muy altas) el robot termina el tramo donde empieza el siguiente
  for (let i = 0; i < out.length - 1; i++) out[i].s1 = Math.min(out[i].s1, out[i + 1].s0);
  return out;
}

function currentCrossing(reduced: boolean) {
  const crossings = findCrossings();
  const H = window.innerHeight;
  if (reduced) {
    // Sin movimiento: el robot queda quieto, al centro de la pista, mientras la banda está a la vista
    const grid = crossings.find((c) => c.kind === "grid");
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

type Pose = { x: number; y: number; angle: number; size: number };

function poseFor(c: Crossing, u: number): Pose {
  const W = window.innerWidth;
  const x = W * (-0.12 + u * 1.24);
  const seamSize = clamp(W * 0.07 + 20, 80, 120);
  const r = c.el.getBoundingClientRect();
  if (c.kind === "hill") {
    const svg = c.el.querySelector("svg");
    const path = svg?.querySelector("path");
    if (svg && path) {
      const { y, angle } = hillAt(path, svg.getBoundingClientRect(), x);
      return { x, y, angle, size: seamSize };
    }
  }
  if (c.kind === "battlement") return { x, y: r.top - 14, angle: 0, size: seamSize };
  // grid: la base de las ruedas apoya sobre la pista
  return { x, y: r.top + r.height * 0.64, angle: -0.03, size: clamp(W * 0.22, 130, 300) };
}

function Robot({ reduced }: { reduced: boolean }) {
  const model = useRosmasterModel();
  const rig = useRef<THREE.Group>(null);
  const state = useRef<{ el: HTMLElement | null; u: number; x: number }>({ el: null, u: 0, x: 0 });

  useFrame((frame, delta) => {
    const g = rig.current;
    if (!g) return;
    const hit = currentCrossing(reduced);
    if (!hit) {
      g.visible = false;
      state.current.el = null;
      return;
    }
    const s = state.current;
    // Al empezar un tramo nuevo se arranca desde su posición (nada de volar desde el tramo anterior)
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
    const bounce = reduced ? 0 : Math.abs(Math.sin(frame.clock.elapsedTime * 22)) * 2.5 * Math.min(1, speed / 300);
    g.visible = true;
    g.position.set(pose.x - W / 2, H / 2 - pose.y + bounce, 0);
    g.rotation.z = pose.angle;
    g.scale.setScalar(pose.size / ROSMASTER_UNITS);
  });

  return (
    <group ref={rig} visible={false}>
      {/* inclinado hacia la cámara para que se vea la parte de arriba */}
      <group rotation={[0.3, 0, 0]}>
        {/* de frente hacia la derecha, en tres cuartos */}
        <group rotation={[0, Math.PI / 2 + 0.5, 0]}>
          <primitive object={model} />
        </group>
      </group>
    </group>
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
  // Fuera de un tramo el canvas no dibuja ni se ve: no gasta GPU mientras el robot no está en pantalla
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
