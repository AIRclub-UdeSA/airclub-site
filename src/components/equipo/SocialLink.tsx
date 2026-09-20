"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GithubIcon, LinkedinIcon } from "./SocialIcons";

const ICONS = { linkedin: LinkedinIcon, github: GithubIcon } as const;

/**
 * Botón circular a un perfil. Con `photo` muestra la foto de esa red y, abajo a la derecha, el logo de la red
 * para que se entienda de dónde viene. Sin foto (o si no carga) muestra solo el logo.
 */
export function SocialLink({
  href,
  kind,
  label,
  name,
  photo,
}: {
  href: string;
  kind: keyof typeof ICONS;
  label: string;
  name: string;
  photo?: string;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[kind];
  const withPhoto = Boolean(photo) && !failed;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} de ${name}`}
      className={cn(
        "relative flex size-9 min-[360px]:size-10 shrink-0 items-center justify-center rounded-full border border-border text-text2 transition-[transform,box-shadow,border-color,color] duration-200 ease-club",
        // Al acercar el cursor: se agranda un poco y el reborde se engrosa (con `ring`, para que no mueva nada del layout).
        "hover:scale-[1.12] hover:border-crimson hover:text-crimson-text hover:ring-1 hover:ring-crimson",
        "focus-visible:scale-[1.12] focus-visible:border-crimson focus-visible:text-crimson-text focus-visible:ring-1 focus-visible:ring-crimson",
        !withPhoto && "opacity-60 group-hover:opacity-100",
      )}
    >
      {withPhoto ? (
        <>
          <Image
            src={photo!}
            alt=""
            width={40}
            height={40}
            unoptimized
            onError={() => setFailed(true)}
            className="size-full rounded-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -right-1 flex size-4 min-[360px]:size-[18px] items-center justify-center rounded-full bg-text text-bg ring-2 ring-bg"
          >
            <Icon className="size-[9px] min-[360px]:size-[10px]" />
          </span>
        </>
      ) : (
        <Icon className="size-4" />
      )}
    </a>
  );
}
