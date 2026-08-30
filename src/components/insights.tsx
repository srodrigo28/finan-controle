"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CalendarClock, Sparkles, ChevronRight } from "lucide-react";
import { useInsights, type Insight } from "@/hooks/use-insights";
import { useCategorias } from "@/hooks/use-categorias";
import { Secao, Skeleton } from "@/components/ui/diversos";
import { cn } from "@/lib/utils";

function icone(i: Insight) {
  if (i.tipo.startsWith("contas")) return CalendarClock;
  if (i.tipo.startsWith("preco") || i.tipo.startsWith("categoria")) return i.nivel === "bom" ? TrendingDown : TrendingUp;
  if (i.nivel === "atencao") return AlertTriangle;
  if (i.nivel === "bom") return Sparkles;
  return Lightbulb;
}

/** Cartões horizontais com as frases automáticas da semana (dados da API, sem IA). */
export function Insights({ inicio, titulo = "Insights", compacto }: { inicio?: string; titulo?: string; compacto?: boolean }) {
  const { data, isPending } = useInsights(inicio);
  const { mapa } = useCategorias();
  const itens = data?.dados ?? [];
  if (!isPending && itens.length === 0) return null;

  return (
    <Secao titulo={titulo}>
      {isPending ? (
        <div className="flex gap-3">
          <Skeleton className="h-28 w-64 shrink-0 rounded-2xl" /><Skeleton className="h-28 w-64 shrink-0 rounded-2xl" />
        </div>
      ) : (
        <ul className={cn("sem-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1", compacto && "snap-x snap-mandatory")}>
          {itens.map((i, idx) => {
            const Icone = icone(i);
            const cat = i.categoria_id ? mapa.get(i.categoria_id) : null;
            const cor = i.nivel === "atencao" ? "var(--warn)" : i.nivel === "bom" ? "var(--accent)" : "var(--muted)";
            const conteudo = (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="cartao flex h-full w-[272px] shrink-0 snap-start flex-col gap-2 p-4"
                style={{ borderTop: `3px solid ${cat?.cor ?? cor}` }}
              >
                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: cor }}>
                  <Icone className="size-4" />
                  {i.nivel === "atencao" ? "Atenção" : i.nivel === "bom" ? "Boa notícia" : "Para saber"}
                </div>
                <p className="text-[15px] font-semibold leading-snug">{i.titulo}</p>
                <p className="line-clamp-3 text-xs leading-relaxed text-text-2">{i.detalhe}</p>
                {i.link ? <span className="mt-auto flex items-center gap-0.5 pt-1 text-xs font-medium text-accent">Ver <ChevronRight className="size-3.5" /></span> : null}
              </motion.div>
            );
            return <li key={i.tipo + idx} className="flex">{i.link ? <Link href={i.link} className="flex">{conteudo}</Link> : conteudo}</li>;
          })}
        </ul>
      )}
    </Secao>
  );
}
