"use client";

import { useSyncExternalStore } from "react";
import { ehSafari, instalado, instalaSozinho, plataforma } from "@/lib/pwa";

type EventoInstalacao = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type Estado = { pronto: boolean; dispensado: boolean; jaInstalado: boolean };

const CHAVE_USOS = "finan:usos";
const CHAVE_DISPENSOU = "finan:convite-dispensado";
const USOS_ANTES_DE_CONVIDAR = 3;

/** Antes de hidratar (e no servidor) o convite não existe — nada pisca na tela. */
const VAZIO: Estado = { pronto: false, dispensado: true, jaInstalado: true };

let estado: Estado = VAZIO;
let evento: EventoInstalacao | null = null;
let iniciado = false;
const ouvintes = new Set<() => void>();

const emitir = () => ouvintes.forEach((o) => o());

function definir(novo: Partial<Estado>) {
  estado = { ...estado, ...novo };
  emitir();
}

if (typeof window !== "undefined") {
  // O navegador dispara isto uma única vez, e cedo demais para um efeito de componente pegar.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    evento = e as EventoInstalacao;
    emitir();
  });
  window.addEventListener("appinstalled", () => definir({ jaInstalado: true }));
}

/** Conta o acesso e lê o storage uma vez por carregamento, na primeira assinatura. */
function iniciar() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  let usos = USOS_ANTES_DE_CONVIDAR;
  try {
    usos = Number(localStorage.getItem(CHAVE_USOS) ?? "0") + 1;
    localStorage.setItem(CHAVE_USOS, String(usos));
  } catch {
    /* modo privado: trata como se já pudesse convidar */
  }
  estado = {
    pronto: usos >= USOS_ANTES_DE_CONVIDAR,
    // C4 + R2a: dispensar vale só para esta sessão; no próximo acesso o convite volta, até instalar.
    dispensado: sessionStorage.getItem(CHAVE_DISPENSOU) === "1",
    jaInstalado: instalado(),
  };
  emitir();
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  iniciar();
  return () => {
    ouvintes.delete(ouvinte);
  };
}

/**
 * Convite de instalação. Android/Windows usam o prompt nativo; no iPhone não existe prompt — a Apple
 * não expõe a API —, então o caminho é a folha com o passo a passo do Safari.
 */
export function useInstalacao() {
  const { pronto, dispensado, jaInstalado } = useSyncExternalStore(
    assinar,
    () => estado,
    () => VAZIO,
  );

  const iOS = plataforma() === "ios";
  const podeConvidar = pronto && !dispensado && !jaInstalado && (instalaSozinho() || ehSafari());

  const instalar = async () => {
    if (!evento) return "sem-prompt" as const;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === "accepted") definir({ jaInstalado: true });
    return outcome === "accepted" ? ("instalou" as const) : ("recusou" as const);
  };

  const dispensar = () => {
    try {
      sessionStorage.setItem(CHAVE_DISPENSOU, "1");
    } catch {
      /* modo privado */
    }
    definir({ dispensado: true });
  };

  return { podeConvidar, precisaDePassoAPasso: iOS, instalar, dispensar, jaInstalado };
}
