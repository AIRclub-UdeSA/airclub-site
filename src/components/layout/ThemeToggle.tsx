"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  // El servidor no sabe el tema guardado; el script de bloqueo en layout.tsx lo
  // corrige antes del primer paint, así que este valor solo importa un instante.
  return false;
}

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("airTheme", next ? "dark" : "light");
    } catch {
      // localStorage puede no estar disponible (modo privado, etc); no es critico.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-text2 transition-colors hover:text-crimson-text",
        className
      )}
    >
      {/* Parche de contraste, como el de densidad de una prueba de imprenta. El giro sale de la
          clase `dark` y no del estado, así no se anima al cargar con el tema oscuro guardado. */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-8 w-8 transition-transform duration-200 ease-out motion-reduce:transition-none dark:rotate-180"
      >
        <circle cx="12" cy="12" r="11.625" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <path d="M12 .375a11.625 11.625 0 0 1 0 23.25z" fill="currentColor" />
      </svg>
    </button>
  );
}
