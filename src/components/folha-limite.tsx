"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useLimite } from "@/stores/limite";
import { Folha } from "@/components/ui/folha";
import { Botao } from "@/components/ui/botao";

/**
 * Aparece quando a API recusa uma criação com 402 (teste vencido). Fica montada no layout da área
 * logada — qualquer tela que tentar criar algo cai aqui, sem cada tela precisar tratar o erro.
 */
export function FolhaLimite() {
  const roteador = useRouter();
  const mensagem = useLimite((s) => s.mensagem);
  const fechar = useLimite((s) => s.fechar);

  return (
    <Folha aberta={mensagem !== null} aoMudar={(a) => !a && fechar()} titulo="Seu teste grátis terminou">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-accent-soft p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-accent" />
          <p className="text-sm text-text-2">{mensagem}</p>
        </div>
        <ul className="space-y-1.5 text-sm text-text-2">
          <li>· Todo o histórico continua no app, do jeito que está</li>
          <li>· Você pode editar, excluir e exportar quando quiser</li>
          <li>· Só o registro de coisas novas fica pausado</li>
        </ul>
        <Botao
          tamanho="lg"
          cheio
          onClick={() => {
            fechar();
            roteador.push("/plano");
          }}
        >
          Ver o Finan Completo
        </Botao>
        <Botao tamanho="lg" cheio variante="fantasma" onClick={fechar}>
          Agora não
        </Botao>
      </div>
    </Folha>
  );
}
