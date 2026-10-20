"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { preload } from "react-dom";

/** El CAD del Rosmaster (lo carga RosmasterModel; acá se precarga). */
export const ROSMASTER_MODEL_URL = "/models/rosmaster_unified.glb";

// three y fiber pesan ~1 MB: no van en la carga inicial de la landing. La pista y el robot se bajan cuando a la banda le
// falta pantalla y media para entrar, así llegan listos aunque se scrollee rápido, y después quedan montados. Con dos
// pantallas, en 1440x900 la banda ya quedaba adentro al cargar.
const NEAR_MARGIN = "150% 0px";

function TrackLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="font-mono text-[.74rem] uppercase tracking-widest text-[#a40c4c]/40 animate-pulse">
        Cargando modelo CAD...
      </span>
    </div>
  );
}

const RunwayCanvas = dynamic(() => import("./RunwayCanvas").then((m) => m.RunwayCanvas), {
  ssr: false,
  loading: TrackLoading,
});
// El Rosmaster que corre el slalom sobre esta banda (ver SeamRobot): un canvas fijo sobre toda la ventana
const SeamRobot = dynamic(() => import("./SeamRobot").then((m) => m.SeamRobot), { ssr: false });

export function RosmasterTrack() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // El GLB (925 KB) se pide junto con el JS y no después: useGLTF lo toma de esta precarga
        preload(ROSMASTER_MODEL_URL, { as: "fetch", crossOrigin: "anonymous" });
        setNear(true);
      },
      { rootMargin: NEAR_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="rosmaster-track"
      data-seam="slalom"
      className="relative w-full bg-[#0e0407] py-4 sm:py-8 overflow-hidden select-none"
      aria-label="ROSMASTER X3 CAD"
    >
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[520px]">{near ? <RunwayCanvas /> : <TrackLoading />}</div>
      {near && <SeamRobot />}
    </section>
  );
}
