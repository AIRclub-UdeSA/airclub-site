/**
 * Estado de cada paso de un recorrido según lo que la persona ya marcó como hecho. Sin dependencias de servidor: lo usan
 * /workshops (en el cliente) y /perfil/aprendizaje (en el servidor), así las dos pantallas cuentan lo mismo.
 *
 * - `done`: ya lo hizo (gris claro en la ruta).
 * - `next`: el primero que le falta, en orden (carmesí macizo, "Seguí acá"; sin nada hecho, "Empezá acá").
 * - `todo`: el resto.
 *
 * "El primero que le falta" va por orden y no por prerequisitos: si hizo la 01 y la 03, el siguiente es la 02.
 */
export type StepState = "done" | "next" | "todo";

export function routeStates(slugs: string[], completed: ReadonlySet<string>): Map<string, StepState> {
  const next = slugs.find((s) => !completed.has(s));
  return new Map(slugs.map((s) => [s, completed.has(s) ? "done" : s === next ? "next" : "todo"]));
}
