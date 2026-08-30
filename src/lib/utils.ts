import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...entradas: ClassValue[]) {
  return twMerge(clsx(entradas));
}

/** Vibração curta em aparelhos que suportam (feedback tátil no carrinho). */
export function vibrar(ms = 10) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* sem suporte */
  }
}

/** Normaliza descrição para comparação (mesma regra da API). */
export function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Contraste: retorna texto claro ou escuro para uma cor de fundo hex. */
export function corTexto(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#121716" : "#ffffff";
}
