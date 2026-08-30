"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, ArrowDownRight, Crown } from "lucide-react";
import { moeda } from "@/lib/formatar";

const DIAS = [
  { r: "seg", v: 42.3 }, { r: "ter", v: 18 }, { r: "qua", v: 96.4 }, { r: "qui", v: 31.9 },
  { r: "sex", v: 158.7 }, { r: "sab", v: 312.4 }, { r: "dom", v: 64.2 },
];
const CATEGORIAS = [
  { n: "Mercado", v: 486.2, c: "#2fd6a2" },
  { n: "Alimentação fora", v: 142.5, c: "#f2b23a" },
  { n: "Transporte", v: 68.9, c: "#60a5fa" },
  { n: "Lazer", v: 26.3, c: "#c084fc" },
];
const MESES = [
  { r: "mar", v: 2890 }, { r: "abr", v: 3120 }, { r: "mai", v: 2740 }, { r: "jun", v: 2980 }, { r: "jul", v: 2610 }, { r: "ago", v: 2385, atual: true },
];

/** Seção de gráficos — dados de demonstração, mesmos componentes visuais do app. */
export function GraficosDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { once: true, margin: "-15% 0px" });
  const totalSemana = DIAS.reduce((a, d) => a + d.v, 0);
  const totalCat = CATEGORIAS.reduce((a, c) => a + c.v, 0);
  const maxDia = Math.max(...DIAS.map((d) => d.v));
  const maxMes = Math.max(...MESES.map((m) => m.v));

  return (
    <section id="graficos" ref={ref} className="bg-[var(--l-verde)] py-24 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--l-menta)]">Gráficos que entregam resultado</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Você vê exatamente onde o dinheiro foi — e onde vai.</h2>
          <p className="mt-4 text-lg text-white/70">Semana a semana, categoria a categoria, com projeção de fechamento do mês. Sem planilha, sem esforço.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {/* Semana */}
          <motion.article initial={{ opacity: 0, y: 24 }} animate={visivel ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="vidro rounded-3xl p-6 md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Semana 24 – 30 ago</p>
                <p className="display mt-1 text-4xl font-semibold tnum">{moeda(totalSemana)}</p>
                <p className="mt-2 flex items-center gap-1 text-sm text-[var(--l-ambar)]">
                  <ArrowUpRight className="size-4" /> R$ 118,40 (+19%) <span className="text-white/50">vs semana anterior</span>
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-[var(--l-ambar)]/15 px-2.5 py-1 text-xs font-medium text-[var(--l-ambar)]"><Crown className="size-3.5" /> Mais cara do mês</span>
            </div>
            <div className="mt-8 flex h-40 items-end gap-2">
              {DIAS.map((d, i) => (
                <div key={d.r} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                  {d.v === maxDia ? <span className="tnum absolute -top-6 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[var(--l-verde)]">{moeda(d.v)}</span> : null}
                  <motion.span
                    initial={{ height: 0 }}
                    animate={visivel ? { height: `${(d.v / maxDia) * 100}%` } : {}}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.15 + i * 0.06 }}
                    className={`w-full max-w-9 rounded-t-[4px] ${d.v === maxDia ? "bg-[var(--l-menta)]" : "bg-[var(--l-menta)]/45 group-hover:bg-[var(--l-menta)]/80"}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {DIAS.map((d) => <span key={d.r} className={`flex-1 text-center text-[11px] ${d.v === maxDia ? "font-semibold text-white" : "text-white/50"}`}>{d.r}</span>)}
            </div>
          </motion.article>

          {/* Categorias (anel) */}
          <motion.article initial={{ opacity: 0, y: 24 }} animate={visivel ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="vidro rounded-3xl p-6">
            <p className="text-sm text-white/60">Por categoria</p>
            <div className="mt-4 flex items-center gap-5">
              <Anel dados={CATEGORIAS} total={totalCat} animar={visivel} />
              <ul className="flex-1 space-y-2.5">
                {CATEGORIAS.map((c) => (
                  <li key={c.n} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: c.c }} />{c.n}</span>
                      <span className="tnum text-white/60">{Math.round((c.v / totalCat) * 100)}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-xs text-white/50">Categorias são suas: crie, renomeie, use subcategorias e defina orçamento por cada uma.</p>
          </motion.article>

          {/* Mensal */}
          <motion.article initial={{ opacity: 0, y: 24 }} animate={visivel ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="vidro rounded-3xl p-6 md:col-span-3">
            <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-center">
              <div>
                <p className="text-sm text-white/60">Agosto</p>
                <p className="display mt-1 text-4xl font-semibold tnum">{moeda(2385)}</p>
                <p className="mt-2 flex items-center gap-1 text-sm text-[var(--l-menta)]"><ArrowDownRight className="size-4" /> 8,6% abaixo de julho</p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-white/50">Projeção de fechamento</p><p className="tnum mt-0.5 font-semibold">{moeda(2470)}</p></div>
                  <div className="rounded-2xl bg-white/5 p-3"><p className="text-xs text-white/50">Contas a pagar</p><p className="tnum mt-0.5 font-semibold">{moeda(613.5)}</p></div>
                </div>
              </div>
              <div>
                <div className="relative flex h-36 items-end gap-3">
                  <div className="absolute inset-x-0 border-t border-dashed border-white/25" style={{ bottom: `${(3000 / maxMes) * 100}%` }}>
                    <span className="absolute right-0 -top-5 rounded-full bg-white/10 px-2 text-[10px] text-white/70">orçamento R$ 3.000</span>
                  </div>
                  {MESES.map((m, i) => (
                    <div key={m.r} className="flex h-full flex-1 flex-col items-center justify-end">
                      <motion.span initial={{ height: 0 }} animate={visivel ? { height: `${(m.v / maxMes) * 100}%` } : {}} transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.3 + i * 0.07 }} className={`w-full max-w-12 rounded-t-[4px] ${m.atual ? "bg-[var(--l-menta)]" : m.v > 3000 ? "bg-[var(--l-coral)]/80" : "bg-white/25"}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-3">{MESES.map((m) => <span key={m.r} className={`flex-1 text-center text-[11px] ${m.atual ? "font-semibold text-white" : "text-white/50"}`}>{m.r}</span>)}</div>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

function Anel({ dados, total, animar }: { dados: { n: string; v: number; c: string }[]; total: number; animar: boolean }) {
  const raio = 44;
  const circ = 2 * Math.PI * raio;
  // fatias com início acumulado (calculado antes do render, sem mutação)
  const fatias = dados.reduce<{ d: (typeof dados)[number]; frac: number; offset: number }[]>((acc, d) => {
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].frac : 0;
    return [...acc, { d, frac: d.v / total, offset }];
  }, []);
  return (
    <svg viewBox="0 0 120 120" className="size-32 shrink-0 -rotate-90">
      <circle cx="60" cy="60" r={raio} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="14" />
      {fatias.map(({ d, frac, offset }, i) => {
        return (
          <motion.circle
            key={d.n}
            cx="60" cy="60" r={raio} fill="none" stroke={d.c} strokeWidth="14" strokeLinecap="butt"
            strokeDasharray={`${Math.max(0, frac * circ - 2)} ${circ}`}
            initial={{ strokeDashoffset: circ, opacity: 0 }}
            animate={animar ? { strokeDashoffset: -offset * circ, opacity: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.12 }}
          />
        );
      })}
    </svg>
  );
}
