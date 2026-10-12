import gsap from "gsap";

/**
 * La escena del slalom de SeamRobot: una línea de tiempo de GSAP con reloj propio (no depende de la velocidad del scroll).
 * El robot entra por la derecha, se detiene a mirar la cuenta regresiva (la cámara cabecea) y cruza la pista de derecha a
 * izquierda esquivando conos (dos o tres, según el ancho), con el LiDAR barriendo. Se repite mientras la banda está a la vista.
 *
 * La línea de tiempo solo mueve los números de `SlalomState`; SeamRobot los lee en cada cuadro y los convierte en pose.
 */

export type SlalomState = {
  /** Entrada por el borde derecho: 1 = todavía afuera, 0 = ya entró entero. */
  x: number;
  /** Avance del zigzag (0 a 1) y cuánto mira la cuenta regresiva. Los conos no se animan: son fijos en la pista. */
  wu: number;
  look: number;
  /** Cabeceo de la cámara RGB-D (radianes). */
  nod: number;
};

export const FACE_R = Math.PI / 2 + 0.5;
export const FACE_L = -FACE_R;
export const FACE_CAM = 0.25;

export function createSlalomState(): SlalomState {
  return { x: 1, wu: 0, look: 0, nod: 0 };
}

export function buildSlalom(s: SlalomState, onLap: () => void) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" }, repeat: -1, repeatDelay: 0.6, onRepeat: onLap });
  tl.to(s, { x: 0, duration: 0.7, ease: "power2.out" }, 0)
    .to(s, { look: 1, duration: 0.35, ease: "back.out(1.4)" }, 0.6)
    .to(s, { nod: 0.22, duration: 0.25, ease: "power2.out" }, "<")
    .to(s, { nod: -0.08, duration: 0.25 }, "+=0.2")
    .to(s, { nod: 0, look: 0, duration: 0.35 }, "+=0.05")
    // cruza esquivando los conos, de derecha a izquierda
    .to(s, { wu: 1, duration: 2.5, ease: "sine.inOut" }, ">-0.05");
  return tl;
}
