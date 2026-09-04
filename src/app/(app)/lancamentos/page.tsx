"use client";

import { useMemo, useState } from "react";
import { Search, ReceiptText, ChevronDown } from "lucide-react";
import { useLancamentos } from "@/hooks/use-lancamentos";
import { useCategorias } from "@/hooks/use-categorias";
import { Cabecalho } from "@/components/layout/cabecalho";
import { BotaoFlutuante } from "@/components/ui/botao-flutuante";
import { LinhaLancamento } from "@/components/linha-lancamento";
import { Chip, Skeleton, Vazio } from "@/components/ui/diversos";
import { Botao } from "@/components/ui/botao";
import { dataRelativa, moeda } from "@/lib/formatar";
import type { Lancamento } from "@/lib/tipos";

export default function PaginaLancamentos() {
  const [tipo, setTipo] = useState<"" | "despesa" | "receita">("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | undefined>();
  const { mapa, raizes } = useCategorias();
  const consulta = useLancamentos({ tipo: tipo || undefined, busca: busca || undefined, categoria_id: categoria });

  const grupos = useMemo(() => {
    const todos = consulta.data?.pages.flatMap((p) => p.dados) ?? [];
    const m = new Map<string, Lancamento[]>();
    for (const l of todos) m.set(l.data, [...(m.get(l.data) ?? []), l]);
    return [...m.entries()];
  }, [consulta.data]);

  return (
    <div className="space-y-4 pb-16">
      <Cabecalho titulo="Lançamentos" grande />

      <label className="flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 transition-[box-shadow,border-color] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
        <Search className="size-4 text-muted" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por descrição" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" />
      </label>

      <div className="sem-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip ativo={tipo === ""} onClick={() => setTipo("")}>Tudo</Chip>
        <Chip ativo={tipo === "despesa"} onClick={() => setTipo("despesa")}>Despesas</Chip>
        <Chip ativo={tipo === "receita"} onClick={() => setTipo("receita")}>Receitas</Chip>
        <span className="w-px shrink-0 bg-border" />
        {raizes.map((c) => (
          <Chip key={c.id} ativo={categoria === c.id} cor={c.cor} onClick={() => setCategoria(categoria === c.id ? undefined : c.id)}>
            {c.nome}
          </Chip>
        ))}
      </div>

      {consulta.isPending ? (
        <div className="cartao space-y-3 p-4">
          <Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" />
        </div>
      ) : grupos.length === 0 ? (
        <div className="cartao">
          <Vazio icone={ReceiptText} titulo="Nenhum lançamento" descricao="Tudo o que você registrar aparece aqui, agrupado por dia." />
        </div>
      ) : (
        grupos.map(([data, lista]) => {
          const totalDia = lista.reduce((a, l) => a + (l.tipo === "despesa" ? l.valor : 0), 0);
          return (
            <section key={data}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-text-2">{dataRelativa(data)}</h2>
                {totalDia > 0 ? <span className="tnum text-xs text-muted">{moeda(totalDia)}</span> : null}
              </div>
              <div className="cartao divide-y divide-border">
                {lista.map((l) => (
                  <LinhaLancamento key={l.id} lancamento={l} categoria={l.categoria_id ? mapa.get(l.categoria_id) : null} />
                ))}
              </div>
            </section>
          );
        })
      )}

      {consulta.hasNextPage ? (
        <div className="flex justify-center py-2">
          <Botao variante="secundario" onClick={() => consulta.fetchNextPage()} carregando={consulta.isFetchingNextPage}>
            <ChevronDown className="size-4" /> Carregar mais
          </Botao>
        </div>
      ) : null}

      <BotaoFlutuante href="/lancamentos/novo" rotulo="Novo lançamento" />
    </div>
  );
}
