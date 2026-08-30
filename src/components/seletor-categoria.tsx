"use client";

import { createElement, useMemo } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useCategorias } from "@/hooks/use-categorias";
import { obterIcone } from "@/lib/icones";
import { cn } from "@/lib/utils";
import type { Categoria } from "@/lib/tipos";

type Props = {
  valor: string | null;
  aoMudar: (id: string | null) => void;
  /** Mostra primeiro as subcategorias desta raiz (ex.: Mercado). */
  priorizarPaiNome?: string;
  permitirNenhuma?: boolean;
  layout?: "chips" | "grade";
};

/** Seletor de categoria em chips horizontais (1 toque) ou grade. */
export function SeletorCategoria({ valor, aoMudar, priorizarPaiNome, permitirNenhuma, layout = "chips" }: Props) {
  const { categorias, raizes, filhasDe } = useCategorias();

  const ordenadas = useMemo(() => {
    if (!priorizarPaiNome) return categorias;
    const pai = raizes.find((c) => c.nome.toLowerCase() === priorizarPaiNome.toLowerCase());
    if (!pai) return categorias;
    const filhas = filhasDe(pai.id);
    const resto = categorias.filter((c) => c.id !== pai.id && !filhas.some((f) => f.id === c.id));
    return [...filhas, pai, ...resto];
  }, [categorias, raizes, filhasDe, priorizarPaiNome]);

  return (
    <div className={cn(layout === "chips" ? "sem-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-1" : "grid grid-cols-2 gap-2")}>
      {permitirNenhuma ? <OpcaoCategoria c={null} ativo={valor === null} aoEscolher={() => aoMudar(null)} layout={layout} /> : null}
      {ordenadas.map((c) => (
        <OpcaoCategoria key={c.id} c={c} ativo={valor === c.id} aoEscolher={() => aoMudar(c.id)} layout={layout} />
      ))}
    </div>
  );
}

function OpcaoCategoria({ c, ativo, aoEscolher, layout }: { c: Categoria | null; ativo: boolean; aoEscolher: () => void; layout: "chips" | "grade" }) {
  const cor = c?.cor ?? "#7a8987";
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={aoEscolher}
      aria-pressed={ativo}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
        layout === "grade" && "w-full justify-start rounded-xl",
        ativo ? "border-transparent text-white" : "border-border bg-surface text-text-2",
      )}
      style={ativo ? { backgroundColor: cor } : undefined}
    >
      <span
        className="grid size-6 place-items-center rounded-full"
        style={ativo ? { backgroundColor: "rgba(255,255,255,.2)" } : { backgroundColor: `${cor}22`, color: cor }}
      >
        {ativo ? <Check className="size-3.5" /> : createElement(obterIcone(c?.icone), { className: "size-3.5", strokeWidth: 2.4 })}
      </span>
      {c?.nome ?? "Sem categoria"}
    </motion.button>
  );
}
