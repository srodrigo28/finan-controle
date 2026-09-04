"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContaAgendada, Lancamento, Lista, OcorrenciaConta, ResumoConta } from "@/lib/tipos";

export function useContas({ incluirInativas = false }: { incluirInativas?: boolean } = {}) {
  const qc = useQueryClient();
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ["contas"] });
    qc.invalidateQueries({ queryKey: ["conta"] });
    qc.invalidateQueries({ queryKey: ["ocorrencias"] });
    qc.invalidateQueries({ queryKey: ["metricas"] });
    qc.invalidateQueries({ queryKey: ["lancamentos"] });
  };

  const lista = useQuery({
    queryKey: ["contas", { incluirInativas }],
    queryFn: () => api<Lista<ContaAgendada>>(`/contas${incluirInativas ? "?incluir_inativas=1" : ""}`),
  });

  const criar = useMutation({
    mutationFn: (d: Partial<ContaAgendada>) => api<ContaAgendada>("/contas", { method: "POST", body: d }),
    onSuccess: invalidar,
  });
  const atualizar = useMutation({
    mutationFn: ({ id, ...d }: Partial<ContaAgendada> & { id: string }) =>
      api<ContaAgendada>(`/contas/${id}`, { method: "PATCH", body: d }),
    onSuccess: invalidar,
  });
  /** Arquivar é reversível: a conta sai do mês e do push, mas guarda o histórico. */
  const arquivar = useMutation({
    mutationFn: (id: string) => api<void>(`/contas/${id}`, { method: "DELETE" }),
    onSuccess: invalidar,
  });
  const reativar = useMutation({
    mutationFn: (id: string) => api<ContaAgendada>(`/contas/${id}`, { method: "PATCH", body: { ativa: true } }),
    onSuccess: invalidar,
  });
  /** Excluir apaga conta e ocorrências; os lançamentos já pagos continuam nos seus meses. */
  const excluir = useMutation({
    mutationFn: (id: string) => api<void>(`/contas/${id}?definitivo=1`, { method: "DELETE" }),
    onSuccess: invalidar,
  });
  const pagar = useMutation({
    mutationFn: ({ id, ...d }: { id: string; valor_real: number; data?: string; forma_pagamento?: string }) =>
      api<{ ocorrencia: OcorrenciaConta; lancamento: Lancamento }>(`/contas/ocorrencias/${id}/pagar`, { method: "POST", body: d }),
    onSuccess: invalidar,
  });
  /** Ajuste pontual de um mês: valor, vencimento ou pular ("esse mês não tem"). */
  const ajustarOcorrencia = useMutation({
    mutationFn: ({ id, ...d }: { id: string; valor_real?: number | null; vencimento?: string; status?: "pendente" | "pulada" }) =>
      api<OcorrenciaConta>(`/contas/ocorrencias/${id}`, { method: "PATCH", body: d }),
    onSuccess: invalidar,
  });
  const excluirOcorrencia = useMutation({
    mutationFn: (id: string) => api<void>(`/contas/ocorrencias/${id}`, { method: "DELETE" }),
    onSuccess: invalidar,
  });
  const reabrir = useMutation({
    mutationFn: (id: string) => api<OcorrenciaConta>(`/contas/ocorrencias/${id}/reabrir`, { method: "POST" }),
    onSuccess: invalidar,
  });

  return {
    contas: lista.data?.dados ?? [],
    carregando: lista.isPending,
    criar,
    atualizar,
    arquivar,
    reativar,
    excluir,
    pagar,
    reabrir,
    ajustarOcorrencia,
    excluirOcorrencia,
  };
}

export function useConta(id: string) {
  return useQuery({
    queryKey: ["conta", id],
    queryFn: () => api<ContaAgendada & { resumo: ResumoConta }>(`/contas/${id}`),
  });
}

export function useHistoricoConta(id: string, limite = 12) {
  return useQuery({
    queryKey: ["conta", id, "ocorrencias", limite],
    queryFn: () => api<Lista<OcorrenciaConta>>(`/contas/${id}/ocorrencias?limite=${limite}`),
  });
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
