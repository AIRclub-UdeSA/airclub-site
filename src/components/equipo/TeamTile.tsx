"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { normalizeUrl } from "@/lib/links";
import type { TeamMemberItem } from "@/lib/team";
import { GithubIcon } from "./SocialIcons";

/** Usuario de GitHub a partir de su link (https://github.com/<usuario>), o undefined. */
export function githubUserOf(url?: string) {
  if (!url) return undefined;
  return /github\.com\/([^/?#]+)/i.exec(normalizeUrl(url))?.[1];
}

/** Primera y última inicial del nombre ("Lucio Luque Materazzi" → "LM"). */
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export const FRAME = "relative aspect-square overflow-hidden border border-text bg-bg2 transition-colors duration-200 ease-club";
export const SIZES = "(min-width: 1024px) 190px, (min-width: 640px) 22vw, 46vw";

/**
 * Ficha de una persona: su foto de LinkedIn y, en la esquina, su avatar de GitHub en un círculo. La ficha lleva a
 * LinkedIn y el círculo a GitHub: son dos enlaces hermanos, nunca anidados. Sin foto de LinkedIn, la trama diagonal ("lugar reservado") con sus iniciales.
 * La foto de GitHub se toma en vivo de github.com; la de LinkedIn no se puede obtener sola, viene de `links.linkedinPhoto`.
 */
export function TeamTile({ member }: { member: TeamMemberItem }) {
  const { linkedin, linkedinPhoto, github } = member.links ?? {};
  const photo = linkedinPhoto ?? member.photoUrl;
  const githubUser = githubUserOf(github);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const face = photo ? (
    <Image src={photo} alt="" fill sizes={SIZES} className="object-cover" />
  ) : (
    <div className="talk-hatch absolute inset-0 flex items-center justify-center text-text" aria-hidden="true">
      <span className="font-logo text-[clamp(2.6rem,7vw,3.6rem)] leading-none tracking-tight">{initialsOf(member.name)}</span>
    </div>
  );

  const caption = (
    <>
      <span className="mt-3 block font-display text-[1rem] font-bold leading-[1.15] tracking-tight text-text transition-colors group-hover:text-crimson-text">
        {member.name}
      </span>
      <span className="mt-1 flex items-center gap-1 font-mono text-[.7rem] uppercase tracking-[.14em] text-text3">
        {member.role ?? (linkedin ? "LinkedIn" : "")}
        {linkedin && <ArrowUpRight size={12} aria-hidden="true" />}
      </span>
    </>
  );

  return (
    <li className="group relative">
      {linkedin ? (
        <a
          href={normalizeUrl(linkedin)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn de ${member.name} (se abre en una pestaña nueva)`}
          className="block"
        >
          <div className={`${FRAME} group-hover:border-crimson`}>{face}</div>
          {caption}
        </a>
      ) : (
        <div>
          <div className={FRAME}>{face}</div>
          {caption}
        </div>
      )}

      {github && (
        <a
          href={normalizeUrl(github)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub de ${member.name} (se abre en una pestaña nueva)`}
          className="absolute -right-2 -top-2 z-10 flex size-11 items-center justify-center overflow-hidden rounded-full border border-text bg-bg text-text ring-2 ring-bg transition-colors duration-200 ease-club hover:border-crimson focus-visible:border-crimson"
        >
          {githubUser && !avatarFailed ? (
            <Image
              src={`https://github.com/${githubUser}.png?size=96`}
              alt=""
              width={44}
              height={44}
              unoptimized
              onError={() => setAvatarFailed(true)}
              className="size-full object-cover"
            />
          ) : (
            <GithubIcon className="size-5" />
          )}
        </a>
      )}
    </li>
  );
}

/**
 * El lugar de la foto grupal de colaboradores, todavía reservado: trama diagonal (la misma de /talks para "lugar
 * reservado") que invita a sumarse y lleva a "Cómo sumarte".
 */
export function JoinPanel() {
  return (
    <a
      href="#sumarte"
      className="talk-hatch group relative flex min-h-[11rem] flex-col justify-between gap-6 border border-text p-5 text-text transition-colors duration-200 ease-club hover:border-crimson lg:h-full lg:min-h-0"
    >
      {/* El círculo de GitHub de las demás fichas, vacío: ahí va tu avatar. */}
      <span
        aria-hidden="true"
        className="absolute -right-2 -top-2 flex size-11 items-center justify-center rounded-full border border-text bg-bg text-text3 ring-2 ring-bg transition-colors duration-200 ease-club group-hover:border-crimson group-hover:text-crimson-text"
      >
        <GithubIcon className="size-5" />
      </span>
      <span className="font-logo text-[clamp(3.4rem,6vw,5.2rem)] uppercase leading-[0.85] tracking-tight text-crimson-text">
        ¿Vos?
      </span>
      <span>
        <span className="block font-display text-[1.15rem] font-bold leading-tight tracking-tight transition-colors group-hover:text-crimson-text">
          Tu lugar
        </span>
        <span className="mt-1 flex items-center gap-1 font-mono text-[.7rem] uppercase tracking-[.14em] text-text3">
          Cómo sumarte <ArrowDown size={12} aria-hidden="true" />
        </span>
      </span>
    </a>
  );
}
