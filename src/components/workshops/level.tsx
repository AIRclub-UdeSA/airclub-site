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
