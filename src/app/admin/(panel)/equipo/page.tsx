import { prisma } from "@/lib/prisma";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { EquipoManager, type AdminMember } from "./EquipoManager";

export default async function AdminEquipoPage() {
  await requireSectionAccess("equipo");

  const rows = await prisma.teamMember.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const members: AdminMember[] = rows.map((m) => ({
    id: m.id,
    name: m.name,
    group: m.group,
    role: m.role ?? "",
    linkedin: m.linkedin ?? "",
    github: m.github ?? "",
    photo: m.linkedinPhoto ?? m.photoUrl ?? "",
    active: m.active,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl font-bold text-text">Equipo</h2>
        <p className="mt-1 max-w-prose text-sm text-text2">
          Así se ve /equipo. Pasá el mouse por una foto para cambiarla, o tocá un nombre para editar sus datos. Los cambios se ven en el sitio sin
          redeploy.
        </p>
      </div>

      <EquipoManager members={members} />
    </div>
  );
}
