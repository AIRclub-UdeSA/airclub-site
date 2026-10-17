import Link from "next/link";

const TABS = [
  { href: "/perfil", label: "Datos" },
  { href: "/perfil/aprendizaje", label: "Aprendizaje" },
] as const;

/** Pestañas de /perfil: tus datos y tu aprendizaje (los workshops que marcaste como hechos). */
export function PerfilTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav aria-label="Secciones del perfil" className="flex gap-8 border-b border-text/20">
      {TABS.map((t) => {
        const current = t.href === active;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={current ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 font-mono text-[.78rem] font-semibold uppercase tracking-[.16em] transition-colors ${
              current ? "border-crimson text-crimson-text" : "border-transparent text-text3 hover:text-text"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
