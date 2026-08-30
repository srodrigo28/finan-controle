"use client";

import { motion } from "motion/react";
import { moeda } from "@/lib/formatar";
import { cn } from "@/lib/utils";

export type FatiaAnel = { chave: string; nome: string; cor: string; valor: number };

type Props = {
  fatias: FatiaAnel[];
  total?: number;
  tamanho?: number;
  espessura?: number;
  /** Texto central (ex.: total). */
  titulo?: string;
  subtitulo?: string;
  animar?: boolean;
  className?: string;
  /** Máximo de fatias antes de agrupar em "Outras". */
  maximo?: number;
};

/**
 * Anel por categoria (mesmo padrão da landing): cor segue a entidade, texto usa tokens de texto,
 * fatias com espaçador de 2px, animação de preenchimento. Agrupa o excedente em "Outras".
 */
export function Anel({ fatias, total, tamanho = 124, espessura = 15, titulo, subtitulo, animar = true, className, maximo = 6 }: Props) {
  const ordenadas = [...fatias].filter((f) => f.valor > 0).sort((a, b) => b.valor - a.valor);
  const principais = ordenadas.slice(0, maximo);
  const resto = ordenadas.slice(maximo);
  const dados = resto.length
    ? [...principais, { chave: "outras", nome: "Outras", cor: "var(--muted)", valor: resto.reduce((a, f) => a + f.valor, 0) }]
    : principais;
  const soma = total ?? dados.reduce((a, f) => a + f.valor, 0);
  const raio = 50 - espessura / 2 / (tamanho / 120);
  const circ = 2 * Math.PI * raio;
  const fatiasCalc = dados.reduce<{ f: FatiaAnel; frac: number; offset: number }[]>((acc, f) => {
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].frac : 0;
    return [...acc, { f, frac: soma > 0 ? f.valor / soma : 0, offset }];
  }, []);

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }}>
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label="Distribuição por categoria">
          <circle cx="60" cy="60" r={raio} fill="none" stroke="var(--surface-3)" strokeWidth={espessura * (120 / tamanho)} />
          {fatiasCalc.map(({ f, frac, offset }, i) => (
            <motion.circle
              key={f.chave}
              cx="60" cy="60" r={raio} fill="none" stroke={f.cor}
              strokeWidth={espessura * (120 / tamanho)}
              strokeDasharray={`${Math.max(0, frac * circ - 1.5)} ${circ}`}
              initial={animar ? { strokeDashoffset: circ, opacity: 0 } : false}
              animate={{ strokeDashoffset: -offset * circ, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.08 }}
            />
          ))}
        </svg>
        {titulo ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="tnum text-base font-semibold leading-tight">{titulo}</span>
            {subtitulo ? <span className="text-[11px] text-muted">{subtitulo}</span> : null}
          </div>
        ) : null}
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {fatiasCalc.map(({ f, frac }) => (
          <li key={f.chave} className="flex items-center justify-between gap-2 text-[13px]">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: f.cor }} />
              <span className="truncate">{f.nome}</span>
            </span>
            <span className="tnum shrink-0 text-xs text-text-2">
              {moeda(f.valor)} <span className="text-muted">· {Math.round(frac * 100)}%</span>
            </span>
          </li>
        ))}
        {fatiasCalc.length === 0 ? <li className="text-sm text-muted">Sem gastos no período</li> : null}
      </ul>
    </div>
  );
}
