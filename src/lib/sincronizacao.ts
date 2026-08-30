"use client";

import { db, type ItemLocal, type SessaoLocal } from "@/lib/db";
import { api } from "@/lib/api";
import type { SessaoCompra } from "@/lib/tipos";

let emAndamento = false;

/** Envia sessões pendentes à API (upsert idempotente) e grava o retorno localmente. */
export async function sincronizarSessoes(usuarioId: string): Promise<{ enviadas: number }> {
  if (emAndamento || typeof navigator !== "undefined" && !navigator.onLine) return { enviadas: 0 };
  emAndamento = true;
  try {
    const pendentes = await db.sessoes.where({ usuario_id: usuarioId, pendente_sync: 1 }).toArray();
    if (pendentes.length === 0) return { enviadas: 0 };

    const carga = await Promise.all(
      pendentes.map(async (s) => {
        const itens = await db.itens.where({ sessao_id: s.id }).toArray();
        const { usuario_id: _u, pendente_sync: _p, ...sessao } = s;
        void _u;
        void _p;
        return { ...sessao, itens };
      }),
    );

    const resposta = await api<{ sessoes: SessaoCompra[] }>("/sessoes/sincronizar", {
      method: "POST",
      body: { sessoes: carga },
    });

    await db.transaction("rw", db.sessoes, db.itens, async () => {
      for (const s of resposta.sessoes) {
        const local = await db.sessoes.get(s.id);
        // Se houve edição local durante o envio, mantém pendente para a próxima rodada.
        const aindaPendente = local && local.atualizado_em > (s.atualizado_em ?? "");
        const { itens, ...resto } = s;
        await db.sessoes.put({
          ...(local ?? ({} as SessaoLocal)),
          ...resto,
          usuario_id: usuarioId,
          atualizado_em: aindaPendente ? local!.atualizado_em : (s.atualizado_em ?? local?.atualizado_em ?? new Date().toISOString()),
          pendente_sync: aindaPendente ? 1 : 0,
        });
        if (itens && !aindaPendente) {
          for (const i of itens) {
            await db.itens.put({ ...i, atualizado_em: i.atualizado_em ?? new Date().toISOString() } as ItemLocal);
          }
        }
      }
    });
    return { enviadas: resposta.sessoes.length };
  } finally {
    emAndamento = false;
  }
}

/** Baixa sessões do servidor que ainda não existem localmente (ex.: outro aparelho). */
export async function importarSessoesRemotas(usuarioId: string) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const lista = await api<{ dados: SessaoCompra[] }>("/sessoes");
  for (const s of lista.dados) {
    const existe = await db.sessoes.get(s.id);
    if (existe) continue;
    const completa = await api<SessaoCompra>(`/sessoes/${s.id}`);
    const { itens, ...resto } = completa;
    await db.sessoes.put({
      ...resto,
      usuario_id: usuarioId,
      atualizado_em: completa.atualizado_em ?? new Date().toISOString(),
      pendente_sync: 0,
    });
    for (const i of itens ?? []) {
      await db.itens.put({ ...i, atualizado_em: i.atualizado_em ?? new Date().toISOString() });
    }
  }
}
