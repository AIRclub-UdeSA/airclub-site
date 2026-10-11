import { requireUserProfile } from "@/lib/perfil/require-profile";
import { PerfilForm } from "@/components/perfil/PerfilForm";

export default async function PerfilPage() {
  const profile = await requireUserProfile();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col gap-10 px-6 pt-28 pb-24 sm:px-8 md:pt-36">
      <div>
        <p className="font-mono text-xs uppercase tracking-[.14em] text-crimson-text">{profile.email}</p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.2rem)] font-extrabold uppercase leading-[0.95] tracking-tight text-text">
          Mi perfil
        </h1>
        <p className="mt-4 font-body text-[1.05rem] leading-[1.7] text-text2">Editá tus datos cuando quieras.</p>
      </div>
      <PerfilForm existing={profile} submitLabel="Guardar cambios" />
    </div>
  );
}
