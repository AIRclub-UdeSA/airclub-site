"use client";

import { signOut } from "next-auth/react";

/** Cierra sesión recargando la página. Una server action con redirect navega sin recargar, y el
 * menú de cuenta del Nav (que vive en el RootLayout y lee la sesión en el navegador) quedaba desactualizado. */
export function SignOutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => signOut({ redirectTo: "/" })} className={className}>
      {children}
    </button>
  );
}
