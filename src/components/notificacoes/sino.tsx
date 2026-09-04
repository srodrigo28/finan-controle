"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Bell, AlertCircle, Lightbulb, CheckCircle2, CheckCheck } from "lucide-react";
import { useNotificacoes } from "@/hooks/use-notificacoes";
import { Folha } from "@/components/ui/folha";
import { Botao } from "@/components/ui/botao";
import { Vazio } from "@/components/ui/diversos";
import { dataRelativa } from "@/lib/formatar";
import { cn } from "@/lib/utils";
import type { Notificacao } from "@/lib/tipos";

const ICONE = { atencao: AlertCircle, bom: CheckCircle2, info: Lightbulb } as const;
const COR = { atencao: "text-warn", bom: "text-accent", info: "text-text-2" } as const;

/** Sino com contador; abre a fila numa folha (N3a). */
export function Sino() {
  const [aberta, setAberta] = useState(false);
  const { notificacoes, naoLidas, ler, lerTodas } = useNotificacoes();
  const roteador = useRouter();

  // N4b: tocar marca como lida e leva para a tela do assunto.
  const aoTocar = (n: Notificacao) => {
    if (!n.lida) ler.mutate(n.id);
    if (n.link) {
      setAberta(false);
      roteador.push(n.link);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={naoLidas > 0 ? `Notificações (${naoLidas} não lidas)` : "Notificações"}
        onClick={() => setAberta(true)}
        className="relative grid size-11 place-items-center rounded-full bg-surface-2 text-text hover:bg-surface-3"
      >
        <Bell className="size-5" />
        <AnimatePresence>
          {naoLidas > 0 ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="tnum absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white"
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </button>

      <Folha aberta={aberta} aoMudar={setAberta} titulo="Notificações" descricao={naoLidas > 0 ? `${naoLidas} sem ler` : "Tudo em dia por aqui"}>
        {notificacoes.length === 0 ? (
          <Vazio icone={Bell} titulo="Nada por enquanto" descricao="Contas vencendo, orçamento estourado e o que mais precisar da sua atenção aparece aqui." />
        ) : (
          <div className="space-y-2">
            {naoLidas > 0 ? (
              <div className="flex justify-end">
                <Botao variante="fantasma" tamanho="sm" onClick={() => lerTodas.mutate()} carregando={lerTodas.isPending}>
                  <CheckCheck className="size-4" /> Marcar todas como lidas
                </Botao>
              </div>
            ) : null}
            <ul className="space-y-2">
              {notificacoes.map((n) => {
                const Icone = ICONE[n.nivel] ?? Lightbulb;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => aoTocar(n)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors",
                        n.lida ? "border-border bg-surface" : "border-transparent bg-surface-2",
                      )}
                    >
                      <span className={cn("mt-0.5 shrink-0", COR[n.nivel] ?? "text-text-2")}>
                        <Icone className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm", n.lida ? "font-medium text-text-2" : "font-semibold")}>{n.titulo}</span>
                        {n.corpo ? <span className="mt-0.5 block text-xs text-text-2">{n.corpo}</span> : null}
                        <span className="mt-1 block text-[11px] capitalize text-muted">{dataRelativa(n.criado_em.slice(0, 10))}</span>
                      </span>
                      {!n.lida ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Folha>
    </>
  );
}
