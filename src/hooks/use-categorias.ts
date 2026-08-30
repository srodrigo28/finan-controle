"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import { api } from "@/lib/api";
import { db, type CategoriaCache } from "@/lib/db";
import { useAuth } from "@/stores/auth";
import type { Categoria, Lista } from "@/lib/tipos";

/**
 * Categorias: busca na API e espelha no IndexedDB para o Modo Mercado funcionar offline.
 * A leitura vem sempre do Dexie (liveQuery) — a API só atualiza o cache.
 */
export function useCategorias(incluirArquivadas = false) {
  const usuarioId = useAuth((s) => s.usuario?.id);
  const qc = useQueryClient();

  const consulta = useQuery({
    queryKey: ["categorias", usuarioId, incluirArquivadas],
    enabled: !!usuarioId,
    queryFn: async () => {
      const r = await api<Lista<Categoria>>(`/categorias?incluir_arquivadas=1`);
      await db.transaction("rw", db.categorias, async () => {
        await db.categorias.where({ usuario_id: usuarioId! }).delete();
        await db.categorias.bulkPut(r.dados.map((c) => ({ ...c, usuario_id: usuarioId! })));
      });
      return r.dados;
    },
  });

  const locais = useLiveQuery(
    async (): Promise<CategoriaCache[]> => (usuarioId ? db.categorias.where({ usuario_id: usuarioId }).toArray() : []),
    [usuarioId],
  );

  const categorias = useMemo(() => {
    const lista = (locais ?? []).filter((c) => incluirArquivadas || !c.arquivada);
    return lista.sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome));
  }, [locais, incluirArquivadas]);

  const mapa = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias]);
  const raizes = useMemo(() => categorias.filter((c) => !c.pai_id), [categorias]);
  const filhasDe = (paiId: string) => categorias.filter((c) => c.pai_id === paiId);

  const invalidar = () => qc.invalidateQueries({ queryKey: ["categorias"] });

  const criar = useMutation({
    mutationFn: (dados: Partial<Categoria>) => api<Categoria>("/categorias", { method: "POST", body: dados }),
    onSuccess: invalidar,
  });
  const atualizar = useMutation({
    mutationFn: ({ id, ...dados }: Partial<Categoria> & { id: string }) =>
      api<Categoria>(`/categorias/${id}`, { method: "PATCH", body: dados }),
    onSuccess: invalidar,
  });
  const arquivar = useMutation({
    mutationFn: (id: string) => api<void>(`/categorias/${id}`, { method: "DELETE" }),
    onSuccess: invalidar,
  });
  const reordenar = useMutation({
    mutationFn: (ids: string[]) => api<void>("/categorias/reordenar", { method: "POST", body: { ids } }),
    onSuccess: invalidar,
  });

  return {
    categorias,
    mapa,
    raizes,
    filhasDe,
    carregando: locais === undefined && consulta.isPending,
    criar,
    atualizar,
    arquivar,
    reordenar,
    recarregar: consulta.refetch,
  };
}
