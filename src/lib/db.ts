"use client";

import Dexie, { type EntityTable } from "dexie";
import type { ItemCompra, SessaoCompra, Categoria } from "@/lib/tipos";

/**
 * Banco local (IndexedDB) — fonte da verdade do Modo Mercado.
 * O carrinho é escrito aqui primeiro; a API recebe o estado via /sessoes/sincronizar.
 */
export type SessaoLocal = Omit<SessaoCompra, "itens"> & {
  usuario_id: string;
  atualizado_em: string;
  pendente_sync: 0 | 1;
};

export type ItemLocal = ItemCompra & {
  atualizado_em: string;
};

export type CategoriaCache = Categoria & { usuario_id: string };

class BancoFinan extends Dexie {
  sessoes!: EntityTable<SessaoLocal, "id">;
  itens!: EntityTable<ItemLocal, "id">;
  categorias!: EntityTable<CategoriaCache, "id">;

  constructor() {
    super("finan");
    this.version(1).stores({
      sessoes: "id, usuario_id, status, pendente_sync, aberta_em, [usuario_id+pendente_sync], [usuario_id+status]",
      itens: "id, sessao_id, categoria_id, removido",
      categorias: "id, usuario_id, pai_id, arquivada",
    });
  }
}

export const db = new BancoFinan();

export function novoId() {
  return crypto.randomUUID();
}

export function agoraISO() {
  return new Date().toISOString();
}

/** Total do carrinho (itens não removidos). */
export function totalItens(itens: ItemLocal[]) {
  return itens.filter((i) => !i.removido).reduce((acc, i) => acc + i.valor_unitario * i.quantidade, 0);
}
