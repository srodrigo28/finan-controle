"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, WifiOff, ShieldCheck, Sparkles } from "lucide-react";
import { MockupCarrinho } from "@/components/landing/mockup-carrinho";

const sobe = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } } };

export function Hero() {
  return (
    <section className="grade-pontos relative overflow-hidden bg-[var(--l-verde)] text-white">
      <div className="pointer-events-none absolute -left-40 top-10 size-[520px] rounded-full bg-[var(--l-menta)]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-[420px] rounded-full bg-[var(--l-ambar)]/15 blur-[120px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-32 md:grid-cols-[1.1fr_0.9fr] md:pb-28 md:pt-40">
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.09 }}>
          <motion.span variants={sobe} className="vidro inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-[var(--l-menta-2)]">
            <Sparkles className="size-3.5" /> Novo: Modo Mercado — funciona sem internet
          </motion.span>
          <motion.h1 variants={sobe} className="mt-6 text-[44px] font-bold leading-[1.02] sm:text-[60px] md:text-[68px]">
            Saiba o total <span className="text-[var(--l-menta)]">antes</span> de chegar no caixa.
          </motion.h1>
          <motion.p variants={sobe} className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
            Apps de finanças registram o gasto <em>depois</em> que o dinheiro saiu. O Finan mostra o carrinho crescendo
            em tempo real, no corredor do mercado — onde ainda dá para decidir o que cortar.
          </motion.p>
          <motion.div variants={sobe} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/cadastro" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--l-menta)] px-7 text-base font-semibold text-[var(--l-verde)] brilho-menta transition-transform hover:scale-[1.03]">
              Começar grátis por 30 dias <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/entrar" className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 px-7 text-base font-medium text-white hover:bg-white/5">
              Já tenho conta
            </Link>
          </motion.div>
          <motion.ul variants={sobe} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
            <li className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-[var(--l-menta)]" /> Sem cartão de crédito</li>
            <li className="flex items-center gap-1.5"><WifiOff className="size-4 text-[var(--l-menta)]" /> Carrinho 100% offline</li>
            <li className="flex items-center gap-1.5"><Sparkles className="size-4 text-[var(--l-menta)]" /> Seus dados são seus — exporte quando quiser</li>
          </motion.ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} className="relative">
          <div className="flutuar">
            <MockupCarrinho />
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="vidro absolute -left-10 top-[46%] hidden rounded-2xl px-4 py-3 text-sm shadow-xl md:block">
            <p className="text-xs text-white/60">Arroz 5kg</p>
            <p className="font-semibold text-[var(--l-ambar)]">R$ 3,40 mais caro que da última vez</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 }} className="vidro absolute -right-4 bottom-32 hidden rounded-2xl px-4 py-3 text-sm shadow-xl md:block">
            <p className="text-xs text-white/60">Fechou a compra</p>
            <p className="font-semibold text-[var(--l-menta)]">Virou 1 lançamento com 5 itens</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
