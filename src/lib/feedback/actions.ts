"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionEmail } from "@/lib/perfil/require-profile";
import { HONEYPOT_FIELD, trimUserAgent, validateFeedback } from "./rules";
import { clientIp, hashIp, isRateLimited } from "./spam";

export type SendFeedbackState = { status: "idle" | "sent" | "error"; error: string | null };

/**
 * Guarda un feedback del botón flotante (#121). No pide sesión: si la hay, se guarda la cuenta y se ignora el
 * email del formulario. El navegador se toma del header (no del formulario) y la IP solo se guarda hasheada.
 */
export async function sendFeedbackAction(_prev: SendFeedbackState, formData: FormData): Promise<SendFeedbackState> {
  // Campo trampa lleno: se responde como si se hubiera guardado, así el bot no aprende a esquivarlo.
  if (String(formData.get(HONEYPOT_FIELD) ?? "")) return { status: "sent", error: null };

  const accountEmail = await getSessionEmail();
  const result = validateFeedback({
    type: String(formData.get("type") ?? ""),
    message: String(formData.get("message") ?? ""),
    path: String(formData.get("path") ?? ""),
    viewport: String(formData.get("viewport") ?? ""),
    theme: String(formData.get("theme") ?? ""),
    email: accountEmail ? "" : String(formData.get("email") ?? ""),
  });
  if (!result.ok) return { status: "error", error: result.error };

  const secret = process.env.AUTH_SECRET;
  if (!secret) return { status: "error", error: "No se pudo enviar. Probá de nuevo más tarde." };

  const requestHeaders = await headers();
  const ipHash = hashIp(clientIp(requestHeaders.get("x-forwarded-for"), requestHeaders.get("x-real-ip")), secret);

  try {
    const limited = await isRateLimited(ipHash, (hash, since) =>
      prisma.feedback.count({ where: { ipHash: hash, createdAt: { gte: since } } }),
    );
    if (limited) return { status: "error", error: "Mandaste varios comentarios seguidos. Probá de nuevo en un rato." };

    await prisma.feedback.create({
      data: {
        ...result.data,
        userAgent: trimUserAgent(requestHeaders.get("user-agent")),
        accountEmail,
        ipHash,
      },
    });
  } catch {
    return { status: "error", error: "No se pudo enviar. Probá de nuevo." };
  }

  return { status: "sent", error: null };
}
