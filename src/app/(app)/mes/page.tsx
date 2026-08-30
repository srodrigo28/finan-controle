"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, TrendingUp, CalendarCheck2, PieChart } from "lucide-react";
import { addMonths, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMetricaMensal } from "@/hooks/use-metricas";
import { useCategorias } from "@/hooks/use-categorias";
import { useAuth } from "@/stores/auth";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Valor } from "@/components/ui/valor";
import { BarraOrcamento, Secao, Skeleton, Vazio } from "@/components/ui/diversos";
import { GraficoBarras, BarrasCategoria } from "@/components/graficos/barras";
import { Anel } from "@/components/graficos/anel";
import { mesExtenso, moeda } from "@/lib/formatar";

export default function PaginaMes() {
  const [ref, setRef] = useState(new Date());
  const mes = format(ref, "yyyy-MM");
  const { data, isPending } = useMetricaMensal(mes);
  const { mapa } = useCategorias();
  const usuario = useAuth((s) => s.usuario);
  const ehAtual = mes === format(new Date(), "yyyy-MM");

  const evolucao = useMemo(() => {
    const anteriores = (data?.meses_anteriores ?? []).map((m) => ({ chave: m.mes, rotulo: format(new Date(`${m.mes}-01T12:00:00`), "MMM", { locale: ptBR }), valor: m.total }));
    return [...anteriores, { chave: mes, rotulo: format(ref, "MMM", { locale: ptBR }), valor: data?.total_despesas ?? 0, destaque: true }];
  }, [data, mes, ref]);

  const orcamentoMensal = usuario?.orcamento_mensal ?? null;
  const saldo = (data?.total_receitas ?? 0) - (data?.total_despesas ?? 0);

  return (
    <div className="space-y-6">
      <Cabecalho
        titulo={<span className="capitalize">{mesExtenso(mes)}</span>}
        voltar="/mais"
        acoes={
          <>
            <button type="button" aria-label="Mês anterior" onClick={() => setRef(subMonths(ref, 1))} className="grid size-10 place-items-center rounded-full hover:bg-surface-2"><ChevronLeft className="size-5" /></button>
            <button type="button" aria-label="Próximo mês" disabled={ehAtual} onClick={() => setRef(addMonths(ref, 1))} className="grid size-10 place-items-center rounded-full hover:bg-surface-2 disabled:opacity-30"><ChevronRight className="size-5" /></button>
          </>
        }
      />

      <motion.section key={mes} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="cartao fundo-aurora p-5">
        <p className="text-sm text-text-2">Despesas do mês</p>
        {isPending && !data ? <Skeleton className="mt-2 h-10 w-44" /> : <div className="mt-1"><Valor valor={data?.total_despesas ?? 0} tamanho="xl" animado /></div>}
        {orcamentoMensal ? (
          <div className="mt-4 space-y-1.5">
            <BarraOrcamento gasto={data?.total_despesas ?? 0} limite={orcamentoMensal} />
            <p className="text-xs text-text-2">
              {(data?.total_despesas ?? 0) <= orcamentoMensal ? `Restam ${moeda(orcamentoMensal - (data?.total_despesas ?? 0))} de ${moeda(orcamentoMensal)}` : `Estourou ${moeda((data?.total_despesas ?? 0) - orcamentoMensal)} do orçamento`}
            </p>
          </div>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface/70 p-3">
            <p className="text-xs text-muted">Receitas</p>
            <p className="tnum mt-0.5 font-semibold text-accent">{moeda(data?.total_receitas ?? 0)}</p>
          </div>
          <div className="rounded-xl bg-surface/70 p-3">
            <p className="text-xs text-muted">Saldo</p>
            <p className={`tnum mt-0.5 font-semibold ${saldo < 0 ? "text-danger" : ""}`}>{moeda(saldo)}</p>
          </div>
        </div>
        {ehAtual && data ? (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-text-2">
            <TrendingUp className="size-4" /> Projeção de fechamento: <span className="tnum font-medium text-text">{moeda(data.projecao_fechamento)}</span>
          </p>
        ) : null}
      </motion.section>

      <Secao titulo="Evolução">
        <div className="cartao p-4 pt-8">
          <GraficoBarras dados={evolucao} altura={130} linhaReferencia={orcamentoMensal ? { valor: orcamentoMensal, rotulo: "orçamento" } : null} />
        </div>
      </Secao>

      <Secao titulo="Por categoria" acao={<Link href="/categorias" className="text-sm font-medium text-accent">Orçamentos</Link>}>
        <div className="cartao space-y-5 p-4">
          {data && data.por_categoria.length > 0 ? (
            <Anel
              titulo={moeda(data.total_despesas)}
              subtitulo="no mês"
              fatias={data.por_categoria.map((c) => {
                const cat = c.categoria_id ? mapa.get(c.categoria_id) : null;
                return { chave: c.categoria_id ?? "sem", nome: cat?.nome ?? "Sem categoria", cor: cat?.cor ?? "#7a8987", valor: c.total };
              })}
            />
          ) : null}
          {data && data.por_categoria.length > 0 ? (
            <BarrasCategoria
              total={data.total_despesas}
              linhas={data.por_categoria.map((c) => {
                const cat = c.categoria_id ? mapa.get(c.categoria_id) : null;
                return {
                  chave: c.categoria_id ?? "sem",
                  nome: cat?.nome ?? "Sem categoria",
                  cor: cat?.cor ?? "#7a8987",
                  valor: c.total,
                  limite: c.orcamento,
                  extra: c.orcamento ? `${Math.round(c.pct_orcamento ?? 0)}% do orçamento de ${moeda(c.orcamento)}` : undefined,
                };
              })}
            />
          ) : (
            <Vazio icone={PieChart} titulo="Sem despesas neste mês" />
          )}
        </div>
      </Secao>

      <Secao titulo="Contas" acao={<Link href="/contas" className="text-sm font-medium text-accent">Ver contas</Link>}>
        <Link href="/contas" className="cartao flex items-center gap-4 p-4">
          <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent"><CalendarCheck2 className="size-5" /></span>
          <div className="flex-1">
            <p className="font-medium">{data?.contas.pagas ?? 0} pagas · {data?.contas.pendentes ?? 0} pendentes</p>
            <p className="text-sm text-text-2">Ainda a pagar: <span className="tnum font-medium text-text">{moeda(data?.contas.total_pendente ?? 0)}</span></p>
          </div>
        </Link>
      </Secao>
    </div>
  );
}
