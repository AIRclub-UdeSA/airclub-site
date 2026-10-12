import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { signInAction } from "@/lib/admin/auth-actions";

export const metadata: Metadata = {
  title: "No se pudo ingresar, AIR Club UdeSA",
  robots: { index: false, follow: false },
};

/**
 * `pages.error` de Auth.js (src/auth.ts). Sin esto, un login rechazado (por ejemplo, una cuenta
 * que no es @udesa.edu.ar, error `AccessDenied`) caia en la pagina por defecto de Auth.js, en
 * ingles y sin el diseño del sitio.
 */
export default async function IngresarErrorPage({ searchParams }: PageProps<"/ingresar/error">) {
  const { error } = await searchParams;
  const errorKey = Array.isArray(error) ? error[0] : error;
  const accessDenied = errorKey === "AccessDenied";

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-15 pt-28 pb-24 text-center max-md:px-5.5">
      <SectionLabel>Ingresar</SectionLabel>
      <h1 className="mb-4 font-display text-[clamp(1.5rem,4.5vw,3.4rem)] font-extrabold tracking-tight text-text">
        {accessDenied ? "Entrá con tu cuenta @udesa.edu.ar" : "No se pudo iniciar sesión"}
      </h1>
      <p className="mb-8 max-w-[480px] text-[.95rem] leading-[1.75] text-text2">
        {accessDenied
          ? "Por ahora solo pueden ingresar las cuentas de Google de UdeSA. Probá de nuevo eligiendo esa cuenta."
          : "Algo falló del lado de Google o del nuestro. Probá de nuevo en un rato."}
      </p>
      <form action={signInAction}>
        <Button type="submit" variant="primary">
          Continuar con Google
        </Button>
      </form>
      {/* pages.error tambien recibe los logins de /admin/login, y signInAction vuelve a /bienvenida. */}
      <p className="mt-6 text-[.85rem] text-text2">
        ¿Querías entrar al panel?{" "}
        <Link href="/admin/login" className="text-text underline underline-offset-4 hover:text-crimson-text">
          Volver a /admin/login
        </Link>
      </p>
    </section>
  );
}
