"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { useMutacoesLancamento } from "@/hooks/use-lancamentos";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { Botao } from "@/components/ui/botao";
import { Chip, Segmentado } from "@/components/ui/diversos";
import { SeletorCategoria } from "@/components/seletor-categoria";
import { FORMAS_PAGAMENTO, hojeISO } from "@/lib/formatar";
import type { FormaPagamento, Lancamento, TipoLancamento } from "@/lib/tipos";

/** Lançamento manual em menos de 10 segundos: valor primeiro, categoria em um toque. */
export function FormularioLancamento({ inicial }: { inicial?: Lancamento }) {
  const roteador = useRouter();
  const { criar, atualizar } = useMutacoesLancamento();
  const [tipo, setTipo] = useState<TipoLancamento>(inicial?.tipo ?? "despesa");
  const [valor, setValor] = useState(inicial?.valor ?? 0);
  const [categoria, setCategoria] = useState<string | null>(inicial?.categoria_id ?? null);
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [data, setData] = useState(inicial?.data ?? hojeISO());
  const [forma, setForma] = useState<FormaPagamento | null>(inicial?.forma_pagamento ?? null);

  const valido = valor > 0;
  const salvando = criar.isPending || atualizar.isPending;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    const corpo = { tipo, valor, categoria_id: categoria, descricao: descricao.trim(), data, forma_pagamento: forma };
    try {
      if (inicial) {
        await atualizar.mutateAsync({ id: inicial.id, ...corpo });
        toast.success("Lançamento atualizado");
        roteador.back();
      } else {
        const l = await criar.mutateAsync(corpo);
        toast.success(tipo === "despesa" ? "Despesa registrada" : "Receita registrada");
        roteador.replace(`/lancamentos/${l.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar");
    }
  };

  return (
    <form onSubmit={enviar} className="space-y-6 pb-28">
      <Segmentado
        opcoes={[
          { valor: "despesa", rotulo: "Despesa" },
          { valor: "receita", rotulo: "Receita" },
        ]}
        valor={tipo}
        aoMudar={setTipo}
      />
      <CampoMoeda rotulo="Valor" valor={valor} aoMudar={setValor} grande autoFocus={!inicial} />
      <div>
        <p className="mb-2 text-sm font-medium text-text-2">Categoria</p>
        <SeletorCategoria valor={categoria} aoMudar={setCategoria} permitirNenhuma />
      </div>
      <Campo rotulo="Descrição" placeholder={tipo === "despesa" ? "Ex.: farmácia, uber…" : "Ex.: salário, reembolso…"} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} prefixo={<Calendar className="size-4" />} max="2100-12-31" />
      <div>
        <p className="mb-2 text-sm font-medium text-text-2">Forma de pagamento</p>
        <div className="flex flex-wrap gap-2">
          {FORMAS_PAGAMENTO.map((f) => (
            <Chip key={f.valor} ativo={forma === f.valor} onClick={() => setForma(forma === f.valor ? null : (f.valor as FormaPagamento))}>
              {f.rotulo}
            </Chip>
          ))}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg px-4 pb-[calc(1rem+var(--safe-b))] pt-3 md:max-w-3xl md:px-8" style={{ background: "linear-gradient(to top, var(--bg) 60%, transparent)" }}>
        <Botao type="submit" tamanho="lg" cheio disabled={!valido} carregando={salvando}>
          {inicial ? "Salvar alterações" : tipo === "despesa" ? "Registrar despesa" : "Registrar receita"}
        </Botao>
      </div>
    </form>
  );
}
