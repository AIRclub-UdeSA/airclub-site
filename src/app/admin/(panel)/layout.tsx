import Link from "next/link";
import { signOut } from "@/auth";
import { requireAdminSession } from "@/lib/admin/permissions";

// Etapa 4 (piloto /admin/talks) agrega mas items aca, filtrados por seccion igual que este.
const NAV_ITEMS: { href: string; label: string; section: string | null }[] = [{ href: "/admin", label: "Inicio", section: null }];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdminSession();
  const visibleItems = NAV_ITEMS.filter((item) => !item.section || admin.role === "ADMIN" || admin.sections.includes(item.section));

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 pb-20 pt-32 sm:px-8 md:px-12 md:pt-36">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-text3">Panel de admin</p>
          <h1 className="font-display text-2xl font-black uppercase text-text">AIR Club</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          {visibleItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-text2 hover:text-crimson">
              {item.label}
            </Link>
          ))}
          {admin.role === "ADMIN" && (
            <Link href="/admin/usuarios" className="text-sm font-medium text-text2 hover:text-crimson">
              Usuarios
            </Link>
          )}
          <span className="text-sm text-text3">{admin.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="text-sm font-medium text-text2 hover:text-crimson">
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
