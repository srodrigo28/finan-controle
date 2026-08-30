"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Tema = "claro" | "escuro" | "sistema";

const ouvintes = new Set<() => void>();
const CHAVE = "finan:tema";

function lerTema(): Tema {
  try {
    return (localStorage.getItem(CHAVE) as Tema | null) ?? "sistema";
  } catch {
    return "sistema";
  }
}

function assinar(cb: () => void) {
  ouvintes.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    ouvintes.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Tema claro/escuro/sistema persistido em localStorage (aplicado cedo pelo ThemeScript). */
export function useTema() {
  const tema = useSyncExternalStore(assinar, lerTema, () => "sistema" as Tema);

  const aplicar = useCallback((novo: Tema) => {
    try {
      if (novo === "sistema") localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, novo);
    } catch {
      /* sem storage */
    }
    const escuro = novo === "escuro" || (novo === "sistema" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", escuro);
    ouvintes.forEach((cb) => cb());
  }, []);

  return { tema, aplicar };
}
