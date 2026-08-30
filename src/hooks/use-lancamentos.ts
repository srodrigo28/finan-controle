"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Anexo, Lancamento, Paginado } from "@/lib/tipos";

export type FiltrosLancamentos = {
  de?: string;
  ate?: string;
  tipo?: "despesa" | "receita";
  categoria_id?: string;
  busca?: string;
};

function query(filtros: FiltrosLancamentos, pagina: number) {
  const p = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => v && p.set(k, String(v)));
  p.set("pagina", String(pagina));
  p.set("por_pagina", "40");
  return p.toString();
}

export function useLancamentos(filtros: FiltrosLancamentos = {}) {
  return useInfiniteQuery({
    queryKey: ["lancamentos", filtros],
    queryFn: ({ pageParam }) => api<Paginado<Lancamento>>(`/lancamentos?${query(filtros, pageParam)}`),
    initialPageParam: 1,
    getNextPageParam: (ultima) =>
      ultima.pagina * ultima.por_pagina < ultima.total ? ultima.pagina + 1 : undefined,
  });
}

export function useLancamento(id: string | null) {
  return useQuery({
    queryKey: ["lancamento", id],
    enabled: !!id,
    queryFn: () => api<Lancamento>(`/lancamentos/${id}`),
  });
}

export function useMutacoesLancamento() {
  const qc = useQueryClient();
  const invalidar = (id?: string) => {
    qc.invalidateQueries({ queryKey: ["lancamentos"] });
    qc.invalidateQueries({ queryKey: ["metricas"] });
    if (id) qc.invalidateQueries({ queryKey: ["lancamento", id] });
  };

  const criar = useMutation({
    mutationFn: (dados: Partial<Lancamento>) => api<Lancamento>("/lancamentos", { method: "POST", body: dados }),
    onSuccess: () => invalidar(),
  });
  const atualizar = useMutation({
    mutationFn: ({ id, ...dados }: Partial<Lancamento> & { id: string }) =>
      api<Lancamento>(`/lancamentos/${id}`, { method: "PATCH", body: dados }),
    onSuccess: (l) => invalidar(l.id),
  });
  const excluir = useMutation({
    mutationFn: (id: string) => api<void>(`/lancamentos/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidar(),
  });
  const anexar = useMutation({
    mutationFn: ({ id, arquivo }: { id: string; arquivo: File }) => {
      const fd = new FormData();
      fd.append("arquivo", arquivo);
      return api<Anexo>(`/lancamentos/${id}/anexos`, { method: "POST", body: fd });
    },
    onSuccess: (a) => invalidar(a.lancamento_id),
  });
  const removerAnexo = useMutation({
    mutationFn: ({ id }: { id: string; lancamentoId: string }) => api<void>(`/anexos/${id}`, { method: "DELETE" }),
    onSuccess: (_, v) => invalidar(v.lancamentoId),
  });

  return { criar, atualizar, excluir, anexar, removerAnexo };
}
