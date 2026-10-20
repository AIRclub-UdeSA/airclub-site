import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionEmail, getSessionName } from "@/lib/perfil/require-profile";
import { prisma } from "@/lib/prisma";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { PerfilHeader } from "@/components/perfil/PerfilHeader";
import { safeNext } from "@/lib/safe-next";
import { isProfileComplete, missingProfileFields } from "@/lib/perfil/completeness";

export const metadata: Metadata = {
  title: "Completá tu perfil, AIR Club UdeSA",
  robots: { index: false, follow: false },
};

export default async function CompletarPerfilPage({ searchParams }: PageProps<"/perfil/completar">) {
  const { next } = await searchParams;
  const target = safeNext(Array.isArray(next) ? next[0] : next, "/perfil?guardado=1");

  const email = await getSessionEmail();
  if (!email) redirect("/");

  const existing = await prisma.userProfile.findUnique({ where: { email } });
  if (existing && isProfileComplete(existing)) redirect(target);
  const missing = existing ? missingProfileFields(existing) : [];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col gap-10 px-6 pt-28 pb-24 sm:px-8 md:pt-36">
      <PerfilHeader eyebrow="Una sola vez" title="Completá tu perfil">
        <p className="font-body text-[1.05rem] leading-[1.7] text-text2">
          Lo pedimos una sola vez: con esto ya no vas a tener que volver a completar nada para inscribirte a una AIR
          Talk.
        </p>
        {missing.length > 0 && (
          <p className="font-body text-[.95rem] font-medium leading-[1.7] text-crimson-text">Te falta: {missing.join(", ")}.</p>
        )}
        <p className="font-body text-[.92rem] leading-[1.7] text-text3">
          Usamos estos datos para la inscripción a las charlas y para saber quiénes vienen.
        </p>
      </PerfilHeader>
      <PerfilForm existing={existing ?? undefined} defaultName={await getSessionName()} submitLabel={existing ? "Guardar perfil" : "Crear perfil"} next={target} />
    </div>
  );
}
