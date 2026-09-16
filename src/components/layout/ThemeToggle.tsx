"use client";

import { useSyncExternalStore } from "react";

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

export function ThemeToggle() {
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
      aria-label="Cambiar tema claro/oscuro"
      className="fixed bottom-20 right-6 z-[200] flex h-[42px] w-[42px] items-center justify-center rounded-full border-[1.5px] border-border bg-bg2 text-[1.1rem] shadow-[0_2px_12px_rgba(164,12,76,.15)] transition-all hover:scale-110 hover:border-crimson"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
