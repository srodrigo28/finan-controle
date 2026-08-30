"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ShoppingCart, Plus, Store, CheckCircle2, Clock, Ban } from "lucide-react";
import { useSessoes } from "@/hooks/use-sessoes";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Botao } from "@/components/ui/botao";
import { Folha } from "@/components/ui/folha";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { Valor } from "@/components/ui/valor";
import { Secao, Vazio } from "@/components/ui/diversos";
import { dataRelativa, moeda } from "@/lib/formatar";
import type { SessaoLocal } from "@/lib/db";

export default function PaginaMercado() {
  return (
    <Suspense>
      <ConteudoMercado />
    </Suspense>
  );
}

function ConteudoMercado() {
  const { sessoes, aberta, abrir, carregando } = useSessoes();
  const roteador = useRouter();
  const params = useSearchParams();
  const pedidoAbrir = params.get("abrir") === "1";
  const [folha, setFolha] = useState(pedidoAbrir);
  const [local, setLocal] = useState("");
  const [orcamento, setOrcamento] = useState(0);
  const [abrindo, setAbrindo] = useState(false);

  // Atalho "?abrir=1" com compra já em andamento: vai direto para o carrinho.
  useEffect(() => {
    if (pedidoAbrir && !carregando && aberta) roteador.replace(`/mercado/${aberta.id}`);
  }, [pedidoAbrir, aberta, carregando, roteador]);

  const iniciar = async () => {
    setAbrindo(true);
    const id = await abrir({ local, orcamento: orcamento > 0 ? orcamento : null });
    setFolha(false);
    roteador.push(`/mercado/${id}`);
  };

  const historico = sessoes.filter((s) => s.status !== "aberta");

  return (
    <div className="space-y-6">
      <Cabecalho titulo="Modo Mercado" subtitulo="Saiba o total antes do caixa" grande />

      {aberta ? (
        <Link href={`/mercado/${aberta.id}`}>
          <motion.div whileTap={{ scale: 0.985 }} className="cartao relative overflow-hidden p-5">
            <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" /> Em andamento
            </span>
            <p className="text-sm text-text-2">{aberta.local ?? "Carrinho"} · aberto {dataRelativa(aberta.aberta_em.slice(0, 10)).toLowerCase()}</p>
            <div className="mt-2">
              <Valor valor={aberta.total_carrinho} tamanho="xl" />
            </div>
            {aberta.orcamento ? <p className="mt-2 text-xs text-text-2">Orçamento {moeda(aberta.orcamento)}</p> : null}
            <p className="mt-4 text-sm font-medium text-accent">Continuar compra →</p>
          </motion.div>
        </Link>
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          onClick={() => setFolha(true)}
          className="fundo-aurora cartao flex w-full items-center gap-4 p-5 text-left"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-fg botao-brilho">
            <ShoppingCart className="size-7" strokeWidth={2.4} />
          </span>
          <div className="flex-1">
            <p className="text-lg font-semibold">Iniciar compra</p>
            <p className="text-sm text-text-2">Adicione itens enquanto anda pelo mercado. Funciona sem internet.</p>
          </div>
          <Plus className="size-5 text-muted" />
        </motion.button>
      )}

      <Secao titulo="Compras anteriores">
        {historico.length === 0 ? (
          <div className="cartao">
            <Vazio icone={Store} titulo="Nenhuma compra fechada ainda" descricao="Ao fechar uma compra ela vira um lançamento único, com os itens preservados." />
          </div>
        ) : (
          <div className="cartao divide-y divide-border">
            {historico.map((s) => (
              <LinhaSessao key={s.id} sessao={s} />
            ))}
          </div>
        )}
      </Secao>

      <Folha aberta={folha} aoMudar={setFolha} titulo="Nova compra" descricao="Opcional: onde você está e quanto pretende gastar.">
        <div className="space-y-4">
          <Campo rotulo="Mercado" placeholder="Ex.: Atacadão, feira…" value={local} onChange={(e) => setLocal(e.target.value)} prefixo={<Store className="size-4" />} autoComplete="off" />
          <CampoMoeda rotulo="Orçamento desta compra" valor={orcamento} aoMudar={setOrcamento} dica="Você verá quando o carrinho passar deste valor." />
          <Botao tamanho="lg" cheio onClick={iniciar} carregando={abrindo}>
            <ShoppingCart className="size-5" /> Começar
          </Botao>
        </div>
      </Folha>
    </div>
  );
}

function LinhaSessao({ sessao: s }: { sessao: SessaoLocal }) {
  const fechada = s.status === "fechada";
  const Icone = fechada ? CheckCircle2 : Ban;
  return (
    <Link href={fechada && s.lancamento_id ? `/lancamentos/${s.lancamento_id}` : `/mercado/${s.id}`} className="flex items-center gap-3 px-4 py-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${fechada ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted"}`}>
        <Icone className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{s.local ?? "Compra"}</p>
        <p className="flex items-center gap-1 text-xs text-text-2">
          <Clock className="size-3" /> {dataRelativa((s.fechada_em ?? s.aberta_em).slice(0, 10))}
          {s.pendente_sync ? <span className="ml-1 rounded-full bg-warn-soft px-1.5 text-[10px] text-warn">pendente</span> : null}
        </p>
      </div>
      <Valor valor={s.total_pago ?? s.total_carrinho} tamanho="md" className="font-medium" />
    </Link>
  );
}
