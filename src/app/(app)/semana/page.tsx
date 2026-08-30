"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Crown, CalendarRange } from "lucide-react";
import { addWeeks, eachDayOfInterval, format, parseISO, startOfWeek, subWeeks, isSameWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMetricaSemanal } from "@/hooks/use-metricas";
import { useCategorias } from "@/hooks/use-categorias";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Valor } from "@/components/ui/valor";
import { Skeleton, Secao, Vazio } from "@/components/ui/diversos";
import { GraficoBarras, BarrasCategoria } from "@/components/graficos/barras";
import { moeda, pct } from "@/lib/formatar";
import { cn } from "@/lib/utils";

const SEMANAS_ATRAS = 16;

export default function PaginaSemana() {
  const [hoje] = useState(() => new Date());
  const [inicioAtual] = useState(() => startOfWeek(hoje, { weekStartsOn: 1 }));
  const [inicio, setInicio] = useState(inicioAtual);
  const chave = format(inicio, "yyyy-MM-dd");
  const { data, isPending } = useMetricaSemanal(chave);
  const { mapa } = useCategorias();
  const refTrilho = useRef<HTMLDivElement>(null);

  const semanas = useMemo(() => Array.from({ length: SEMANAS_ATRAS + 1 }, (_, i) => subWeeks(inicioAtual, SEMANAS_ATRAS - i)), [inicioAtual]);

  useEffect(() => {
    const el = refTrilho.current?.querySelector<HTMLElement>('[data-ativa="1"]');
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [chave]);

  const dias = useMemo(() => {
    const fim = addWeeks(inicio, 1);
    return eachDayOfInterval({ start: inicio, end: new Date(fim.getTime() - 1) }).map((d) => {
      const iso = format(d, "yyyy-MM-dd");
      const p = data?.por_dia.find((x) => x.data === iso);
      return { chave: iso, rotulo: format(d, "EEEEEE", { locale: ptBR }), valor: p?.total ?? 0, destaque: data?.dia_mais_caro === iso };
    });
  }, [inicio, data]);

  const variacao = data?.variacao_pct ?? null;
  const subiu = (data?.variacao_valor ?? 0) > 0;

  return (
    <div className="space-y-6">
      <Cabecalho titulo="Semana" subtitulo="Compare e encontre onde o dinheiro foi" grande />

      {/* Timeline horizontal de semanas */}
      <div ref={refTrilho} className="sem-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {semanas.map((s) => {
          const ativa = isSameWeek(s, inicio, { weekStartsOn: 1 });
          const atual = isSameWeek(s, hoje, { weekStartsOn: 1 });
          return (
            <button
              key={s.toISOString()}
              type="button"
              data-ativa={ativa ? "1" : "0"}
              onClick={() => setInicio(s)}
              className={cn(
                "flex w-[72px] shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition-colors",
                ativa ? "border-transparent bg-text text-bg" : "border-border bg-surface text-text-2",
              )}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-70">{format(s, "MMM", { locale: ptBR })}</span>
              <span className="text-lg font-semibold leading-tight">{format(s, "dd")}</span>
              <span className="text-[10px] opacity-70">{atual ? "atual" : `a ${format(addWeeks(s, 1), "dd")}`}</span>
            </button>
          );
        })}
      </div>

      {/* Total e comparativo */}
      <motion.section key={chave} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="cartao p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-text-2">
              {format(inicio, "d MMM", { locale: ptBR })} – {format(addWeeks(inicio, 1).getTime() - 1, "d MMM", { locale: ptBR })}
            </p>
            {isPending && !data ? <Skeleton className="mt-2 h-10 w-44" /> : <div className="mt-1"><Valor valor={data?.total ?? 0} tamanho="xl" animado /></div>}
          </div>
          {data?.semana_mais_cara_do_mes ? (
            <span className="flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-medium text-warn"><Crown className="size-3.5" /> Mais cara do mês</span>
          ) : null}
        </div>
        {data ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className={cn("flex items-center gap-1 font-medium", subiu ? "text-warn" : "text-accent")}>
              {subiu ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
              {moeda(Math.abs(data.variacao_valor))} {variacao !== null ? `(${pct(variacao)})` : ""}
            </span>
            <span className="text-text-2">vs semana anterior ({moeda(data.total_anterior)})</span>
          </div>
        ) : null}
      </motion.section>

      <Secao titulo="Por dia">
        <div className="cartao p-4 pt-8">
          <GraficoBarras dados={dias} altura={140} />
          {data?.dia_mais_caro ? (
            <p className="mt-3 text-xs text-text-2">
              Dia mais caro: <span className="font-medium capitalize text-text">{format(parseISO(data.dia_mais_caro), "EEEE, d", { locale: ptBR })}</span>
            </p>
          ) : null}
        </div>
      </Secao>

      <Secao titulo="Por categoria">
        <div className="cartao p-4">
          {data && data.por_categoria.length > 0 ? (
            <BarrasCategoria
              total={data.total}
              linhas={data.por_categoria.map((c) => {
                const cat = c.categoria_id ? mapa.get(c.categoria_id) : null;
                return { chave: c.categoria_id ?? "sem", nome: cat?.nome ?? "Sem categoria", cor: cat?.cor ?? "#7a8987", valor: c.total };
              })}
            />
          ) : (
            <Vazio icone={CalendarRange} titulo="Sem gastos nesta semana" />
          )}
        </div>
      </Secao>
    </div>
  );
}
