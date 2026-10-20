import type { Metadata } from "next";
import { Check, TriangleAlert } from "lucide-react";
import { getSessionName, requireUserProfile } from "@/lib/perfil/require-profile";
import { PerfilForm } from "@/components/perfil/PerfilForm";
import { PerfilHeader } from "@/components/perfil/PerfilHeader";
import { missingProfileFields } from "@/lib/perfil/completeness";
import { PerfilTabs } from "@/components/perfil/PerfilTabs";
import { DeleteMyAccount } from "@/components/perfil/DeleteMyAccount";

export const metadata: Metadata = {
  title: "Mi perfil, AIR Club UdeSA",
  robots: { index: false, follow: false },
};

export default async function PerfilPage({ searchParams }: PageProps<"/perfil">) {
  const profile = await requireUserProfile();
  const { guardado } = await searchParams;
  const missing = missingProfileFields(profile);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col gap-10 px-6 pt-28 pb-24 sm:px-8 md:pt-36">
      <PerfilHeader eyebrow={profile.email} title="Mi perfil">
        <p className="font-body text-[1.05rem] leading-[1.7] text-text2">Editá tus datos cuando quieras.</p>
        <p className="font-body text-[.92rem] leading-[1.7] text-text3">
          Usamos estos datos para la inscripción a las charlas y para saber quiénes vienen.
        </p>
      </PerfilHeader>
      <PerfilTabs active="/perfil" />
      {guardado && (
        <p className="flex items-center gap-2 border border-crimson/25 bg-crimson/8 px-4 py-3 font-body text-[.9rem] font-medium text-crimson-text">
          <Check className="h-4 w-4 shrink-0" /> Perfil guardado.
        </p>
      )}
      {missing.length > 0 && (
        <p className="flex items-start gap-2 border border-crimson/25 bg-crimson/8 px-4 py-3 font-body text-[.9rem] font-medium text-crimson-text">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Para inscribirte a una charla te falta: {missing.join(", ")}.
        </p>
      )}
      <PerfilForm existing={profile} defaultName={await getSessionName()} submitLabel="Guardar cambios" next="/perfil?guardado=1" />
      <DeleteMyAccount />
    </div>
  );
}
