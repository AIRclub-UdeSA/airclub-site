import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";
import { buildDigest, DIGEST_TO } from "@/lib/feedback/digest";

// Sin dominio propio verificado en Resend, solo se puede mandar desde esta dirección y a la cuenta dueña de la API key
// (por eso la cuenta de Resend es la del club). Con un dominio verificado, se cambia con FEEDBACK_DIGEST_FROM.
const DEFAULT_FROM = "AIR Club <onboarding@resend.dev>";

/**
 * Mail diario al club con el feedback que todavía no salió en un resumen (#120). Lo llama el cron de Vercel
 * (vercel.json), que manda `Authorization: Bearer <CRON_SECRET>`. Si no hay feedback nuevo, no manda nada.
 * Cada feedback se marca con `digestedAt` recién cuando el mail salió: si Resend falla, sale en el próximo.
 *
 * `?preview=1` devuelve el HTML del mail sin mandarlo ni marcar nada, para ver el formato.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Sin permiso", { status: 401 });
  }

  const items = await prisma.feedback.findMany({
    where: { digestedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, type: true, path: true, message: true, createdAt: true },
  });
  if (items.length === 0) return Response.json({ sent: 0 });

  const digest = buildDigest(items, SITE_URL);
  if (new URL(request.url).searchParams.get("preview") === "1") {
    return new Response(digest.html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return new Response("Falta RESEND_API_KEY", { status: 500 });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.FEEDBACK_DIGEST_FROM || DEFAULT_FROM,
      to: [DIGEST_TO],
      subject: digest.subject,
      text: digest.text,
      html: digest.html,
    }),
  });
  if (!response.ok) {
    console.error("[feedback-digest] Resend respondió", response.status, await response.text());
    return new Response("No se pudo mandar el mail", { status: 502 });
  }

  await prisma.feedback.updateMany({ where: { id: { in: items.map((i) => i.id) } }, data: { digestedAt: new Date() } });
  return Response.json({ sent: items.length });
}
