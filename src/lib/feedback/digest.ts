import { FEEDBACK_TYPE_LABELS, FEEDBACK_TYPES, type FeedbackTypeId } from "./rules";

// Mail diario al club con el feedback nuevo (#120). Sale solo si llegó algo desde el último. El asunto es siempre el
// mismo para poder filtrarlo y etiquetarlo en el correo. Sin datos personales (ni email ni cuenta de quien lo mandó):
// para eso está el link al detalle en /admin/feedback, que pide permiso. En la v2 cada fila puede sumar el issue y la
// persona asignada (#125/#127).

export const DIGEST_TO = "airclub@udesa.edu.ar";
export const DIGEST_SUBJECT = "[AIR Club] Feedback del sitio";

const EXCERPT_LENGTH = 280;
const TIME_ZONE = "America/Argentina/Buenos_Aires";

export type DigestItem = { id: string; type: FeedbackTypeId; path: string; message: string; createdAt: Date };
export type Digest = { subject: string; text: string; html: string };

const formatDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
}).format;

function excerpt(message: string): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  return oneLine.length > EXCERPT_LENGTH ? `${oneLine.slice(0, EXCERPT_LENGTH).trimEnd()}…` : oneLine;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** "3 feedback: 2 Bug, 1 Idea", en el orden de FEEDBACK_TYPES. */
export function digestSummary(items: DigestItem[]): string {
  const counts = FEEDBACK_TYPES.map((type) => [type, items.filter((i) => i.type === type).length] as const).filter(([, n]) => n > 0);
  const detail = counts.map(([type, n]) => `${n} ${FEEDBACK_TYPE_LABELS[type]}`).join(", ");
  return `${items.length} feedback: ${detail}`;
}

/** Arma el mail (texto y HTML) con los feedback ya ordenados. No se llama con una lista vacía: sin feedback no hay mail. */
export function buildDigest(items: DigestItem[], siteUrl: string): Digest {
  const base = siteUrl.replace(/\/$/, "");
  const summary = digestSummary(items);
  const intro = `Llegó feedback nuevo desde el último resumen. ${summary}.`;

  const text = [
    intro,
    "",
    ...items.flatMap((item) => [
      `${FEEDBACK_TYPE_LABELS[item.type]} · ${item.path} · ${formatDate(item.createdAt)}`,
      excerpt(item.message),
      `${base}/admin/feedback/${item.id}`,
      "",
    ]),
    `Todo el feedback: ${base}/admin/feedback`,
  ].join("\n");

  const rows = items
    .map(
      (item) => `<tr><td style="padding:12px 0;border-top:1px solid #dee2de">
<p style="margin:0;font:600 14px sans-serif;color:#0d0407">${escapeHtml(FEEDBACK_TYPE_LABELS[item.type])} <span style="font:400 13px monospace;color:#6b6266">· ${escapeHtml(item.path)} · ${escapeHtml(formatDate(item.createdAt))}</span></p>
<p style="margin:6px 0;font:400 14px/1.5 sans-serif;color:#3d3538">${escapeHtml(excerpt(item.message))}</p>
<a href="${escapeHtml(`${base}/admin/feedback/${item.id}`)}" style="font:600 13px sans-serif;color:#a40c4c">Ver en el panel</a>
</td></tr>`,
    )
    .join("\n");

  const html = `<div style="max-width:600px">
<p style="font:400 15px/1.5 sans-serif;color:#0d0407">${escapeHtml(intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
${rows}
</table>
<p style="margin-top:16px;font:400 13px sans-serif"><a href="${escapeHtml(`${base}/admin/feedback`)}" style="color:#a40c4c">Todo el feedback</a></p>
</div>`;

  return { subject: DIGEST_SUBJECT, text, html };
}
