"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Apple, SprayCan, Beef, Milk, Wine, ChevronLeft, MoreHorizontal } from "lucide-react";
import { Valor } from "@/components/ui/valor";
import { moeda } from "@/lib/formatar";

const ITENS = [
  { nome: "Arroz 5kg", preco: 24.9, qtd: 2, Icone: Milk, cor: "#f59e0b" },
  { nome: "Banana prata", preco: 6.49, qtd: 1.2, Icone: Apple, cor: "#34d399", kg: true },
  { nome: "Detergente", preco: 2.99, qtd: 3, Icone: SprayCan, cor: "#60a5fa" },
  { nome: "Picanha", preco: 79.9, qtd: 1, Icone: Beef, cor: "#f87171" },
  { nome: "Vinho tinto", preco: 42.0, qtd: 1, Icone: Wine, cor: "#c084fc" },
];
const ORCAMENTO = 250;

/** Celular animado: itens entram um a um e o total sobe — a promessa do produto em 8 segundos. */
export function MockupCarrinho({ className = "" }: { className?: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i = i >= ITENS.length ? 0 : i + 1;
      setN(i);
    };
    const t = setInterval(tick, i === 0 ? 900 : 1500);
    return () => clearInterval(t);
  }, []);

  const visiveis = ITENS.slice(0, n);
  const total = visiveis.reduce((a, i) => a + i.preco * i.qtd, 0);
  const pct = Math.min(1, total / ORCAMENTO);
  const estourou = total > ORCAMENTO;

  return (
    <div className={`relative mx-auto w-[300px] sm:w-[320px] ${className}`}>
      {/* moldura */}
      <div className="rounded-[44px] bg-[#0b0e0f] p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] ring-1 ring-white/10">
        <div className="relative h-[620px] overflow-hidden rounded-[36px] bg-[#0b0e0f] text-[#f1f4f2]">
          <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

          <div className={`rounded-b-[28px] px-5 pb-4 pt-10 transition-colors duration-500 ${estourou ? "bg-[#e5484d] text-white" : "bg-[#f1f4f2] text-[#0b0e0f]"}`}>
            <div className="flex items-center justify-between text-xs opacity-70">
              <ChevronLeft className="size-4" /> Atacadão <MoreHorizontal className="size-4" />
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider opacity-60">Total no carrinho</p>
            <div className={`${estourou ? "[&_.text-muted]:text-white/70 [&_.text-text-2]:text-white/80" : "[&_.text-muted]:text-black/50 [&_.text-text-2]:text-black/60"}`}>
              <Valor valor={total} tamanho="hero" animado className="text-[44px] [&>span:nth-child(2)]:text-[44px]" />
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
              <motion.div className={`h-full rounded-full ${estourou ? "bg-white" : pct > 0.85 ? "bg-[#f2b23a]" : "bg-[#0e9f6e]"}`} animate={{ width: `${pct * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
            <p className="mt-1.5 text-[11px] opacity-70">
              {estourou ? `Passou ${moeda(total - ORCAMENTO)} do orçamento` : `Ainda cabem ${moeda(ORCAMENTO - total)} de ${moeda(ORCAMENTO)}`}
            </p>
          </div>

          <ul className="space-y-2 px-4 pt-4">
            <AnimatePresence initial={false}>
              {[...visiveis].reverse().map((i) => (
                <motion.li
                  key={i.nome}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="flex items-center gap-3 rounded-2xl bg-[#131819] px-3 py-2.5"
                >
                  <span className="grid size-8 place-items-center rounded-lg" style={{ backgroundColor: `${i.cor}22`, color: i.cor }}>
                    <i.Icone className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.nome}</p>
                    <p className="tnum text-[11px] text-[#8b959b]">{i.kg ? `${i.qtd} kg ×` : `${i.qtd}×`} {moeda(i.preco)}</p>
                  </div>
                  <span className="tnum text-sm font-semibold">{moeda(i.preco * i.qtd)}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="absolute inset-x-0 bottom-0 flex gap-2 px-4 pb-6 pt-8" style={{ background: "linear-gradient(to top, #0b0e0f 60%, transparent)" }}>
            <motion.div animate={{ scale: n > 0 && n < ITENS.length ? [1, 0.96, 1] : 1 }} transition={{ duration: 0.4 }} className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-[#2fd6a2] py-3 text-sm font-semibold text-[#06261c]">
              <Plus className="size-4" strokeWidth={2.6} /> Adicionar
            </motion.div>
            <div className="flex flex-1 items-center justify-center rounded-full border border-white/15 py-3 text-sm font-medium">Fechar</div>
          </div>
        </div>
      </div>
    </div>
  );
}
