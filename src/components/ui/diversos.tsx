"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { cn, vibrar } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}

export function Chip({
  ativo,
  children,
  onClick,
  cor,
  className,
}: {
  ativo?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  cor?: string;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
        ativo ? "border-transparent bg-text text-bg" : "border-border bg-surface text-text-2 hover:bg-surface-2",
        className,
      )}
      style={ativo && cor ? { backgroundColor: cor, color: "#fff" } : undefined}
    >
      {children}
    </motion.button>
  );
}

export function Vazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: {
  icone: React.ComponentType<{ className?: string }>;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-muted">
        <Icone className="size-7" />
      </div>
      <p className="font-semibold">{titulo}</p>
      {descricao ? <p className="max-w-xs text-sm text-text-2">{descricao}</p> : null}
      {acao ? <div className="mt-2">{acao}</div> : null}
    </div>
  );
}

/** Stepper +/− para quantidade (sem teclado). Suporta passo fracionado. */
export function Stepper({
  valor,
  aoMudar,
  min = 0,
  passo = 1,
  className,
}: {
  valor: number;
  aoMudar: (v: number) => void;
  min?: number;
  passo?: number;
  className?: string;
}) {
  const ajustar = (delta: number) => {
    const novo = Math.max(min, Math.round((valor + delta) * 1000) / 1000);
    vibrar(8);
    aoMudar(novo);
  };
  const rotulo = Number.isInteger(valor) ? String(valor) : valor.toFixed(3).replace(/0+$/, "").replace(".", ",");
  return (
    <div className={cn("inline-flex h-12 items-center rounded-full bg-surface-2 p-1", className)}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => ajustar(-passo)}
        className="grid size-10 place-items-center rounded-full bg-surface text-text shadow-sm"
        aria-label="Diminuir"
      >
        <Minus className="size-4" />
      </motion.button>
      <span className="tnum min-w-12 px-1 text-center text-base font-semibold">{rotulo}</span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => ajustar(passo)}
        className="grid size-10 place-items-center rounded-full bg-text text-bg shadow-sm"
        aria-label="Aumentar"
      >
        <Plus className="size-4" />
      </motion.button>
    </div>
  );
}

/** Barra de progresso de orçamento. Vermelho só quando estoura de verdade. */
export function BarraOrcamento({ gasto, limite, className }: { gasto: number; limite: number | null; className?: string }) {
  if (!limite || limite <= 0) return null;
  const pctRaw = (gasto / limite) * 100;
  const pct = Math.min(100, pctRaw);
  const estourou = pctRaw > 100;
  const alerta = pctRaw >= 85 && !estourou;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-3", className)} role="progressbar" aria-valuenow={Math.round(pctRaw)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className={cn("h-full rounded-full", estourou ? "bg-danger" : alerta ? "bg-warn" : "bg-accent")}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

/** Controle segmentado (ex.: despesa / receita). */
export function Segmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
  className,
}: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  aoMudar: (v: T) => void;
  className?: string;
}) {
  // layoutId por instância: com dois Segmentados na mesma tela, um id fixo faria o
  // indicador saltar de um grupo para o outro.
  const idGrupo = useId();
  return (
    <div className={cn("relative flex rounded-full bg-surface-2 p-1", className)} role="tablist">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => aoMudar(o.valor)}
            className={cn("relative z-10 flex-1 rounded-full py-2 text-sm font-medium transition-colors", ativo ? "text-bg" : "text-text-2")}
          >
            {ativo ? (
              <motion.span layoutId={`seg-ativo-${idGrupo}`} className="absolute inset-0 -z-10 rounded-full bg-text" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            ) : null}
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}

export function Secao({ titulo, acao, children, className }: { titulo?: string; acao?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      {titulo || acao ? (
        <div className="flex items-center justify-between px-1">
          {titulo ? <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{titulo}</h2> : <span />}
          {acao}
        </div>
      ) : null}
      {children}
    </section>
  );
}
