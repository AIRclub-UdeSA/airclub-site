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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Cierra el menu mobile en cuanto cambia la ruta, ajustando el estado en el
  // mismo render en lugar de con un efecto (evita un re-render extra).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-[1000] flex items-center justify-between border-b border-border backdrop-blur-2xl transition-all duration-400",
        scrolled ? "bg-bg/96 px-10 py-2.5 shadow-[0_2px_20px_rgba(164,12,76,0.07)]" : "bg-bg/82 px-10 py-4",
        "max-md:px-5 max-md:py-3"
      )}
    >
      <Link href="/" className="flex items-center gap-2.5" aria-label="Ir al inicio">
        <Image
          src="/logo.png"
          alt="Logo AIR Club UdeSA"
          width={36}
          height={36}
          className="h-9 w-9 rounded-full bg-white object-cover"
          priority
        />
        <span className="font-display text-[.95rem] font-extrabold tracking-tight text-text">AIR Club</span>
      </Link>

      <NavHoverHighlight>
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.href} href={link.href} active={isActive(pathname, link.href)}>
              {link.label}
            </NavItem>
          ))}
        </div>
      </NavHoverHighlight>

      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col gap-[5px] border-none bg-none p-2 md:hidden"
      >
        <span className={cn("h-[1.5px] w-[22px] bg-text transition-transform", open && "translate-y-[6.5px] rotate-45")} />
        <span className={cn("h-[1.5px] w-[22px] bg-text transition-opacity", open && "opacity-0")} />
        <span className={cn("h-[1.5px] w-[22px] bg-text transition-transform", open && "-translate-y-[6.5px] -rotate-45")} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-3 border-b border-border bg-bg/97 p-4.5 backdrop-blur-2xl md:hidden">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.href} href={link.href} active={isActive(pathname, link.href)}>
              {link.label}
            </NavItem>
          ))}
        </div>
      )}
    </nav>
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
