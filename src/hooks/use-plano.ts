"use client";

import { useAuth } from "@/stores/auth";
import { useLimite } from "@/stores/limite";

/**
 * Diz se o usuário ainda pode registrar coisas novas. A API é a fonte da verdade (responde 402);
 * isto só evita que a pessoa abra um formulário para levar não no fim.
 */
export function usePlano() {
  const usuario = useAuth((s) => s.usuario);
  const abrirLimite = useLimite((s) => s.abrir);
  const podeCriar = usuario?.teste_ativo ?? true;

  /** Envolve a ação de criar: se o teste venceu, abre a folha e não executa. */
  const aoCriar = (acao: () => void) => () => (podeCriar ? acao() : abrirLimite());

  return { podeCriar, aoCriar, abrirLimite };
}
