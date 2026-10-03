import { prisma } from "@/lib/prisma";
import { requireSectionAccess } from "@/lib/admin/permissions";
import { getFoundersPhoto } from "@/lib/team";
import { EquipoManager, type AdminMember } from "./EquipoManager";

export default async function AdminEquipoPage() {
  await requireSectionAccess("equipo");

  const [rows, foundersPhoto] = await Promise.all([
    prisma.teamMember.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    getFoundersPhoto(),
  ]);
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
    <>
      <p className="max-w-prose text-sm text-text2">
        Así se ve /equipo. Pasá el mouse por una foto para cambiarla, o tocá el lápiz para editar los datos. Los cambios se ven en el sitio sin
        redeploy.
      </p>
      {/* A todo el ancho de la ventana, como /equipo, aunque el panel tenga el contenido más angosto. */}
      <div className="mx-[calc(50%-50vw)]">
        <EquipoManager members={members} foundersPhoto={foundersPhoto} />
      </div>
    </>
  );
}
