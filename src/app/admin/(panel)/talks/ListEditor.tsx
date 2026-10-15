"use client";

import { useState, type ReactNode } from "react";

export function ListEditor<T>({
  name,
  initialItems,
  makeEmpty,
  renderRow,
  addLabel,
  emptyLabel,
}: {
  name: string;
  initialItems: T[];
  makeEmpty: () => T;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
  emptyLabel: string;
}) {
  const [items, setItems] = useState<T[]>(initialItems);

  function update(index: number, patch: Partial<T>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.length === 0 && <p className="text-xs text-text3">{emptyLabel}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 rounded-[var(--r-sm)] border border-border bg-card p-3">
          <div className="flex flex-1 flex-wrap gap-2">{renderRow(item, (patch) => update(i, patch))}</div>
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label="Subir"
              className="text-xs text-text3 hover:text-text disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              aria-label="Bajar"
              className="text-xs text-text3 hover:text-text disabled:opacity-30"
            >
              ↓
            </button>
            <button type="button" onClick={() => remove(i)} aria-label="Sacar" className="text-xs text-crimson-text hover:underline">
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, makeEmpty()])}
        className="w-fit text-sm font-medium text-text2 hover:text-crimson-text"
      >
        {addLabel}
      </button>
    </div>
  );
}
