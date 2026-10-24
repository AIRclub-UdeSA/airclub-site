import Link from "next/link";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { canViewSection, requireAdminSession } from "@/lib/admin/permissions";
import { countNewFeedback } from "@/lib/admin/feedback";

const NAV_ITEMS: { href: string; label: string; section: string | null }[] = [
  { href: "/admin", label: "Inicio", section: null },
  { href: "/admin/talks", label: "Charlas", section: "talks" },
  { href: "/admin/equipo", label: "Equipo", section: "equipo" },
  { href: "/admin/workshops", label: "Workshops", section: "workshops" },
];

function NewCountBadge({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-crimson px-1.5 py-px font-mono text-[0.7rem] font-semibold leading-4 text-white">
      <span className="sr-only">, nuevos: </span>
      {count}
    </span>
  );
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdminSession();
  const visibleItems = NAV_ITEMS.filter((item) => !item.section || canViewSection(admin, item.section));
  // En la v1 no hay otro aviso de que llegó feedback: el contador de nuevos es la forma de notarlo (#123).
  const newFeedback = canViewSection(admin, "feedback") ? await countNewFeedback() : 0;

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
            <>
              <Link href="/admin/usuarios" className="text-sm font-medium text-text2 hover:text-crimson">
                Usuarios
              </Link>
              <Link href="/admin/logs" className="text-sm font-medium text-text2 hover:text-crimson">
                Logs
              </Link>
              <Link href="/admin/cuentas" className="text-sm font-medium text-text2 hover:text-crimson">
                Cuentas
              </Link>
            </>
          )}
          {/* Fuera de NAV_ITEMS para que quede al final, como antes: también la ve un Editor con "comunidad". */}
          {canViewSection(admin, "comunidad") && (
            <Link href="/admin/comunidad" className="text-sm font-medium text-text2 hover:text-crimson">
              Comunidad
            </Link>
          )}
          {canViewSection(admin, "feedback") && (
            <Link href="/admin/feedback" className="inline-flex items-center gap-1.5 text-sm font-medium text-text2 hover:text-crimson">
              Feedback
              {newFeedback > 0 && <NewCountBadge count={newFeedback} />}
            </Link>
          )}
          <span className="text-sm text-text3">{admin.email}</span>
          <SignOutButton className="text-sm font-medium text-text2 hover:text-crimson">Salir</SignOutButton>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
