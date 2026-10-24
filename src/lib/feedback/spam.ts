import { createHmac } from "node:crypto";

// Protección contra spam del feedback (#121). El formulario es abierto, así que hay dos frenos sin servicios
// nuevos: un campo trampa (HONEYPOT_FIELD, en rules.ts porque lo usa el formulario) y un límite de envíos
// por IP, contado en la misma tabla Feedback.
// Si igual entra spam, el paso siguiente es Turnstile de Cloudflare.

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/** La IP se guarda solo como HMAC con un secreto del servidor: sirve para contar envíos, no para saber quién es. */
export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex");
}

/** Primera IP de x-forwarded-for (la del cliente en Vercel), o x-real-ip, o "unknown" si no hay ninguna. */
export function clientIp(forwardedFor: string | null, realIp: string | null): string {
  return forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
}

/**
 * true si esa IP ya llegó al límite en la última ventana. `countSince` cuenta los feedback de ese ipHash
 * desde una fecha (en la action es un count de Prisma); se pasa como función para poder probarlo sin base.
 */
export async function isRateLimited(
  ipHash: string,
  countSince: (ipHash: string, since: Date) => Promise<number>,
  now = new Date(),
): Promise<boolean> {
  const count = await countSince(ipHash, new Date(now.getTime() - RATE_LIMIT_WINDOW_MS));
  return count >= RATE_LIMIT_MAX;
}
