"use client";

import { useState } from "react";
import { Briefcase, Check, ChevronLeft, Cpu, Palette, Pencil, Scale, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAREER_GROUPS, OTHER_CAREER_SLUG, careerLabel } from "@/lib/perfil/careers";

const GROUP_ICONS: Record<string, LucideIcon> = {
  ingenieria: Cpu,
  negocios: Briefcase,
  humanidades: Users,
  "diseno-comunicacion": Palette,
  derecho: Scale,
};

export function CareerSelect({ selected, onChange }: { selected: string[]; onChange: (next: string[]) => void }) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const openGroup = CAREER_GROUPS.find((g) => g.id === openGroupId) ?? null;

  function toggle(slug: string) {
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);
  }

  // Elegir una carrera puntual vuelve a los grupos generales, para elegir otra desde cero
  // (por ejemplo, un doble grado entre dos areas distintas) en vez de quedarse encerrado
  // en el mismo subgrupo.
  function pickCareer(slug: string) {
    toggle(slug);
    setOpenGroupId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {selected.map((slug) => (
            <span
              key={slug}
              className="inline-flex items-center gap-1.5 rounded-full border border-crimson/25 bg-crimson/8 py-1 pl-3.5 pr-1.5 font-body text-[.82rem] font-medium text-crimson-text"
            >
              {careerLabel(slug)}
              <button
                type="button"
                onClick={() => toggle(slug)}
                aria-label={`Sacar ${careerLabel(slug)}`}
                className="flex h-4.5 w-4.5 items-center justify-center rounded-full hover:bg-crimson/15"
              >
                ×
              </button>
              <input type="hidden" name="careers" value={slug} />
            </span>
          ))}
        </div>
      )}

      {openGroup ? (
        <div className="flex flex-col gap-1 rounded-[var(--r-md)] border border-border bg-bg2 p-2">
          <button
            type="button"
            onClick={() => setOpenGroupId(null)}
            className="mb-1 flex w-fit items-center gap-1 rounded-full px-2 py-1 font-mono text-[.7rem] uppercase tracking-[.08em] text-text3 transition-colors hover:text-crimson-text"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> {openGroup.label}
          </button>
          {openGroup.careers.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => pickCareer(c.slug)}
              className="flex items-center justify-between gap-3 rounded-[var(--r-sm)] px-3.5 py-3 text-left font-body text-[.92rem] text-text2 transition-colors hover:bg-crimson/6 hover:text-text"
            >
              {c.label}
              {selected.includes(c.slug) && <Check className="h-4 w-4 shrink-0 text-crimson" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CAREER_GROUPS.map((g) => {
            const count = selected.filter((s) => g.careers.some((c) => c.slug === s)).length;
            const Icon = GROUP_ICONS[g.id];
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setOpenGroupId(g.id)}
                className={cn(
                  "group flex flex-col items-center gap-2.5 rounded-[var(--r-md)] border px-4 py-5 text-center transition-colors",
                  count > 0 ? "border-crimson/40 bg-crimson/6" : "border-border bg-bg2 hover:border-crimson/30 hover:bg-crimson/5",
                )}
              >
                <Icon
                  className={cn("h-6 w-6", count > 0 ? "text-crimson" : "text-text3 transition-colors group-hover:text-crimson-text")}
                  strokeWidth={1.75}
                />
                <span className="font-body text-[.86rem] font-medium leading-tight text-text">{g.label}</span>
                <span className="font-mono text-[.64rem] uppercase tracking-[.06em] text-text3">
                  {count > 0 ? `${count} elegida${count > 1 ? "s" : ""}` : `${g.careers.length} carreras`}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => toggle(OTHER_CAREER_SLUG)}
            className={cn(
              "group flex flex-col items-center gap-2.5 rounded-[var(--r-md)] border border-dashed px-4 py-5 text-center transition-colors",
              selected.includes(OTHER_CAREER_SLUG)
                ? "border-crimson bg-crimson/8"
                : "border-border-strong/50 hover:border-crimson/40 hover:bg-crimson/5",
            )}
          >
            <Pencil
              className={cn(
                "h-6 w-6",
                selected.includes(OTHER_CAREER_SLUG) ? "text-crimson" : "text-text3 transition-colors group-hover:text-crimson-text",
              )}
              strokeWidth={1.75}
            />
            <span className="font-body text-[.86rem] font-medium leading-tight text-text">Otra</span>
            <span className="font-mono text-[.64rem] uppercase tracking-[.06em] text-text3">Especificar a mano</span>
          </button>
        </div>
      )}
    </div>
  );
}
