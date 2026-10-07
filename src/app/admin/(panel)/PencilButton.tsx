import { Pencil } from "lucide-react";

/** El lápiz de los paneles visuales, siempre a la vista: es la única forma de editar (tocar la ficha no hace nada). */
export function PencilButton({ label, onClick, className }: { label: string; onClick: () => void; className: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`absolute z-20 flex size-11 items-center justify-center rounded-full border border-text bg-bg text-text ring-2 ring-bg transition-colors duration-200 ease-club hover:border-crimson hover:text-crimson-text ${className}`}
    >
      <Pencil size={18} aria-hidden="true" />
    </button>
  );
}
