import type { WorkshopLevel } from "@/lib/workshops";

export const LEVEL_LABEL: Record<WorkshopLevel, string> = {
  inicial: "Inicial",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

/**
 * Nodo de la ruta: el relleno dice el nivel (vacío = inicial, medio = intermedio, macizo = avanzado), como el color dice
 * el estado en /talks. Cuadrado y con contorno de 1px, igual que los nodos del cronograma. Ya hecho, gris claro.
 */
export function LevelNode({ level, done = false, className = "" }: { level: WorkshopLevel; done?: boolean; className?: string }) {
  const fill = done
    ? "border-text/25 bg-text/20"
    : level === "avanzado"
      ? "bg-crimson border-crimson"
      : level === "intermedio"
        ? "border-crimson-text bg-[linear-gradient(to_top,var(--crimson)_50%,var(--bg)_50%)]"
        : "border-crimson-text bg-bg";
  return <span className={`block size-3.5 shrink-0 border ${fill} ${className}`} aria-hidden="true" />;
}

/** Qué significa el relleno de los nodos de la ruta. Va junto al progreso, fuera de la ruta. */
export function LevelLegend() {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-[.7rem] uppercase tracking-[.16em] text-text3">
      {(Object.keys(LEVEL_LABEL) as WorkshopLevel[]).map((level) => (
        <div key={level} className="flex items-center gap-2">
          <dt>
            <LevelNode level={level} />
          </dt>
          <dd>{LEVEL_LABEL[level]}</dd>
        </div>
      ))}
    </dl>
  );
}
