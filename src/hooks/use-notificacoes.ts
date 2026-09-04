"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Notificacao } from "@/lib/tipos";

type Fila = { dados: Notificacao[]; nao_lidas: number };

/**
 * Fila do sino. Cada leitura reconcilia no servidor: o que se resolveu sai sozinho, o que é novo
 * entra. Como isso roda uma vez por abertura, `staleTime` alto evita ir ao servidor a cada render.
 */
export function useNotificacoes() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ["notificacoes"] });

  const lista = useQuery({
    queryKey: ["notificacoes"],
    queryFn: () => api<Fila>("/notificacoes"),
    staleTime: 60_000,
  });

  const ler = useMutation({
    mutationFn: (id: string) => api<Notificacao>(`/notificacoes/${id}/ler`, { method: "POST" }),
    onSuccess: invalidar,
  });

  const lerTodas = useMutation({
    mutationFn: () => api<{ lidas: number; nao_lidas: number }>("/notificacoes/ler-todas", { method: "POST" }),
    onSuccess: invalidar,
  });

  return {
    notificacoes: lista.data?.dados ?? [],
    naoLidas: lista.data?.nao_lidas ?? 0,
    carregando: lista.isPending,
    ler,
    lerTodas,
  };
}
