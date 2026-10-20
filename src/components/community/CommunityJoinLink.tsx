"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunityState } from "./use-community-state";

/**
 * El enlace de "Sumarme" de la barra y de /proximamente, según la sesión (el mismo estado que CommunityJoinAction):
 * sin sesión lleva a /contacto, que tiene el botón para entrar; con sesión y el perfil sin completar, a completarlo
 * (y de ahí vuelve a la página actual); con el perfil completo no se muestra. Mientras no se sabe ocupa su lugar sin
 * verse, para que la barra no parpadee. `className` lo pone cada superficie.
 */
export function CommunityJoinLink({
  className,
  guestLabel,
  incompleteLabel = "Completar mi perfil",
  suffix,
}: {
  className: string;
  guestLabel: string;
  incompleteLabel?: string;
  /** Algo que va después del texto en ambos casos (por ejemplo, una flecha). */
  suffix?: React.ReactNode;
}) {
  const state = useCommunityState();
  const pathname = usePathname();

  if (state === "member") return null;
  // Ya está en la página de completar el perfil: un enlace a sí misma no sirve.
  if (state === "incomplete" && pathname.startsWith("/perfil/completar")) return null;

  const loading = state === "loading";
  const href = state === "incomplete" ? `/perfil/completar?next=${encodeURIComponent(pathname)}` : "/contacto";

  return (
    <Link
      href={href}
      aria-hidden={loading || undefined}
      tabIndex={loading ? -1 : undefined}
      className={loading ? `${className} invisible` : className}
    >
      <span>{state === "incomplete" ? incompleteLabel : guestLabel}</span>
      {suffix}
    </Link>
  );
}
