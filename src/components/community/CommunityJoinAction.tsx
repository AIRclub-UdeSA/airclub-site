"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { useCommunityState } from "./use-community-state";

/**
 * La acción de "Sumarme a la comunidad": ser miembro es tener el perfil completo, así que no hay un paso aparte.
 * Sin sesión, el botón entra con Google y /bienvenida lleva a /perfil/completar (y de ahí vuelve a `returnTo`); con
 * sesión y el perfil sin completar, lleva directo a completarlo; con el perfil completo no hay botón, solo la línea
 * de que ya es parte. Mientras no se sabe, el botón ocupa su lugar sin verse, para que la página no salte.
 *
 * `buttonClassName` lo pone cada superficie (/contacto y /equipo); el color del texto lo hereda del panel.
 */
export function CommunityJoinAction({
  label,
  buttonClassName,
  returnTo,
}: {
  label: string;
  buttonClassName: string;
  /** A dónde vuelve después de entrar o completar el perfil; por defecto, la página actual. */
  returnTo?: string;
}) {
  const state = useCommunityState();
  const pathname = usePathname();
  const target = returnTo ?? pathname;

  if (state === "member") {
    return (
      <p className="text-[.98rem] leading-[1.65] text-current/90">
        Ya sos parte de la comunidad.{" "}
        <Link href="/perfil" className="underline underline-offset-4 hover:opacity-80">
          Ver mi perfil
        </Link>
      </p>
    );
  }

  if (state === "incomplete") {
    return (
      <div>
        <p className="mb-4 max-w-[46ch] text-[.98rem] leading-[1.65] text-current/90">
          Ya entraste con Google. Para sumarte te falta completar tu perfil.
        </p>
        <Link href={`/perfil/completar?next=${encodeURIComponent(target)}`} className={buttonClassName}>
          <span>Completar mi perfil</span>
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={state === "loading"}
      aria-hidden={state === "loading" || undefined}
      tabIndex={state === "loading" ? -1 : undefined}
      onClick={() => signIn("google", { redirectTo: `/bienvenida?next=${encodeURIComponent(target)}` })}
      className={`${buttonClassName} ${state === "loading" ? "invisible" : "cursor-pointer"}`}
    >
      <span>{label}</span>
      <ArrowRight size={15} aria-hidden="true" />
    </button>
  );
}
