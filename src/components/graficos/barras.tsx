"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { moeda } from "@/lib/formatar";
import { cn } from "@/lib/utils";

export type PontoBarra = { rotulo: string; valor: number; chave: string; destaque?: boolean; sub?: string };

type Props = {
  dados: PontoBarra[];
  altura?: number;
  /** Índice selecionado (controlado) — a barra fica em cor plena, as demais suavizadas. */
  selecionado?: string | null;
  aoSelecionar?: (chave: string) => void;
  linhaReferencia?: { valor: number; rotulo: string } | null;
  className?: string;
};

/**
 * Gráfico de barras (uma série, um eixo). Marcas finas, pontas arredondadas ancoradas na base,
 * rótulo direto só na barra selecionada/maior, tooltip por barra.
 */
export function GraficoBarras({ dados, altura = 160, selecionado, aoSelecionar, linhaReferencia, className }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...dados.map((d) => d.valor), linhaReferencia?.valor ?? 0);
  const maior = dados.reduce((a, b) => (b.valor > a.valor ? b : a), dados[0]);
  const ativo = hover ?? selecionado ?? null;

  return (
    <div className={cn("relative", className)} role="img" aria-label="Gráfico de barras">
      {linhaReferencia && linhaReferencia.valor > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center gap-2" style={{ top: `${(1 - linhaReferencia.valor / max) * altura}px` }}>
          <span className="h-px flex-1 border-t border-dashed border-muted/60" />
          <span className="rounded-full bg-surface-2 px-1.5 text-[10px] text-text-2">{linhaReferencia.rotulo}</span>
        </div>
      ) : null}
      <div className="flex items-end gap-[6px]" style={{ height: altura }}>
        {dados.map((d) => {
          const h = Math.max(d.valor > 0 ? 4 : 2, (d.valor / max) * altura);
          const on = ativo === d.chave;
          const rotular = on || (ativo === null && d === maior && d.valor > 0);
          return (
            <button
              key={d.chave}
              type="button"
              onMouseEnter={() => setHover(d.chave)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(d.chave)}
              onBlur={() => setHover(null)}
              onClick={() => aoSelecionar?.(d.chave)}
              aria-label={`${d.rotulo}: ${moeda(d.valor)}`}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              {rotular ? (
                <span className="tnum pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-md bg-text px-1.5 py-0.5 text-[10px] font-medium text-bg">
                  {moeda(d.valor)}
                </span>
              ) : null}
              <motion.span
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                className={cn(
                  "w-full max-w-7 rounded-t-[4px] transition-colors",
                  d.valor === 0 ? "bg-surface-3" : on ? "bg-accent-strong" : d.destaque ? "bg-accent" : ativo === null ? "bg-accent" : "bg-accent/45",
                )}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-[6px]">
        {dados.map((d) => (
          <span key={d.chave} className={cn("flex-1 truncate text-center text-[11px]", ativo === d.chave ? "font-semibold text-text" : "text-muted")}>
            {d.rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Barras horizontais por categoria (a cor é da entidade; o texto usa tokens de texto). */
export function BarrasCategoria({
  linhas,
  total,
}: {
  linhas: { chave: string; nome: string; cor: string; valor: number; extra?: string; limite?: number | null }[];
  total: number;
}) {
  return (
    <ul className="space-y-3">
      {linhas.map((l) => {
        const pct = total > 0 ? (l.valor / total) * 100 : 0;
        const pctLimite = l.limite ? (l.valor / l.limite) * 100 : null;
        const estourou = pctLimite !== null && pctLimite > 100;
        return (
          <li key={l.chave}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: l.cor }} />
                {l.nome}
              </span>
              <span className="tnum text-text-2">
                {moeda(l.valor)} <span className="text-muted">· {pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: estourou ? "var(--danger)" : l.cor }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, pctLimite ?? pct)}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            {l.extra ? <p className={cn("mt-1 text-xs", estourou ? "text-danger" : "text-muted")}>{l.extra}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
