/**
 * Valida un destino de "volver después de loguearse" (?next=...) para que solo pueda ser una
 * ruta propia del sitio, nunca una URL externa (evita un open-redirect vía ese parámetro).
 */
export function safeNext(next: string | undefined | null, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
