import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
import { AdminUserForm } from "./AdminUserForm";
import { RemoveAdminUserButton } from "./RemoveAdminUserButton";

export default async function AdminUsuariosPage() {
  const admin = await requireAdminSession();
  if (admin.role !== "ADMIN") redirect("/admin/sin-permiso");

  const users = await prisma.adminUser.findMany({ orderBy: { email: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Personas con acceso</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Solo entra al panel quien esté acá con un mail @udesa.edu.ar. Admin ve y gestiona todo, Editor solo las
          secciones listadas.
        </p>
      </div>

      <AdminUserForm />

      <ul className="divide-y divide-border/60 border-y border-border/60">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium text-text">{u.email}</p>
              <p className="font-mono text-xs text-text3">
                {u.role}
                {u.role === "EDITOR" && u.sections.length > 0 ? ` · ${u.sections.join(", ")}` : ""}
              </p>
            </div>
            <RemoveAdminUserButton id={u.id} email={u.email} />
          </li>
        ))}
      </ul>
    </div>
  );
}
