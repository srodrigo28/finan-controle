"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MetricaDiaria, MetricaMensal, MetricaSemanal } from "@/lib/tipos";

export function useMetricaDiaria(data: string) {
  return useQuery({
    queryKey: ["metricas", "diario", data],
    queryFn: () => api<MetricaDiaria>(`/metricas/diario?data=${data}`),
  });
}

export function useMetricaSemanal(inicio: string) {
  return useQuery({
    queryKey: ["metricas", "semanal", inicio],
    queryFn: () => api<MetricaSemanal>(`/metricas/semanal?inicio=${inicio}`),
    placeholderData: (anterior) => anterior,
  });
}

export function useMetricaMensal(mes: string) {
  return useQuery({
    queryKey: ["metricas", "mensal", mes],
    queryFn: () => api<MetricaMensal>(`/metricas/mensal?mes=${mes}`),
    placeholderData: (anterior) => anterior,
  });
}
