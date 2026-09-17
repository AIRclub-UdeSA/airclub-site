"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { NavHoverHighlight } from "./NavHoverHighlight";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/plataformas", label: "Robots" },
  { href: "/equipo", label: "Equipo" },
  { href: "/contacto", label: "Contacto" },
];

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(!isHome);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Cierra el menu mobile en cuanto cambia la ruta, ajustando el estado en el
  // mismo render en lugar de con un efecto (evita un re-render extra).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setVisible(pathname !== "/");
  }

  useEffect(() => {
    function checkVisibility() {
      const scrollThreshold = Math.min(window.innerHeight * 0.35, 260);
      const isPastGate = window.scrollY > scrollThreshold;
      if (isHome) {
        setVisible(isPastGate);
      } else {
        setVisible(true);
      }
      setScrolled(window.scrollY > 50);
    }

    function onEnter() {
      setVisible(true);
    }

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("air-enter-club", onEnter);
    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("air-enter-club", onEnter);
    };
  }, [isHome]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-3.5 z-[1000] px-4 pointer-events-none transition-all duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
      )}
    >
      <nav
        aria-label="Navegación principal"
        className={cn(
          "mx-auto flex max-w-4xl items-center justify-between rounded-full border border-border bg-bg/85 px-4 py-2 backdrop-blur-xl transition-all duration-300 pointer-events-auto",
          scrolled ? "border-border-strong/20 shadow-[0_4px_24px_rgba(0,0,0,0.06)] bg-bg/95" : ""
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 rounded-full pr-2 focus-visible:outline-none" aria-label="Ir al inicio">
          <Image
            src="/logo.png"
            alt="Logo AIR Club UdeSA"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full bg-white object-cover border border-border"
            priority
          />
          <span className="font-display text-[.92rem] font-extrabold tracking-tight text-text">AIR Club</span>
        </Link>

        <NavHoverHighlight>
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavItem key={link.href} href={link.href} active={isActive(pathname, link.href)}>
                {link.label}
              </NavItem>
            ))}
          </div>
        </NavHoverHighlight>

        <div className="flex items-center gap-2">
          <Link
            href="/contacto"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-crimson px-4 py-1.5 font-body text-[.78rem] font-semibold text-white transition-all hover:bg-crimson-hover"
          >
            Sumarme
          </Link>

          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col justify-center items-center gap-[4px] h-8 w-8 rounded-full border border-border bg-card p-1 md:hidden text-text"
          >
            <span className={cn("h-[1.5px] w-4 bg-current transition-transform duration-200", open && "translate-y-[5.5px] rotate-45")} />
            <span className={cn("h-[1.5px] w-4 bg-current transition-opacity duration-200", open && "opacity-0")} />
            <span className={cn("h-[1.5px] w-4 bg-current transition-transform duration-200", open && "-translate-y-[5.5px] -rotate-45")} />
          </button>
        </div>

        {open && (
          <div className="absolute inset-x-4 top-[calc(100%+8px)] flex flex-col gap-1 rounded-3xl border border-border bg-bg/95 p-4 shadow-xl backdrop-blur-2xl md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 font-body text-[.88rem] font-medium transition-colors text-text2 hover:text-crimson-text hover:bg-crimson/5",
                  isActive(pathname, link.href) && "text-crimson-text bg-crimson/10 font-bold"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              className="mt-2 text-center rounded-full bg-crimson py-2.5 font-body text-[.85rem] font-semibold text-white"
            >
              Sumarme al club
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative z-[1] px-0.5 py-1 font-body text-[.78rem] font-medium uppercase tracking-[.05em] text-text2 transition-colors hover:text-crimson-text",
        active && "text-crimson-text"
      )}
    >
      {children}
    </Link>
  );
}
