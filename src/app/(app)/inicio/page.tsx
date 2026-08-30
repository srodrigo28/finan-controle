"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingCart, Plus, ArrowRight, CalendarClock, Sparkles } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { useMetricaDiaria } from "@/hooks/use-metricas";
import { useSessoes } from "@/hooks/use-sessoes";
import { useCategorias } from "@/hooks/use-categorias";
import { useOcorrencias } from "@/hooks/use-contas";
import { hojeISO, dataLonga, moeda } from "@/lib/formatar";
import { Valor } from "@/components/ui/valor";
import { BarraOrcamento, Secao, Skeleton, Vazio } from "@/components/ui/diversos";
import { LinhaLancamento } from "@/components/linha-lancamento";
import { Botao } from "@/components/ui/botao";
import { format } from "date-fns";

const entrada = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function PaginaInicio() {
  const usuario = useAuth((s) => s.usuario)!;
  const hoje = hojeISO();
  const { data: dia, isPending } = useMetricaDiaria(hoje);
  const { aberta } = useSessoes();
  const { mapa } = useCategorias();
  const { data: ocorrencias } = useOcorrencias(format(new Date(), "yyyy-MM"));

  const saudacao = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  })();

  const vencendo = (ocorrencias?.dados ?? [])
    .filter((o) => o.status !== "paga")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
    .slice(0, 3);

  return (
    <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.06 }} className="space-y-6 pt-[calc(1rem+var(--safe-t))] md:pt-6">
      <motion.header variants={entrada} className="flex items-end justify-between">
        <div>
          <p className="text-sm text-text-2">{saudacao}, {usuario.nome.split(" ")[0]}</p>
          <h1 className="text-[28px] font-semibold tracking-tight">{dataLonga(hoje)}</h1>
        </div>
        <Link href="/lancamentos/novo" aria-label="Novo lançamento" className="grid size-11 place-items-center rounded-full bg-surface-2 text-text hover:bg-surface-3">
          <Plus className="size-5" />
        </Link>
      </motion.header>

      {/* Cartão principal: gasto de hoje vs orçamento diário */}
      <motion.section variants={entrada} className="cartao fundo-aurora overflow-hidden p-5">
        <p className="text-sm font-medium text-text-2">Gasto hoje</p>
        {isPending ? (
          <Skeleton className="mt-3 h-12 w-48" />
        ) : (
          <div className="mt-1">
            <Valor valor={dia?.total_despesas ?? 0} tamanho="xl" animado />
          </div>
        )}
        {dia?.orcamento_diario ? (
          <div className="mt-4 space-y-2">
            <BarraOrcamento gasto={dia.total_despesas} limite={dia.orcamento_diario} />
            <div className="flex justify-between text-xs text-text-2">
              <span>
                {dia.saldo_orcamento !== null && dia.saldo_orcamento >= 0
                  ? `Ainda cabem ${moeda(dia.saldo_orcamento)} hoje`
                  : `Passou ${moeda(Math.abs(dia.saldo_orcamento ?? 0))} do orçamento diário`}
              </span>
              <span className="tnum">{moeda(dia.orcamento_diario)}</span>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-text-2">
            <Link href="/config" className="text-accent">Defina um orçamento diário</Link> para ver quanto ainda cabe.
          </p>
        )}
        {dia && dia.total_receitas > 0 ? (
          <p className="mt-3 text-sm text-text-2">
            Receitas hoje: <span className="tnum font-medium text-accent">{moeda(dia.total_receitas)}</span>
          </p>
        ) : null}
      </motion.section>

      {/* Modo Mercado — acesso primário */}
      <motion.div variants={entrada}>
        <Link href={aberta ? `/mercado/${aberta.id}` : "/mercado?abrir=1"} className="block">
          <motion.div
            whileTap={{ scale: 0.985 }}
            className="relative flex items-center gap-4 overflow-hidden rounded-2xl bg-accent p-5 text-accent-fg botao-brilho"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-black/15">
              <ShoppingCart className="size-6" strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold leading-tight">{aberta ? "Compra em andamento" : "Modo Mercado"}</p>
              <p className="text-sm opacity-80">
                {aberta
                  ? `${aberta.local ?? "Carrinho"} · ${moeda(aberta.total_carrinho)} até agora`
                  : "Monte o carrinho e veja o total antes do caixa"}
              </p>
            </div>
            <ArrowRight className="size-5 shrink-0 opacity-80" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Contas vencendo */}
      {vencendo.length > 0 ? (
        <motion.div variants={entrada}>
          <Secao titulo="Vencendo" acao={<Link href="/contas" className="text-sm font-medium text-accent">Ver todas</Link>}>
            <div className="cartao divide-y divide-border">
              {vencendo.map((o) => (
                <Link key={o.id} href="/contas" className="flex items-center gap-3 px-4 py-3">
                  <span className={`grid size-9 place-items-center rounded-xl ${o.status === "atrasada" ? "bg-danger-soft text-danger" : "bg-warn-soft text-warn"}`}>
                    <CalendarClock className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.conta.nome}</p>
                    <p className="text-xs text-text-2">{o.status === "atrasada" ? "Atrasada" : `Vence dia ${o.vencimento.slice(8, 10)}`}</p>
                  </div>
                  <Valor valor={o.valor_real ?? o.conta.valor_estimado} tamanho="md" className="font-medium" />
                </Link>
              ))}
            </div>
          </Secao>
        </motion.div>
      ) : null}

      {/* Lançamentos de hoje */}
      <motion.div variants={entrada}>
        <Secao titulo="Hoje" acao={<Link href="/lancamentos" className="text-sm font-medium text-accent">Histórico</Link>}>
          {isPending ? (
            <div className="cartao space-y-3 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : dia && dia.lancamentos.length > 0 ? (
            <div className="cartao divide-y divide-border">
              {dia.lancamentos.map((l) => (
                <LinhaLancamento key={l.id} lancamento={l} categoria={l.categoria_id ? mapa.get(l.categoria_id) : null} />
              ))}
            </div>
          ) : (
            <div className="cartao">
              <Vazio
                icone={Sparkles}
                titulo="Nada lançado hoje"
                descricao="Registrar um gasto leva menos de 10 segundos."
                acao={
                  <Link href="/lancamentos/novo">
                    <Botao variante="secundario" tamanho="sm">
                      <Plus className="size-4" /> Lançar agora
                    </Botao>
                  </Link>
                }
              />
            </div>
          )}
        </Secao>
      </motion.div>
    </motion.div>
  );
}
