"use client";

import { useCallback, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { db, novoId, agoraISO, totalItens, type ItemLocal, type SessaoLocal } from "@/lib/db";
import { sincronizarSessoes } from "@/lib/sincronizacao";
import { useAuth } from "@/stores/auth";
import { api } from "@/lib/api";
import { normalizar } from "@/lib/utils";

/**
 * Modo Mercado — todo estado passa pelo IndexedDB primeiro (offline-first).
 * Cada escrita marca a sessão como pendente e tenta sincronizar em segundo plano.
 */
export function useSessoes() {
  const usuarioId = useAuth((s) => s.usuario?.id) ?? "";
  const qc = useQueryClient();

  const sessoes = useLiveQuery(
    async (): Promise<SessaoLocal[]> =>
      usuarioId ? db.sessoes.where({ usuario_id: usuarioId }).reverse().sortBy("aberta_em") : [],
    [usuarioId],
  );

  const aberta = useMemo(() => sessoes?.find((s) => s.status === "aberta") ?? null, [sessoes]);

  const tentarSync = useCallback(() => {
    if (!usuarioId) return;
    sincronizarSessoes(usuarioId)
      .then((r) => {
        if (r.enviadas > 0) {
          qc.invalidateQueries({ queryKey: ["lancamentos"] });
          qc.invalidateQueries({ queryKey: ["metricas"] });
        }
      })
      .catch(() => {});
  }, [usuarioId, qc]);

  const abrir = useCallback(
    async (dados: { local?: string; orcamento?: number | null }) => {
      const id = novoId();
      const agora = agoraISO();
      const sessao: SessaoLocal = {
        id,
        usuario_id: usuarioId,
        local: dados.local?.trim() || null,
        orcamento: dados.orcamento ?? null,
        status: "aberta",
        aberta_em: agora,
        fechada_em: null,
        total_carrinho: 0,
        total_pago: null,
        motivo_divergencia: null,
        lancamento_id: null,
        atualizado_em: agora,
        pendente_sync: 1,
      };
      await db.sessoes.put(sessao);
      tentarSync();
      return id;
    },
    [usuarioId, tentarSync],
  );

  return { sessoes: sessoes ?? [], aberta, carregando: sessoes === undefined, abrir, tentarSync };
}

export function useSessao(id: string | null) {
  const usuarioId = useAuth((s) => s.usuario?.id) ?? "";
  const qc = useQueryClient();

  const sessao = useLiveQuery(async (): Promise<SessaoLocal | null> => (id ? (await db.sessoes.get(id)) ?? null : null), [id]);
  const itens = useLiveQuery(
    async (): Promise<ItemLocal[]> => (id ? db.itens.where({ sessao_id: id }).sortBy("criado_em") : []),
    [id],
  );

  const ativos = useMemo(() => (itens ?? []).filter((i) => !i.removido), [itens]);
  const total = useMemo(() => totalItens(itens ?? []), [itens]);

  const porCategoria = useMemo(() => {
    const m = new Map<string | null, number>();
    for (const i of ativos) m.set(i.categoria_id, (m.get(i.categoria_id) ?? 0) + i.valor_unitario * i.quantidade);
    return [...m.entries()].map(([categoria_id, total]) => ({ categoria_id, total })).sort((a, b) => b.total - a.total);
  }, [ativos]);

  const tocarSessao = useCallback(
    async (mudancas: Partial<SessaoLocal> = {}) => {
      if (!id) return;
      const itensAtuais = await db.itens.where({ sessao_id: id }).toArray();
      await db.sessoes.update(id, {
        ...mudancas,
        total_carrinho: Math.round(totalItens(itensAtuais) * 100) / 100,
        atualizado_em: agoraISO(),
        pendente_sync: 1,
      });
      sincronizarSessoes(usuarioId).catch(() => {});
    },
    [id, usuarioId],
  );

  const adicionarItem = useCallback(
    async (dados: { descricao: string; categoria_id: string | null; valor_unitario: number; quantidade: number }) => {
      if (!id) return;
      const agora = agoraISO();
      const item: ItemLocal = {
        id: novoId(),
        sessao_id: id,
        descricao: dados.descricao.trim(),
        categoria_id: dados.categoria_id,
        valor_unitario: dados.valor_unitario,
        quantidade: dados.quantidade,
        removido: false,
        criado_em: agora,
        atualizado_em: agora,
      };
      await db.itens.put(item);
      await tocarSessao();
      return item.id;
    },
    [id, tocarSessao],
  );

  const editarItem = useCallback(
    async (itemId: string, mudancas: Partial<ItemLocal>) => {
      await db.itens.update(itemId, { ...mudancas, atualizado_em: agoraISO() });
      await tocarSessao();
    },
    [tocarSessao],
  );

  const removerItem = useCallback(
    async (itemId: string) => {
      await db.itens.update(itemId, { removido: true, atualizado_em: agoraISO() });
      await tocarSessao();
    },
    [tocarSessao],
  );

  const restaurarItem = useCallback(
    async (itemId: string) => {
      await db.itens.update(itemId, { removido: false, atualizado_em: agoraISO() });
      await tocarSessao();
    },
    [tocarSessao],
  );

  const atualizarSessao = useCallback(
    async (mudancas: { local?: string | null; orcamento?: number | null }) => tocarSessao(mudancas),
    [tocarSessao],
  );

  /** Fecha localmente; a sincronização gera o lançamento na API (idempotente). */
  const fechar = useCallback(
    async (dados: { total_pago: number; motivo_divergencia?: string | null }) => {
      if (!id) return;
      await tocarSessao({
        status: "fechada",
        fechada_em: agoraISO(),
        total_pago: dados.total_pago,
        motivo_divergencia: dados.motivo_divergencia ?? null,
      });
      try {
        await sincronizarSessoes(usuarioId);
        qc.invalidateQueries({ queryKey: ["lancamentos"] });
        qc.invalidateQueries({ queryKey: ["metricas"] });
      } catch {
        /* offline: fica pendente */
      }
    },
    [id, tocarSessao, usuarioId, qc],
  );

  const abandonar = useCallback(async () => tocarSessao({ status: "abandonada", fechada_em: agoraISO() }), [tocarSessao]);

  return {
    sessao,
    itens: itens ?? [],
    ativos,
    total,
    porCategoria,
    carregando: sessao === undefined,
    adicionarItem,
    editarItem,
    removerItem,
    restaurarItem,
    atualizarSessao,
    fechar,
    abandonar,
  };
}

/** Último preço pago por um item (histórico local primeiro, API depois). */
export async function ultimoPreco(usuarioId: string, descricao: string) {
  const alvo = normalizar(descricao);
  if (!alvo) return null;
  const sessoes = await db.sessoes.where({ usuario_id: usuarioId, status: "fechada" }).reverse().sortBy("fechada_em");
  for (const s of sessoes) {
    const itens = await db.itens.where({ sessao_id: s.id }).toArray();
    const achado = itens.find((i) => !i.removido && normalizar(i.descricao) === alvo);
    if (achado) return { valor_unitario: achado.valor_unitario, data: s.fechada_em ?? s.aberta_em, origem: "local" as const };
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;
  try {
    const r = await api<{ valor_unitario: number; data: string } | null>(`/precos/ultimo?descricao=${encodeURIComponent(descricao)}`);
    return r ? { ...r, origem: "api" as const } : null;
  } catch {
    return null;
  }
}

/** Sugestões de descrição a partir do histórico local. */
export async function sugestoesLocais(usuarioId: string, q: string, limite = 6) {
  const alvo = normalizar(q);
  if (alvo.length < 2) return [] as { descricao: string; categoria_id: string | null; valor_unitario: number }[];
  const sessoes = await db.sessoes.where({ usuario_id: usuarioId }).toArray();
  const ids = new Set(sessoes.map((s) => s.id));
  const itens = await db.itens.filter((i) => ids.has(i.sessao_id) && !i.removido).toArray();
  const vistos = new Map<string, { descricao: string; categoria_id: string | null; valor_unitario: number }>();
  for (const i of itens.sort((a, b) => (b.atualizado_em > a.atualizado_em ? 1 : -1))) {
    const n = normalizar(i.descricao);
    if (n.includes(alvo) && !vistos.has(n)) vistos.set(n, { descricao: i.descricao, categoria_id: i.categoria_id, valor_unitario: i.valor_unitario });
    if (vistos.size >= limite) break;
  }
  return [...vistos.values()];
}
