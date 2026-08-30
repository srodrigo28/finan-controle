"use client";

import { useEffect } from "react";
import { animate, useMotionValue, useTransform, motion } from "motion/react";
import { moedaPartes } from "@/lib/formatar";
import { cn } from "@/lib/utils";

type Props = {
  valor: number;
  /** "hero" = total do carrinho; "xl" = cards; "md"/"sm" = listas */
  tamanho?: "hero" | "xl" | "lg" | "md" | "sm";
  animado?: boolean;
  className?: string;
  sinal?: "auto" | "nunca" | "sempre";
  tipo?: "despesa" | "receita" | "neutro";
};

const TAM = {
  hero: { base: "text-[56px] sm:text-[64px]", cent: "text-[28px] sm:text-[32px]", rs: "text-2xl" },
  xl: { base: "text-[34px]", cent: "text-lg", rs: "text-base" },
  lg: { base: "text-2xl", cent: "text-sm", rs: "text-sm" },
  md: { base: "text-base", cent: "text-base", rs: "text-base" },
  sm: { base: "text-sm", cent: "text-sm", rs: "text-sm" },
};

/** Valor monetário com hierarquia tipográfica (R$ e centavos menores) e contagem animada. */
export function Valor({ valor, tamanho = "md", animado = false, className, sinal = "auto", tipo = "neutro" }: Props) {
  const mv = useMotionValue(animado ? 0 : valor);
  const inteiro = useTransform(mv, (v) => moedaPartes(v).inteiro);
  const centavos = useTransform(mv, (v) => moedaPartes(v).centavos);
  const completo = useTransform(mv, (v) => {
    const p = moedaPartes(v);
    return `R$ ${p.inteiro},${p.centavos}`;
  });

  useEffect(() => {
    if (!animado) {
      mv.set(valor);
      return;
    }
    const ctrl = animate(mv, valor, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
    return () => ctrl.stop();
  }, [valor, animado, mv]);

  const t = TAM[tamanho];
  const prefixoSinal = sinal === "nunca" ? "" : sinal === "sempre" ? (valor < 0 ? "−" : "+") : valor < 0 ? "−" : "";
  const corTipo = tipo === "receita" ? "text-accent" : "";

  if (tamanho === "md" || tamanho === "sm") {
    return (
      <span className={cn("tnum whitespace-nowrap", t.base, corTipo, className)}>
        {prefixoSinal}
        <motion.span>{completo}</motion.span>
      </span>
    );
  }

  return (
    <span className={cn("moeda-grande inline-flex items-baseline whitespace-nowrap", corTipo, className)}>
      <span className={cn("mr-1.5 font-medium text-muted", t.rs)}>
        {prefixoSinal}R$
      </span>
      <motion.span className={t.base}>{inteiro}</motion.span>
      <span className={cn("text-text-2", t.cent)}>
        ,<motion.span>{centavos}</motion.span>
      </span>
    </span>
  );
}
