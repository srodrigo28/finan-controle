"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { CheckCircle2, Equal, TrendingDown, TrendingUp } from "lucide-react";
import { useSessao } from "@/hooks/use-sessoes";
import { Cabecalho } from "@/components/layout/cabecalho";
import { CampoMoeda } from "@/components/ui/campo";
import { Botao } from "@/components/ui/botao";
import { Valor } from "@/components/ui/valor";
import { Chip } from "@/components/ui/diversos";
import { moeda } from "@/lib/formatar";
import { cn, vibrar } from "@/lib/utils";

const MOTIVOS = ["Promoção / desconto", "Item esquecido", "Erro de digitação", "Preço diferente na gôndola", "Outro"];

export default function PaginaFechar({ params }: PageProps<"/mercado/[id]/fechar">) {
  const { id } = use(params);
  const roteador = useRouter();
  const { sessao, ativos, total, fechar } = useSessao(id);
  const [pago, setPago] = useState(0);
  const [tocouPago, setTocouPago] = useState(false);
  const [motivo, setMotivo] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  if (!sessao) return null;

  const valorPago = tocouPago ? pago : total;
  const diferenca = Math.round((valorPago - total) * 100) / 100;
  const divergiu = Math.abs(diferenca) >= 0.01;

  const confirmar = async () => {
    setSalvando(true);
    vibrar(30);
    await fechar({ total_pago: arredondar(valorPago), motivo_divergencia: divergiu ? motivo : null });
    setConcluido(true);
    setTimeout(() => {
      toast.success("Compra registrada como um lançamento");
      roteador.replace("/inicio");
    }, 1100);
  };

  return (
    <div className="px-4 pb-32">
      <Cabecalho titulo="Fechar compra" subtitulo={sessao.local ?? "Conferência com o caixa"} voltar />

      <AnimatePresence mode="wait">
        {concluido ? (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }} className="grid size-24 place-items-center rounded-full bg-accent text-accent-fg botao-brilho">
              <CheckCircle2 className="size-12" />
            </motion.span>
            <p className="text-2xl font-semibold">Compra fechada</p>
            <Valor valor={valorPago} tamanho="xl" />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <section className="cartao p-5">
              <p className="text-sm text-text-2">Seu carrinho ({ativos.length} {ativos.length === 1 ? "item" : "itens"})</p>
              <div className="mt-1"><Valor valor={total} tamanho="xl" /></div>
            </section>

            <section className="space-y-3">
              <CampoMoeda
                key="pago"
                rotulo="Quanto você pagou no caixa?"
                valor={valorPago}
                aoMudar={(v) => { setTocouPago(true); setPago(v); }}
                grande
                autoFocus
                dica="Confira no cupom. Se for igual, é só confirmar."
              />
              <AnimatePresence>
                {tocouPago ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl p-4",
                      !divergiu ? "bg-accent-soft text-accent" : diferenca > 0 ? "bg-warn-soft text-warn" : "bg-accent-soft text-accent",
                    )}
                  >
                    {!divergiu ? <Equal className="size-5" /> : diferenca > 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                    <p className="text-sm font-medium">
                      {!divergiu
                        ? "Bateu com o carrinho. Ótimo controle!"
                        : diferenca > 0
                          ? `Pagou ${moeda(diferenca)} a mais que o carrinho`
                          : `Pagou ${moeda(Math.abs(diferenca))} a menos que o carrinho`}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>

            <AnimatePresence>
              {divergiu ? (
                <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                  <p className="px-1 text-sm font-medium text-text-2">Por que divergiu?</p>
                  <div className="flex flex-wrap gap-2">
                    {MOTIVOS.map((m) => (
                      <Chip key={m} ativo={motivo === m} onClick={() => setMotivo(m)}>{m}</Chip>
                    ))}
                  </div>
                </motion.section>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {!concluido ? (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg px-4 pb-[calc(1rem+var(--safe-b))] pt-3 md:max-w-2xl" style={{ background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}>
          <Botao tamanho="lg" cheio onClick={confirmar} carregando={salvando} disabled={valorPago <= 0}>
            Confirmar {moeda(valorPago)}
          </Botao>
        </div>
      ) : null}
    </div>
  );
}

function arredondar(v: number) {
  return Math.round(v * 100) / 100;
}
