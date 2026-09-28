import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin/permissions";
import { UsersManager } from "./UsersManager";

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

      <UsersManager users={users} />
    </div>
  );
}
