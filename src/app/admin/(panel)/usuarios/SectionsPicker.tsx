"use client";

import { useState } from "react";
import { ADMIN_SECTIONS, sectionLabel } from "@/lib/admin/sections";

export function SectionsPicker({ initialSelected = [] }: { initialSelected?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const available = ADMIN_SECTIONS.filter((s) => !selected.includes(s.id));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {selected.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 rounded-full bg-crimson/10 py-1 pl-3 pr-1.5 font-body text-xs font-medium text-crimson-text"
          >
            {sectionLabel(id)}
            <button
              type="button"
              onClick={() => setSelected((prev) => prev.filter((s) => s !== id))}
              aria-label={`Sacar ${sectionLabel(id)}`}
              className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-crimson/20"
            >
              ×
            </button>
            <input type="hidden" name="sections" value={id} />
          </span>
        ))}
        {selected.length === 0 && <span className="font-body text-xs text-text3">Ninguna todavía (solo aplica a rol Editor)</span>}
      </div>

      {available.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            const value = e.target.value;
            if (value) setSelected((prev) => [...prev, value]);
          }}
          className="w-fit rounded-[var(--r-sm)] border border-border bg-card px-3 py-1.5 font-body text-xs text-text2"
        >
          <option value="">+ Agregar sección…</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
