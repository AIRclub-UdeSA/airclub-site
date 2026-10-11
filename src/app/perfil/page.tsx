import { Check } from "lucide-react";
import { requireUserProfile } from "@/lib/perfil/require-profile";
import { PerfilForm } from "@/components/perfil/PerfilForm";

export default async function PerfilPage({ searchParams }: PageProps<"/perfil">) {
  const profile = await requireUserProfile();
  const { guardado } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col gap-10 px-6 pt-28 pb-24 sm:px-8 md:pt-36">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.14em] text-crimson-text">{profile.email}</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.2rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-text">
          Mi perfil
        </h1>
        <p className="mt-4 font-body text-[1.05rem] leading-[1.7] text-text2">Editá tus datos cuando quieras.</p>
      </div>
      {guardado && (
        <p className="flex items-center gap-2 rounded-[var(--r-sm)] border border-crimson/25 bg-crimson/8 px-4 py-3 font-body text-[.9rem] font-medium text-crimson-text">
          <Check className="h-4 w-4 shrink-0" /> Perfil guardado.
        </p>
      )}
      <PerfilForm existing={profile} submitLabel="Guardar cambios" next="/perfil?guardado=1" />
    </div>
  );
}
