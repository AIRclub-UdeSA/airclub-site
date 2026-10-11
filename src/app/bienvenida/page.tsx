import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeNext } from "@/lib/safe-next";

/**
 * Destino de signInAction (src/lib/admin/auth-actions.ts) y del login disparado desde el botón
 * "Inscribirme" (#50, src/components/talks/TalksHub.tsx) para el login público. Solo decide a
 * dónde mandar según si ya existe el perfil, nunca se queda: así el chequeo de sesión (que
 * depende de cookies, por lo tanto siempre dinámico) no vive en "/" y no le rompe el ISR
 * (`revalidate = 60` en src/app/page.tsx).
 *
 * `next` es a dónde volver después (por ejemplo, "/talks?inscribir=mi-charla"): si falta el
 * perfil, se arrastra a /perfil/completar y de ahí vuelve directo, en vez de perderse en "/".
 */
export default async function BienvenidaPage({ searchParams }: PageProps<"/bienvenida">) {
  const { next } = await searchParams;
  const target = safeNext(Array.isArray(next) ? next[0] : next);

  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const profile = await prisma.userProfile.findUnique({ where: { email: session.user.email } });
  redirect(profile ? target : `/perfil/completar?next=${encodeURIComponent(target)}`);
}
