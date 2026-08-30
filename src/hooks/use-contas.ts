"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContaAgendada, Lancamento, Lista, OcorrenciaConta } from "@/lib/tipos";

export function useContas() {
  const qc = useQueryClient();
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ["contas"] });
    qc.invalidateQueries({ queryKey: ["ocorrencias"] });
    qc.invalidateQueries({ queryKey: ["metricas"] });
    qc.invalidateQueries({ queryKey: ["lancamentos"] });
  };

  const lista = useQuery({ queryKey: ["contas"], queryFn: () => api<Lista<ContaAgendada>>("/contas") });

  const criar = useMutation({
    mutationFn: (d: Partial<ContaAgendada>) => api<ContaAgendada>("/contas", { method: "POST", body: d }),
    onSuccess: invalidar,
  });
  const atualizar = useMutation({
    mutationFn: ({ id, ...d }: Partial<ContaAgendada> & { id: string }) =>
      api<ContaAgendada>(`/contas/${id}`, { method: "PATCH", body: d }),
    onSuccess: invalidar,
  });
  const desativar = useMutation({
    mutationFn: (id: string) => api<void>(`/contas/${id}`, { method: "DELETE" }),
    onSuccess: invalidar,
  });
  const pagar = useMutation({
    mutationFn: ({ id, ...d }: { id: string; valor_real: number; data?: string; forma_pagamento?: string }) =>
      api<{ ocorrencia: OcorrenciaConta; lancamento: Lancamento }>(`/contas/ocorrencias/${id}/pagar`, { method: "POST", body: d }),
    onSuccess: invalidar,
  });
  const reabrir = useMutation({
    mutationFn: (id: string) => api<OcorrenciaConta>(`/contas/ocorrencias/${id}/reabrir`, { method: "POST" }),
    onSuccess: invalidar,
  });

  return { contas: lista.data?.dados ?? [], carregando: lista.isPending, criar, atualizar, desativar, pagar, reabrir };
}

export function useOcorrencias(competencia: string) {
  return useQuery({
    queryKey: ["ocorrencias", competencia],
    queryFn: () =>
      api<{ dados: OcorrenciaConta[]; total_pendente: number; total_pago: number }>(
        `/contas/ocorrencias?competencia=${competencia}`,
      ),
    placeholderData: (a) => a,
  });
}
