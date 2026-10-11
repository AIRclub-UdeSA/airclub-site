import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { safeNext } from "@/lib/safe-next";

export default async function CompletarPerfilPage({ searchParams }: PageProps<"/perfil/completar">) {
  const { next } = await searchParams;
  const target = safeNext(Array.isArray(next) ? next[0] : next, "/perfil?guardado=1");

  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const existing = await prisma.userProfile.findUnique({ where: { email: session.user.email } });
  if (existing) redirect(target);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col gap-10 px-6 pt-28 pb-24 sm:px-8 md:pt-36">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.14em] text-crimson-text">Una sola vez</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.2rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-text">
          Completá tu perfil
        </h1>
        <p className="mt-4 max-w-[52ch] font-body text-[1.05rem] leading-[1.7] text-text2">
          Lo pedimos una sola vez: con esto ya no vas a tener que volver a completar nada para inscribirte a una AIR
          Talk.
        </p>
      </div>
      <PerfilForm submitLabel="Crear perfil" next={target} />
    </div>
  );
}
