"use client";

import { useState } from "react";
import { Folha } from "@/components/ui/folha";
import { Botao } from "@/components/ui/botao";

type Props = {
  aberta: boolean;
  aoMudar: (aberta: boolean) => void;
  titulo: string;
  descricao?: string;
  rotuloConfirmar?: string;
  rotuloCancelar?: string;
  /** Ação destrutiva: botão em vermelho. */
  perigo?: boolean;
  aoConfirmar: () => void | Promise<void>;
  /** Segunda saída, menos drástica (ex.: "Arquivar" na folha de exclusão). */
  alternativa?: { rotulo: string; aoEscolher: () => void | Promise<void> };
};

/** Confirmação em folha inferior — na zona do polegar, no lugar do `confirm()` do browser. */
export function Confirmar({
  aberta,
  aoMudar,
  titulo,
  descricao,
  rotuloConfirmar = "Confirmar",
  rotuloCancelar = "Cancelar",
  perigo,
  aoConfirmar,
  alternativa,
}: Props) {
  const [ocupado, setOcupado] = useState<"principal" | "alternativa" | null>(null);

  const executar = async (qual: "principal" | "alternativa", acao: () => void | Promise<void>) => {
    setOcupado(qual);
    try {
      await acao();
      aoMudar(false);
    } finally {
      setOcupado(null);
    }
  };

  return (
    <Folha aberta={aberta} aoMudar={aoMudar} titulo={titulo} descricao={descricao}>
      <div className="space-y-2">
        <Botao
          tamanho="lg"
          cheio
          variante={perigo ? "perigo" : "primario"}
          carregando={ocupado === "principal"}
          disabled={ocupado !== null}
          onClick={() => executar("principal", aoConfirmar)}
        >
          {rotuloConfirmar}
        </Botao>
        {alternativa ? (
          <Botao
            tamanho="lg"
            cheio
            variante="secundario"
            carregando={ocupado === "alternativa"}
            disabled={ocupado !== null}
            onClick={() => executar("alternativa", alternativa.aoEscolher)}
          >
            {alternativa.rotulo}
          </Botao>
        ) : null}
        <Botao tamanho="lg" cheio variante="fantasma" disabled={ocupado !== null} onClick={() => aoMudar(false)}>
          {rotuloCancelar}
        </Botao>
      </div>
    </Folha>
  );
}
