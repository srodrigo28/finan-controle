"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ChevronLeft, Plus, ShoppingBasket, MoreHorizontal, Filter, X } from "lucide-react";
import { useSessao } from "@/hooks/use-sessoes";
import { useCategorias } from "@/hooks/use-categorias";
import { Valor } from "@/components/ui/valor";
import { Botao } from "@/components/ui/botao";
import { Folha } from "@/components/ui/folha";
import { Confirmar } from "@/components/ui/confirmar";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { Chip, Vazio } from "@/components/ui/diversos";
import { FolhaAdicionarItem } from "@/components/mercado/folha-adicionar-item";
import { ItemCarrinho } from "@/components/mercado/item-carrinho";
import { moeda } from "@/lib/formatar";
import { cn } from "@/lib/utils";
import type { ItemLocal } from "@/lib/db";

export default function PaginaCarrinho({ params }: PageProps<"/mercado/[id]">) {
  const { id } = use(params);
  const roteador = useRouter();
  const { sessao, ativos, total, porCategoria, carregando, adicionarItem, editarItem, removerItem, restaurarItem, atualizarSessao, abandonar } = useSessao(id);
  const { mapa } = useCategorias();
  const [adicionando, setAdicionando] = useState(false);
  const [editando, setEditando] = useState<ItemLocal | null>(null);
  const [filtro, setFiltro] = useState<string | null | "todas">("todas");
  const [opcoes, setOpcoes] = useState(false);
  const [abandonando, setAbandonando] = useState(false);
  const [local, setLocal] = useState("");
  const [orcamento, setOrcamento] = useState(0);

  const visiveis = useMemo(() => (filtro === "todas" ? ativos : ativos.filter((i) => i.categoria_id === filtro)), [ativos, filtro]);
  const totalFiltro = useMemo(() => visiveis.reduce((a, i) => a + i.valor_unitario * i.quantidade, 0), [visiveis]);

  if (carregando) return <div className="grid min-h-dvh place-items-center"><div className="size-8 animate-pulse rounded-xl bg-accent-soft" /></div>;
  if (!sessao) {
    return (
      <div className="p-6">
        <Vazio icone={ShoppingBasket} titulo="Compra não encontrada" acao={<Link href="/mercado"><Botao variante="secundario">Voltar</Botao></Link>} />
      </div>
    );
  }

  const fechada = sessao.status !== "aberta";
  const estourou = !!sessao.orcamento && total > sessao.orcamento;
  const restante = sessao.orcamento ? sessao.orcamento - total : null;
  const pct = sessao.orcamento ? total / sessao.orcamento : 0;
  const ultimaCategoria = ativos.length ? ativos[ativos.length - 1].categoria_id : null;

  const remover = async (item: ItemLocal) => {
    await removerItem(item.id);
    toast(`${item.descricao} removido`, {
      action: { label: "Desfazer", onClick: () => restaurarItem(item.id) },
      duration: 4000,
    });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Total fixo no topo — legível em pé, com uma mão, sob luz forte */}
      <header
        className={cn(
          "sticky top-0 z-20 rounded-b-[28px] px-5 pb-5 pt-[calc(0.5rem+var(--safe-t))] shadow-card transition-colors duration-500",
          estourou ? "bg-danger text-white" : "bg-text text-bg",
        )}
      >
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => roteador.push("/mercado")} aria-label="Voltar" className="-ml-2 grid size-11 place-items-center rounded-full opacity-80 hover:opacity-100">
            <ChevronLeft className="size-6" />
          </button>
          <p className="truncate text-sm font-medium opacity-80">{sessao.local ?? "Carrinho"}</p>
          <button type="button" onClick={() => { setLocal(sessao.local ?? ""); setOrcamento(sessao.orcamento ?? 0); setOpcoes(true); }} aria-label="Opções" className="-mr-2 grid size-11 place-items-center rounded-full opacity-80 hover:opacity-100">
            <MoreHorizontal className="size-6" />
          </button>
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-70">{fechada ? "Total da compra" : "Total no carrinho"}</p>
            <Valor valor={total} tamanho="hero" animado className={estourou ? "[&_*]:text-white [&_*]:opacity-90" : "[&_.text-muted]:text-bg/60 [&_.text-text-2]:text-bg/70"} />
          </div>
          <div className="pb-1 text-right text-xs opacity-80">
            <p className="tnum">{ativos.length} {ativos.length === 1 ? "item" : "itens"}</p>
            {sessao.orcamento ? <p className="tnum">de {moeda(sessao.orcamento)}</p> : null}
          </div>
        </div>
        {sessao.orcamento ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <motion.div className={cn("h-full rounded-full", estourou ? "bg-white" : pct >= 0.85 ? "bg-warn" : "bg-accent")} animate={{ width: `${Math.min(100, pct * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
            <p className="mt-1.5 text-xs opacity-80">
              {estourou ? `Passou ${moeda(Math.abs(restante ?? 0))} do orçamento` : `Ainda cabem ${moeda(restante ?? 0)}`}
            </p>
          </div>
        ) : null}
      </header>

      {/* Filtro por categoria dentro desta compra */}
      {porCategoria.length > 1 ? (
        <div className="sem-scrollbar flex gap-2 overflow-x-auto px-4 pt-4">
          <Chip ativo={filtro === "todas"} onClick={() => setFiltro("todas")}>
            <Filter className="size-3.5" /> Todas
          </Chip>
          {porCategoria.map(({ categoria_id, total: t }) => {
            const c = categoria_id ? mapa.get(categoria_id) : null;
            return (
              <Chip key={categoria_id ?? "sem"} ativo={filtro === categoria_id} cor={c?.cor} onClick={() => setFiltro(filtro === categoria_id ? "todas" : categoria_id)}>
                {c?.nome ?? "Sem categoria"} <span className="tnum opacity-70">{moeda(t)}</span>
              </Chip>
            );
          })}
        </div>
      ) : null}

      {/* Itens */}
      <div className="flex-1 px-4 pb-40 pt-4">
        {filtro !== "todas" ? (
          <div className="mb-3 flex items-center justify-between px-1 text-sm text-text-2">
            <span>{visiveis.length} {visiveis.length === 1 ? "item" : "itens"} nesta categoria</span>
            <button type="button" onClick={() => setFiltro("todas")} className="flex items-center gap-1 font-medium text-accent">
              <span className="tnum">{moeda(totalFiltro)}</span> <X className="size-3.5" />
            </button>
          </div>
        ) : null}
        {ativos.length === 0 ? (
          <Vazio icone={ShoppingBasket} titulo="Carrinho vazio" descricao="Toque em Adicionar e digite o item e o preço. Você vê o total crescer aqui em cima." />
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {[...visiveis].reverse().map((item) => (
                <ItemCarrinho
                  key={item.id}
                  item={item}
                  categoria={item.categoria_id ? mapa.get(item.categoria_id) : null}
                  aoTocar={() => !fechada && setEditando(item)}
                  aoRemover={() => !fechada && remover(item)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Ações na zona do polegar */}
      {!fechada ? (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg px-4 pb-[calc(1rem+var(--safe-b))] pt-3 md:max-w-2xl" style={{ background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}>
          <div className="flex gap-3">
            <Botao tamanho="lg" cheio onClick={() => setAdicionando(true)} className="flex-[2]">
              <Plus className="size-5" strokeWidth={2.5} /> Adicionar
            </Botao>
            <Link href={`/mercado/${id}/fechar`} className="flex-1">
              <Botao tamanho="lg" cheio variante="contorno" disabled={ativos.length === 0}>
                Fechar
              </Botao>
            </Link>
          </div>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg px-4 pb-[calc(1rem+var(--safe-b))] pt-3 md:max-w-2xl">
          <Link href={sessao.lancamento_id ? `/lancamentos/${sessao.lancamento_id}` : "/mercado"}>
            <Botao tamanho="lg" cheio variante="secundario">Ver lançamento</Botao>
          </Link>
        </div>
      )}

      <FolhaAdicionarItem
        aberta={adicionando}
        aoMudar={setAdicionando}
        aoSalvar={async (d) => {
          await adicionarItem(d);
          toast.success(`${d.descricao} · ${moeda(d.valor_unitario * d.quantidade)}`, { duration: 1500 });
        }}
        categoriaPadrao={ultimaCategoria}
      />
      <FolhaAdicionarItem
        aberta={!!editando}
        aoMudar={(a) => !a && setEditando(null)}
        item={editando}
        aoSalvar={async (d) => {
          if (editando) await editarItem(editando.id, d);
        }}
        aoRemover={async () => {
          if (editando) await remover(editando);
        }}
      />

      <Folha aberta={opcoes} aoMudar={setOpcoes} titulo="Esta compra">
        <div className="space-y-4">
          <Campo rotulo="Mercado" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Onde você está" />
          <CampoMoeda rotulo="Orçamento" valor={orcamento} aoMudar={setOrcamento} />
          <Botao cheio tamanho="lg" onClick={async () => { await atualizarSessao({ local: local.trim() || null, orcamento: orcamento > 0 ? orcamento : null }); setOpcoes(false); }}>
            Salvar
          </Botao>
          {!fechada ? (
            <Botao
              cheio
              variante="perigo"
              onClick={() => {
                setOpcoes(false);
                setAbandonando(true);
              }}
            >
              Abandonar compra
            </Botao>
          ) : null}
        </div>
      </Folha>

      <Confirmar
        aberta={abandonando}
        aoMudar={setAbandonando}
        titulo="Abandonar esta compra?"
        descricao="Os itens do carrinho não viram lançamento. Não dá para desfazer."
        rotuloConfirmar="Abandonar compra"
        perigo
        aoConfirmar={async () => {
          await abandonar();
          roteador.replace("/mercado");
        }}
      />
    </div>
  );
}
