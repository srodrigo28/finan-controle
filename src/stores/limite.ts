"use client";

import { create } from "zustand";

type EstadoLimite = {
  /** Mensagem do 402 vinda da API — `null` quando a folha está fechada. */
  mensagem: string | null;
  abrir: (mensagem?: string) => void;
  fechar: () => void;
};

const PADRAO =
  "Seu teste grátis terminou. Assine o Finan Completo para registrar coisas novas — o que já está no app continua seu.";

/** Folha de "teste terminou": aberta pelo 402 da API ou por um botão que já sabe do limite. */
export const useLimite = create<EstadoLimite>((set) => ({
  mensagem: null,
  abrir: (mensagem) => set({ mensagem: mensagem || PADRAO }),
  fechar: () => set({ mensagem: null }),
}));
