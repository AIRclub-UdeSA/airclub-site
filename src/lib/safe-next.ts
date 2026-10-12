/**
 * Valida un destino de "volver después de loguearse" (?next=...) para que solo pueda ser una
 * ruta propia del sitio, nunca una URL externa (evita un open-redirect vía ese parámetro).
 * No alcanza con rechazar "//": el navegador trata "/\evil.com" (y variantes con tab o salto de
 * línea) como "//evil.com". Por eso se resuelve contra un origen ficticio y se exige que no cambie.
 */
export function safeNext(next: string | undefined | null, fallback = "/"): string {
  if (!next || /[\\\t\r\n]/.test(next)) return fallback;
  const url = new URL(next, "http://x.invalid");
  if (url.origin !== "http://x.invalid") return fallback;
  return url.pathname + url.search + url.hash;
}
