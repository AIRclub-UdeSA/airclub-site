import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canEditSection, requireSectionView } from "@/lib/admin/permissions";
import { FEEDBACK_TYPE_LABELS } from "@/lib/feedback/rules";
import { formatFeedbackDate, StatusBadge } from "../shared";
import { StatusForm } from "../StatusForm";

const THEME_LABELS: Record<string, string> = { light: "Claro", dark: "Oscuro" };

export default async function AdminFeedbackDetailPage({ params }: PageProps<"/admin/feedback/[id]">) {
  const admin = await requireSectionView("feedback");
  // Hoy "feedback" es de edición, así que quien la ve también puede editar; el chequeo queda por si cambia el nivel.
  const canEdit = canEditSection(admin, "feedback");

  const { id } = await params;
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) notFound();

  const context: [string, string][] = [
    ["Recibido", formatFeedbackDate(feedback.createdAt)],
    ["Pantalla", feedback.viewport ?? "—"],
    ["Tema", feedback.theme ? (THEME_LABELS[feedback.theme] ?? feedback.theme) : "—"],
    ["Navegador", feedback.userAgent ?? "—"],
  ];

  return (
    <div className="flex flex-col gap-8">
      <Link href="/admin/feedback" className="text-sm font-medium text-text2 hover:text-crimson-text">
        ← Todo el feedback
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={feedback.status} />
          <h2 className="font-display text-xl font-bold text-text">{FEEDBACK_TYPE_LABELS[feedback.type]}</h2>
        </div>
        <p className="font-mono text-sm text-text3">
          en{" "}
          <a href={feedback.path} target="_blank" rel="noreferrer" className="break-all text-crimson-text hover:underline">
            {feedback.path}
          </a>
        </p>
      </header>

      <p className="max-w-prose whitespace-pre-wrap break-words rounded-[var(--r-md)] border border-border bg-card p-5 text-text">{feedback.message}</p>

      {canEdit && <StatusForm id={feedback.id} status={feedback.status} />}

      <section className="flex flex-col gap-3">
        <h3 className="font-display text-base font-bold text-text">Contexto técnico</h3>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
          {context.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="font-mono text-xs uppercase tracking-[.12em] text-text3 sm:pt-0.5">{label}</dt>
              <dd className="break-words text-text2">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {canEdit && (
        <section className="flex flex-col gap-3">
          <h3 className="font-display text-base font-bold text-text">Quién lo mandó</h3>
          <p className="text-sm text-text2">
            {feedback.accountEmail ? (
              <>
                Con sesión: <span className="break-all text-text">{feedback.accountEmail}</span>
              </>
            ) : feedback.email ? (
              <>
                Sin sesión, dejó un email para responderle:{" "}
                <a href={`mailto:${feedback.email}`} className="break-all text-crimson-text hover:underline">
                  {feedback.email}
                </a>
              </>
            ) : (
              "Sin sesión y sin email: no hay forma de responderle."
            )}
          </p>
        </section>
      )}

      <Link href={`/admin/logs?entityId=${feedback.id}`} className="text-sm font-medium text-text3 hover:text-crimson-text">
        Ver historial de cambios
      </Link>
    </div>
  );
}
