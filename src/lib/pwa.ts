"use client";

export type Plataforma = "ios" | "android" | "desktop";

/** iPad moderno se anuncia como Mac com toque — daí o teste extra por `maxTouchPoints`. */
export function plataforma(): Plataforma {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/** Safari no iOS: único caminho de instalação por lá, e o único que expõe `navigator.standalone`. */
export function ehSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Chromium/.test(ua);
}

/** Já está rodando como app instalado (tela de início, dock ou janela própria). */
export function instalado(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneIOS = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneIOS || window.matchMedia("(display-mode: standalone)").matches;
}

/** No iOS a instalação é manual (Compartilhar → Adicionar à Tela de Início): não existe prompt. */
export function instalaSozinho(): boolean {
  return plataforma() !== "ios";
}
