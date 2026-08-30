"use client";

import Link from "next/link";
import { Paperclip, ShoppingCart } from "lucide-react";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import { Valor } from "@/components/ui/valor";
import type { Categoria, Lancamento } from "@/lib/tipos";
import { horaCurta } from "@/lib/formatar";

export function LinhaLancamento({
  lancamento: l,
  categoria,
  mostrarData,
}: {
  lancamento: Lancamento;
  categoria?: Categoria | null;
  mostrarData?: string;
}) {
  const receita = l.tipo === "receita";
  return (
    <Link href={`/lancamentos/${l.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60 active:bg-surface-2">
      {l.sessao_id ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <ShoppingCart className="size-5" strokeWidth={2.2} />
        </span>
      ) : (
        <IconeCategoria categoria={categoria} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{l.descricao || categoria?.nome || (receita ? "Receita" : "Despesa")}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-text-2">
          {mostrarData ?? horaCurta(l.criado_em)}
          {categoria ? <span>· {categoria.nome}</span> : null}
          {l.anexos?.length ? <Paperclip className="size-3" /> : null}
        </p>
      </div>
      <Valor valor={l.valor} tamanho="md" tipo={receita ? "receita" : "despesa"} sinal="nunca" className={receita ? "font-semibold" : "font-medium"} />
    </Link>
  );
}
