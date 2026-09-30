import { ArrowUpRight } from "lucide-react";
import type { ContactChannel } from "@/lib/contact";

const NEW_TAB_HINT = <span className="sr-only"> (se abre en una pestaña nueva)</span>;

/**
 * Los canales directos: el handle es el diseño (Syne grande, sin íconos genéricos). Cuatro celdas en una fila;
 * en mobile, una debajo de la otra.
 */
export function ChannelsBand({ channels }: { channels: ContactChannel[] }) {
  return (
    <ul className="grid gap-px border border-text bg-text sm:grid-cols-2 lg:grid-cols-4">
      {channels.map((c) => (
        <li key={c.key} className="min-w-0 bg-bg2">
          <a
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noopener noreferrer" : undefined}
            className="group flex h-full min-h-[11rem] flex-col gap-10 p-6 transition-colors duration-200 ease-club hover:bg-bg sm:p-7"
          >
            <span className="flex items-start justify-between gap-3 font-mono text-[.74rem] font-semibold uppercase tracking-[.18em] text-mauve">
              {c.label}
              {c.external && (
                <>
                  <ArrowUpRight
                    size={16}
                    className="text-text3 transition-transform duration-200 ease-club group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-crimson-text"
                    aria-hidden="true"
                  />
                  {NEW_TAB_HINT}
                </>
              )}
            </span>
            <span>
              <span className="block font-display text-[clamp(1.05rem,1.7vw,1.4rem)] font-bold leading-[1.15] tracking-tight text-text transition-colors [overflow-wrap:anywhere] group-hover:text-crimson-text">
                {c.value}
              </span>
              <span className="mt-2 block text-[.88rem] leading-[1.55] text-text3">{c.note}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
