"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowRight, ShoppingCart, Wallet, Tags } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { useCategorias } from "@/hooks/use-categorias";
import { api } from "@/lib/api";
import { Botao } from "@/components/ui/botao";
import { CampoMoeda } from "@/components/ui/campo";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import type { Usuario } from "@/lib/tipos";

const PASSOS = ["orcamento", "categorias", "pronto"] as const;

export default function PaginaOnboarding() {
  const roteador = useRouter();
  const { usuario, atualizarUsuario } = useAuth();
  const { raizes } = useCategorias();
  const [passo, setPasso] = useState<(typeof PASSOS)[number]>("orcamento");
  const [mensal, setMensal] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const avancar = async () => {
    if (passo === "orcamento") {
      if (mensal > 0) {
        setSalvando(true);
        try {
          const u = await api<Usuario>("/auth/eu", { method: "PATCH", body: { orcamento_mensal: mensal, orcamento_diario: Math.round((mensal / 30) * 100) / 100 } });
          atualizarUsuario(u);
        } catch {
          toast.error("Não foi possível salvar o orçamento agora");
        } finally {
          setSalvando(false);
        }
      }
      setPasso("categorias");
    } else if (passo === "categorias") setPasso("pronto");
    else roteador.replace("/mercado?abrir=1");
  };

  const idx = PASSOS.indexOf(passo);

  return (
    <div className="flex min-h-dvh flex-col pt-[calc(1.5rem+var(--safe-t))]">
      <div className="mb-8 flex gap-1.5">
        {PASSOS.map((p, i) => <span key={p} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-accent" : "bg-surface-3"}`} />)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={passo} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="flex flex-1 flex-col">
          {passo === "orcamento" ? (
            <>
              <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent"><Wallet className="size-7" /></span>
              <h1 className="mt-6 text-[30px] font-semibold leading-tight tracking-tight">Oi, {usuario?.nome.split(" ")[0]}. Quanto quer gastar por mês?</h1>
              <p className="mt-2 text-text-2">Um número aproximado já ajuda. Dividimos por 30 para mostrar quanto cabe por dia. Dá para mudar depois.</p>
              <div className="mt-8"><CampoMoeda valor={mensal} aoMudar={setMensal} grande autoFocus rotulo="Orçamento mensal" /></div>
            </>
          ) : passo === "categorias" ? (
            <>
              <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent"><Tags className="size-7" /></span>
              <h1 className="mt-6 text-[30px] font-semibold leading-tight tracking-tight">Suas categorias iniciais</h1>
              <p className="mt-2 text-text-2">Criamos um ponto de partida. Renomeie, troque cores ou arquive quando quiser — nada é imposto.</p>
              <ul className="mt-6 grid grid-cols-2 gap-2">
                {raizes.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2.5">
                    <IconeCategoria categoria={c} tamanho="sm" />
                    <span className="truncate text-sm font-medium">{c.nome}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-fg botao-brilho"><ShoppingCart className="size-7" strokeWidth={2.4} /></span>
              <h1 className="mt-6 text-[30px] font-semibold leading-tight tracking-tight">Na próxima ida ao mercado, abra o carrinho</h1>
              <p className="mt-2 text-text-2">Vá adicionando os itens enquanto anda pelos corredores. O total cresce na tela — e você decide o que cortar antes do caixa, sem fila atrás.</p>
              <ul className="mt-6 space-y-2 text-sm text-text-2">
                <li>• Funciona sem internet</li>
                <li>• Compara com o preço da última compra</li>
                <li>• Avisa quando passar do orçamento</li>
              </ul>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 space-y-3 pb-6">
        <Botao tamanho="lg" cheio onClick={avancar} carregando={salvando}>
          {passo === "pronto" ? "Abrir Modo Mercado" : "Continuar"} <ArrowRight className="size-5" />
        </Botao>
        {passo !== "pronto" ? <button type="button" onClick={() => roteador.replace("/inicio")} className="w-full py-2 text-sm text-text-2">Pular por agora</button> : null}
      </div>
    </div>
  );
}
