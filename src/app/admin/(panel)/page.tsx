import Link from "next/link";
import { canAccessSection, requireAdminSession } from "@/lib/admin/permissions";

// Una tarjeta por lugar al que la persona puede entrar, para que quien no conoce el panel sepa
// adónde ir. `section: null` = herramienta solo para ADMIN (no es una sección asignable).
const DESTINATIONS: { href: string; title: string; description: string; section: string | null }[] = [
  {
    href: "/admin/talks",
    title: "Charlas",
    description: "Crear, editar y borrar las charlas de /talks, con sus fotos y videos.",
    section: "talks",
  },
  {
    href: "/admin/equipo",
    title: "Equipo",
    description: "Sumar gente a /equipo, cambiar fotos y links, y ocultar a quien ya no esté.",
    section: "equipo",
  },
  {
    href: "/admin/usuarios",
    title: "Usuarios",
    description: "Quién puede entrar al panel y qué secciones puede editar cada persona.",
    section: null,
  },
  {
    href: "/admin/logs",
    title: "Logs",
    description: "Historial de cambios: quién modificó qué y cuándo.",
    section: null,
  },
];

const ROLE_LABELS = { ADMIN: "Admin (acceso a todo)", EDITOR: "Editor" } as const;

export default async function AdminHomePage() {
  const admin = await requireAdminSession();
  const visible = DESTINATIONS.filter((d) => (d.section ? canAccessSection(admin, d.section) : admin.role === "ADMIN"));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-text2">
        Hola, <span className="font-medium text-text">{admin.email}</span>. Rol: <span className="font-medium text-text">{ROLE_LABELS[admin.role]}</span>.
      </p>

      {visible.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="flex h-full flex-col gap-2 rounded-[var(--r-card)] border border-border bg-card p-6 transition-colors hover:border-crimson"
              >
                <span className="font-display text-lg font-bold text-text">{d.title}</span>
                <span className="text-sm text-text2">{d.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="max-w-prose text-sm text-text3">
          Todavía no tenés ninguna sección asignada. Pedile a alguien con rol Admin que te sume desde Usuarios.
        </p>
      )}
    </div>
  );
}
