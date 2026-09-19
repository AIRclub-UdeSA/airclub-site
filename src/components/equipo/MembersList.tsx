import { normalizeUrl } from "@/lib/links";
import type { TeamMemberItem } from "@/lib/team";
import { SocialLink } from "./SocialLink";

/** Usuario de GitHub a partir de su link (https://github.com/<usuario>), o undefined. */
function githubUserOf(url?: string) {
  if (!url) return undefined;
  return /github\.com\/([^/?#]+)/i.exec(normalizeUrl(url))?.[1];
}

/**
 * Lista de personas del equipo (con `columns`, en dos columnas). A la derecha de cada nombre, un botón por red: con la foto de esa red y su logo en la esquina
 * (o solo el logo, si no hay foto).
 * La foto de GitHub se toma en vivo de github.com (no se guarda en el repo); LinkedIn no permite obtenerla
 * automáticamente, así que su foto viene de `links.linkedinPhoto`.
 */
export function MembersList({ team, columns = false }: { team: TeamMemberItem[]; columns?: boolean }) {
  return (
    <ul className={columns ? "lg:columns-2 lg:gap-x-12" : undefined}>
      {team.map((member) => {
        const { linkedin, linkedinPhoto, github } = member.links ?? {};
        const githubUser = githubUserOf(github);
        return (
          <li key={member.name} className="group break-inside-avoid border-b border-dashed border-border py-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="min-w-0 flex-1 font-display text-[clamp(.85rem,4.4vw,1.2rem)] font-bold tracking-tight text-text transition-[color,padding-left] group-hover:pl-1.5 group-hover:text-crimson-text">
                {member.name}
              </span>
              {(linkedin || github) && (
                <span className="flex shrink-0 items-center gap-2 sm:gap-2.5">
                  {linkedin && (
                    <SocialLink
                      kind="linkedin"
                      label="LinkedIn"
                      name={member.name}
                      href={normalizeUrl(linkedin)}
                      photo={linkedinPhoto}
                    />
                  )}
                  {github && (
                    <SocialLink
                      kind="github"
                      label="GitHub"
                      name={member.name}
                      href={normalizeUrl(github)}
                      photo={githubUser ? `https://github.com/${githubUser}.png?size=96` : undefined}
                    />
                  )}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
