"use client";

import { motion } from "motion/react";
import { toast } from "sonner";
import { Check, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Botao } from "@/components/ui/botao";
import { dataLonga } from "@/lib/formatar";

const BENEFICIOS = ["Modo Mercado ilimitado e offline", "Histórico de preço por item", "Timeline semanal e visão mensal", "Contas agendadas com lembrete", "Categorias, anexos e exportação CSV/JSON"];

export default function PaginaPlano() {
  const usuario = useAuth((s) => s.usuario)!;
  const completo = usuario.plano === "completo";
  const dias = usuario.dias_restantes_teste ?? 0;
  const acabou = !completo && dias <= 0;
  const pct = completo ? 100 : Math.max(0, Math.min(100, (dias / 30) * 100));

  return (
    <div className="space-y-6">
      <Cabecalho titulo="Seu plano" voltar="/mais" />

      <section className="cartao fundo-aurora p-5">
        <div className="flex items-center gap-3">
          <span className={`grid size-12 place-items-center rounded-2xl ${acabou ? "bg-warn-soft text-warn" : "bg-accent-soft text-accent"}`}>
            {acabou ? <Clock className="size-6" /> : <Sparkles className="size-6" />}
          </span>
          <div>
            <p className="text-sm text-text-2">{completo ? "Plano" : "Teste grátis"}</p>
            <p className="text-2xl font-semibold tracking-tight">
              {completo ? "Finan Completo" : acabou ? "Terminou" : `${dias} ${dias === 1 ? "dia restante" : "dias restantes"}`}
            </p>
          </div>
        </div>
        {!completo ? (
          <div className="mt-4 space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <motion.div className={`h-full rounded-full ${acabou ? "bg-warn" : "bg-accent"}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
            </div>
            <p className="text-xs text-text-2">
              {usuario.teste_expira_em ? `${acabou ? "Terminou" : "Termina"} em ${dataLonga(usuario.teste_expira_em.slice(0, 10)).toLowerCase()}` : ""} · sem cartão, nada é cobrado automaticamente
            </p>
            {!acabou ? (
              <p className="text-xs font-medium text-accent">
                Tudo liberado até lá: nenhum recurso fica bloqueado durante o teste.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="cartao p-5">
        <p className="font-semibold">Finan Completo</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          R$ 14,90<span className="text-base font-medium text-text-2">/mês</span>
        </p>
        <p className="text-sm text-text-2">ou R$ 119/ano (2 meses grátis) · cancele quando quiser</p>
        <ul className="mt-4 space-y-2 text-sm">
          {BENEFICIOS.map((b) => (
            <li key={b} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{b}</li>
          ))}
        </ul>
        {!completo ? (
          <Botao cheio tamanho="lg" className="mt-5" onClick={() => toast.info("Pagamento em breve — enquanto isso, continue usando normalmente.")}>
            Assinar o Finan Completo
          </Botao>
        ) : (
          <p className="mt-5 flex items-center gap-2 text-sm text-accent"><ShieldCheck className="size-4" /> Plano ativo. Obrigado por apoiar o Finan.</p>
        )}
        <p className="mt-3 text-center text-xs text-muted">Seus dados continuam seus em qualquer plano — exporte quando quiser.</p>
      </section>
    </div>
  );
}
