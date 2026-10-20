"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCommunityState } from "./use-community-state";

type CommunityJoinLinkProps = {
  className: string;
  guestLabel: string;
  incompleteLabel?: string;
  /** Algo que va después del texto en ambos casos (por ejemplo, una flecha). */
  suffix?: React.ReactNode;
};

/**
 * El enlace de "Sumarme" de la barra y de /proximamente, según la sesión (el mismo estado que CommunityJoinAction):
 * sin sesión lleva a /contacto, que tiene el botón para entrar; con sesión y el perfil sin completar, a completarlo
 * (y de ahí vuelve a la página actual, con su query: en /eventos, "?evento=" deja abierto el modal); con el perfil
 * completo no se muestra. Mientras no se sabe ocupa su lugar sin verse, para que la barra no parpadee. `className` lo
 * pone cada superficie.
 *
 * useSearchParams() exige su propio límite de Suspense (si no, next build falla); mientras tanto, el enlace sin la query.
 */
export function CommunityJoinLink(props: CommunityJoinLinkProps) {
  return (
    <Suspense fallback={<JoinLink {...props} search="" />}>
      <JoinLinkWithSearch {...props} />
    </Suspense>
  );
}

function JoinLinkWithSearch(props: CommunityJoinLinkProps) {
  const search = useSearchParams().toString();
  return <JoinLink {...props} search={search} />;
}

function JoinLink({
  className,
  guestLabel,
  incompleteLabel = "Completar mi perfil",
  suffix,
  search,
}: CommunityJoinLinkProps & { search: string }) {
  const state = useCommunityState();
  const pathname = usePathname();

  if (state === "member") return null;
  // Ya está en la página de completar el perfil: un enlace a sí misma no sirve.
  if (state === "incomplete" && pathname.startsWith("/perfil/completar")) return null;

  const loading = state === "loading";
  const current = search ? `${pathname}?${search}` : pathname;
  const href = state === "incomplete" ? `/perfil/completar?next=${encodeURIComponent(current)}` : "/contacto";

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
