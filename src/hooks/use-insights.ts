"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Insight = {
  tipo: string;
  nivel: "atencao" | "bom" | "info";
  titulo: string;
  detalhe: string;
  valor: number | null;
  categoria_id: string | null;
  link: string | null;
};

export function useInsights(inicio?: string) {
  return useQuery({
    queryKey: ["metricas", "insights", inicio ?? "atual"],
    queryFn: () => api<{ inicio: string; fim: string; dados: Insight[] }>(`/metricas/insights${inicio ? `?inicio=${inicio}` : ""}`),
    staleTime: 60_000,
  });
}
