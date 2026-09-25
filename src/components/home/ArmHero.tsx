"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";
import { ARM_HERO_STILL, ARM_HERO_STILL_LAYOUT } from "./arm-hero-still";
import type { ArmView } from "./RobotArm3D";

// El canvas 3D real cubre TODA la seccion del hero (para que la pelota se pueda arrastrar por toda
// la pantalla, sin quedar acotada al ancho angosto de la "I"), pero el brazo tiene que dibujarse
// exactamente donde y como se ve la foto fija. Para que sea 1:1 por construccion (no "casi igual"),
// la camara de RobotArm3D es fija y esto solo mide el espaciador `.arm-canvas-container` (donde
// esta centrada la foto) y devuelve DOS cosas calculadas juntas, con los mismos numeros:
//  - `still`: la caja de la foto en px ENTEROS relativos a la seccion. Chrome redondea a px enteros
//    la posicion de una imagen al pintarla (con 594.5 la manda a 594 o 595 segun el caso), mientras
//    WebGL dibuja con precision de subpixel: dejar la posicion fraccionaria hacia que la foto
//    "saltara" hasta 1px respecto del canvas vivo. Al fijarla nosotros en enteros ya no hay nada
//    que redondear.
//  - `view`: la ventana de render del canvas, derivada de ESA caja ya redondeada (no del espaciador
//    crudo): centro y escala salen de donde de verdad se pinta la foto. RobotArm3D lo traduce a
//    setViewOffset (ver CameraView ahi).
// Se mide el espaciador y no la fila de letras: tienen alto y centro distintos (margin-bottom
// negativo del espaciador).
type StillBox = { left: number; top: number; width: number; height: number };

function useArmView(
  containerRef: React.RefObject<HTMLElement | null>,
  sectionRef: React.RefObject<HTMLElement | null>,
  rowRef: React.RefObject<HTMLElement | null>
) {
  const [state, setState] = useState<{ view: ArmView; still: StillBox } | null>(null);

  useLayoutEffect(() => {
    function recompute() {
      const container = containerRef.current;
      const section = sectionRef.current;
      if (!container || !section) return;
      const c = container.getBoundingClientRect();
      const s = section.getBoundingClientRect();
      if (c.height === 0 || s.height === 0) return;
      const { widthFactor, heightFactor, dx, dy } = ARM_HERO_STILL_LAYOUT;
      // centro del espaciador relativo a la seccion, y centro ideal de la foto (con su descentrado)
      const ccx = c.left + c.width / 2 - s.left;
      const ccy = c.top + c.height / 2 - s.top;
      const width = Math.round(widthFactor * c.height);
      const height = Math.round(heightFactor * c.height);
      const left = Math.round(ccx + dx * c.height - width / 2);
      const top = Math.round(ccy + dy * c.height - height / 2);
      // Escala y centro del canvas vivo, desde la caja entera: el alto entero de la foto equivale a
      // heightFactor alturas de espaciador, y el centro cae donde el capturado (ver ARM_HERO_STILL_LAYOUT).
      const h = height / heightFactor;
      const next = {
        view: { cx: left + width / 2 - dx * h, cy: top + height / 2 - dy * h, h },
        still: { left, top, width, height },
      };
      setState((prev) =>
        prev &&
        prev.still.left === left &&
        prev.still.top === top &&
        prev.still.width === width &&
        prev.still.height === height
          ? prev
          : next
      );
    }

    recompute();
    // Medir de nuevo ni bien terminan de cargar las tipografias: "logo" (Anton, para las letras
    // A/I/R gigantes) es una web font — si todavia no cargo en este primer render se mide con la
    // tipografia de repuesto del navegador (otro ancho, el espaciador queda en otro lugar) y nada
    // avisaba cuando la fuente terminaba de cargar. No se veia en pruebas repetidas porque el
    // navegador ya tenia la fuente en cache. El ResizeObserver cubre lo mismo (las letras cambian
    // de ancho => cambia la fila) y cualquier otro cambio de layout, no solo el resize de ventana.
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) recompute();
    });
    const ro = new ResizeObserver(recompute);
    for (const el of [containerRef.current, sectionRef.current, rowRef.current]) if (el) ro.observe(el);
    window.addEventListener("resize", recompute);
    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [containerRef, sectionRef, rowRef]);

  return state;
}

// Cuanto tiempo conviven la foto fija y el brazo 3D (ya montado y "congelado" en la misma pose)
// antes de sacar la foto y soltarle la animación al brazo. Ver el flujo completo en ArmHero() más
// abajo: no alcanza con reaccionar al primer frame porque ese frame podría tardar en llegar (WebGL
// inicializando) o el navegador podría trabarse un instante justo después; este colchón asegura que
// cuando la foto se va, siempre hay algo ya estable debajo, no una animación a mitad de arrancar.
const HANDOFF_DELAY_MS = 500;

// Imagen fija mientras carga el brazo 3D WebGL: es una captura del propio RobotArm3D en su pose de
// reposo exacta (REST_POSE + la pelota en BALL_HOME, ver RobotArm3D.tsx), no un dibujo aparte.
// Como la camara de RobotArm3D es fija (la ventana de render solo se desplaza, ver CameraView), el
// brazo se dibuja con la misma perspectiva y la misma escala px/unidad que en esta foto en cualquier
// tamaño de pantalla: foto y canvas coinciden por construccion, no por ajuste.
// El contrato: la imagen es un recorte del canvas vivo (fondo transparente) alrededor del centro del
// espaciador `.arm-canvas-container`; su tamaño y su descentrado exacto (el recorte se hace en
// pixeles enteros, asi que no cae justo en el centro) estan en ARM_HERO_STILL_LAYOUT, en unidades
// del alto del espaciador (--arm-h), por eso se posiciona en CSS puro y ya es correcta en el
// primer pintado, sin esperar a que JS mida nada. Va como data URI (no como archivo en /public)
// para que aparezca en el mismo frame que el resto del bundle, sin un request de red aparte.
// Si cambia algo visible en esa pose (REST_POSE, BALL_HOME, color de la pelota, geometria, luces, camara)
// hay que recapturarla y verificarla: pasos y scripts en scripts/arm-hero-still/README.md. La
// verificacion compara la foto contra el canvas vivo pixel a pixel: la posicion tiene que dar
// corrimiento 0 en todos los tamaños de pantalla.
function ArmStillImage({ ready, box }: { ready: boolean; box?: StillBox }) {
  const { widthFactor, heightFactor, dx, dy } = ARM_HERO_STILL_LAYOUT;
  // Sin `box` (antes de que JS mida, o sea el primer pintado del HTML del servidor) se posiciona en CSS
  // puro dentro del espaciador: aproximada, pero visible desde el primer frame. Con `box` (px enteros
  // relativos a la seccion, ver useArmView) queda clavada en el mismo lugar que el canvas vivo.
  // Nada de `transform` para centrarla: Chrome redondea la capa por su cuenta.
  const style: React.CSSProperties = box
    ? { left: box.left, top: box.top, width: box.width, height: box.height }
    : {
        width: `calc(var(--arm-h) * ${widthFactor})`,
        height: `calc(var(--arm-h) * ${heightFactor})`,
        left: `calc(50% + var(--arm-h) * ${dx - widthFactor / 2})`,
        top: `calc(50% + var(--arm-h) * ${dy - heightFactor / 2})`,
      };
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ visibility: ready ? "hidden" : "visible" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- data URI: no aplica optimizacion de next/image */}
      <img src={ARM_HERO_STILL} alt="" className="absolute max-w-none" style={style} />
    </div>
  );
}

const RobotArm3D = dynamic(() => import("./RobotArm3D"), {
  ssr: false,
  loading: () => null,
});

export function ArmHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const armState = useArmView(containerRef, sectionRef, rowRef);
  const armView = armState?.view ?? null;

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // 1. armPainted: RobotArm3D ya montó y pintó su primer frame, congelado en la misma pose que
  //    la foto (frozen=true mientras animationEnabled sea false) — conviven siendo indistinguibles.
  // 2. Tras HANDOFF_DELAY_MS ahí conviviendo sin sobresaltos: se saca la foto (arm3dReady) y se
  //    suelta la animación (animationEnabled) al mismo tiempo, así el brazo empieza a moverse
  //    justo cuando ya no queda nada tapando el canvas.
  const [armPainted, setArmPainted] = useState(false);
  const [arm3dReady, setArm3dReady] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(false);

  useEffect(() => {
    if (!armPainted) return;
    const id = setTimeout(() => {
      setArm3dReady(true);
      setAnimationEnabled(true);
    }, HANDOFF_DELAY_MS);
    return () => clearTimeout(id);
  }, [armPainted]);

  const handleEnter = () => {
    setIsClicked(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("air-enter-club"));
    }
    setTimeout(() => {
      document.getElementById("contenido")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => setIsClicked(false), 800);
    }, 150);
  };

  return (
    <section ref={sectionRef} className="arm-gate-screen select-none" aria-label="Pantalla de bienvenida AIR Club">
      <div ref={rowRef} className="relative arm-stage-row">
        <span className="hero-letter">A</span>
        {/* Espaciador invisible: mantiene el kerning exacto entre A y R en su lugar de siempre.
            La foto fija vive acá adentro (no en el canvas grande de abajo) para que seguir
            alineada con la pose "congelada" del brazo mientras conviven. */}
        <div ref={containerRef} className="arm-canvas-container pointer-events-none">
          {/* antes de medir: version CSS aproximada, dentro del espaciador */}
          {!armState && <ArmStillImage ready={arm3dReady} />}
        </div>
        <span className="hero-letter">R</span>
      </div>

      {/* El canvas 3D real cubre TODA la seccion del hero (no solo el ancho de "AIR"), para que la
          pelota se pueda arrastrar por toda la pantalla sin paredes invisibles. Queda invisible
          (opacity 0) mientras conviven con la foto y se cambia por ella en el mismo commit que
          arm3dReady: al ser identicos no hay fade que valga, y asi no se superponen dos capas con
          bordes suavizados (que se verian levemente mas gruesos mientras conviven). */}
      {armState && <ArmStillImage ready={arm3dReady} box={armState.still} />}
      {armView && (
        <div
          className="absolute inset-0 pointer-events-auto flex items-end justify-center"
          style={{ opacity: arm3dReady ? 1 : 0 }}
          // dato de solo lectura para las herramientas de captura (herramientas-brazo-hero): el centro
          // REAL que usa el canvas, ya redondeado a px enteros, no el ideal del espaciador.
          data-arm-view={`${armView.cx},${armView.cy},${armView.h}`}
        >
          <RobotArm3D
            isHovered={isHovered}
            isClicked={isClicked}
            frozen={!animationEnabled}
            onReady={() => setArmPainted(true)}
            view={armView}
          />
        </div>
      )}

      {/* Gate Action: Botón de entrada al club estilo Flying Papers */}
      {/* `relative z-10`: el canvas 3D cubre toda la seccion (absolute inset-0) y, sin esto, queda encima
          del boton y se traga los clics y el hover. */}
      <div className="relative z-10 mt-12 sm:mt-16 flex flex-col items-center">
        <button
          type="button"
          onClick={handleEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="gate-action-btn group"
        >
          <span>Entrar al club</span>
          <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-1" />
        </button>
      </div>
    </section>
  );
}

