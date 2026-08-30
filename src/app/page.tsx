import type { Metadata } from "next";
import { Navegacao } from "@/components/landing/navegacao";
import { Hero } from "@/components/landing/hero";
import { Problema, Recursos, ComoFunciona, Precos, Perguntas, ChamadaFinal, Rodape } from "@/components/landing/secoes";
import { GraficosDemo } from "@/components/landing/graficos-demo";
import { RedirecionarLogado } from "@/components/landing/redirecionar-logado";

export const metadata: Metadata = {
  title: "Finan — saiba o total antes do caixa",
  description:
    "Controle financeiro pessoal com Modo Mercado: monte o carrinho no corredor, veja o total crescer em tempo real e decida antes do caixa. 30 dias grátis, sem cartão.",
  openGraph: {
    title: "Finan — controle antes do caixa",
    description: "O único app de finanças que age antes do gasto, não depois. Modo Mercado offline, timeline semanal e gráficos que entregam resultado.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function PaginaLanding() {
  return (
    <div className="landing min-h-dvh">
      <RedirecionarLogado />
      <Navegacao />
      <main>
        <Hero />
        <Problema />
        <Recursos />
        <GraficosDemo />
        <ComoFunciona />
        <Precos />
        <Perguntas />
        <ChamadaFinal />
      </main>
      <Rodape />
    </div>
  );
}
