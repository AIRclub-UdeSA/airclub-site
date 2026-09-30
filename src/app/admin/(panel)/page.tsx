import { requireAdminSession } from "@/lib/admin/permissions";

export default async function AdminHomePage() {
  const admin = await requireAdminSession();

  return (
    <div className="rounded-[var(--r-card)] border border-border bg-card p-8">
      <p className="text-text2">
        Hola, <span className="font-medium text-text">{admin.email}</span>. Rol:{" "}
        <span className="font-mono text-sm">{admin.role}</span>.
      </p>
      <p className="mt-4 max-w-prose text-sm text-text3">
        Todavía no hay secciones de contenido para editar acá — el piloto de <code>/admin/talks</code> es el próximo
        paso del plan (Etapa 4 de <code>PLAN-ADMIN.md</code>).
      </p>
    </div>
  );
}
