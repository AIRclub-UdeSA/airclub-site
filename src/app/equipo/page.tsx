import type { Metadata } from "next";
import { getCollaborators, getFounders, getFoundersPhoto } from "@/lib/team";
import { TeamSections } from "@/components/equipo/TeamSections";
import { JoinSection } from "@/components/equipo/JoinSection";
import { getContactReason } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Equipo, AIR Club UdeSA",
  description: "El equipo del AIR Club UdeSA: sus fundadores y cómo sumarte a la comunidad.",
  path: "/equipo",
});

// ISR: se pre-renderiza como página estática para navegación instantánea y se revalida
// cada 60s en segundo plano ante actualizaciones del equipo.
export const revalidate = 60;

export default async function EquipoPage() {
  const [founders, collaborators, foundersPhoto, community, team] = await Promise.all([
    getFounders(),
    getCollaborators(),
    getFoundersPhoto(),
    getContactReason("comunidad"),
    getContactReason("equipo"),
  ]);

  return (
    <>
      <TeamSections founders={founders} collaborators={collaborators} foundersPhoto={foundersPhoto} />
      <JoinSection community={community} team={team} />
    </>
  );
}
