"use client";

import { useState } from "react";
import { Botao } from "@/components/ui/botao";
import { Folha } from "@/components/ui/folha";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { Chip } from "@/components/ui/diversos";
import { SeletorCategoria } from "@/components/seletor-categoria";
import { MESES } from "@/lib/formatar";
import type { ContaAgendada, Recorrencia } from "@/lib/tipos";

export const RECORRENCIAS: { valor: Recorrencia; rotulo: string }[] = [
  { valor: "mensal", rotulo: "Mensal" },
  { valor: "semanal", rotulo: "Semanal" },
  { valor: "anual", rotulo: "Anual" },
  { valor: "unica", rotulo: "Única" },
];

/** "Mensal · dia 10", "Anual · 10 de mar", "Semanal · segunda" — o que a linha da lista precisa dizer. */
export function resumoRecorrencia(c: ContaAgendada) {
  const rotulo = RECORRENCIAS.find((r) => r.valor === c.recorrencia)?.rotulo ?? c.recorrencia;
  if (c.recorrencia === "semanal") {
    const dias = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];
    return `${rotulo} · ${dias[Math.min(Math.max(c.dia_vencimento, 1), 7) - 1]}`;
  }
  if (c.recorrencia === "anual" || c.recorrencia === "unica") {
    const mes = MESES.find((m) => m.valor === c.mes_referencia)?.rotulo;
    if (!mes) return `${rotulo} · sem mês definido`;
    return `${rotulo} · ${c.dia_vencimento} de ${mes}${c.recorrencia === "unica" && c.ano_referencia ? `/${c.ano_referencia}` : ""}`;
  }
  return `${rotulo} · dia ${c.dia_vencimento}`;
}

export function FolhaConta({ aberta, aoMudar, conta, aoSalvar }: { aberta: boolean; aoMudar: (a: boolean) => void; conta: ContaAgendada | null; aoSalvar: (d: Partial<ContaAgendada>) => Promise<void> }) {
  return (
    <Folha aberta={aberta} aoMudar={aoMudar} titulo={conta ? "Editar conta" : "Nova conta"} descricao="Valor fixo ou estimado — você informa o real ao pagar.">
      {aberta ? <FormularioConta conta={conta} aoSalvar={aoSalvar} /> : null}
    </Folha>
  );
}

function FormularioConta({ conta, aoSalvar }: { conta: ContaAgendada | null; aoSalvar: (d: Partial<ContaAgendada>) => Promise<void> }) {
  const anoAtual = new Date().getFullYear();
  const [nome, setNome] = useState(conta?.nome ?? "");
  const [valor, setValor] = useState(conta?.valor_estimado ?? 0);
  const [dia, setDia] = useState(conta?.dia_vencimento ?? 10);
  const [rec, setRec] = useState<Recorrencia>(conta?.recorrencia ?? "mensal");
  const [categoria, setCategoria] = useState<string | null>(conta?.categoria_id ?? null);
  const [lembrete, setLembrete] = useState(conta?.lembrete_dias ?? 3);
  const [mesRef, setMesRef] = useState<number | null>(conta?.mes_referencia ?? null);
  const [anoRef, setAnoRef] = useState<number>(conta?.ano_referencia ?? anoAtual);
  const [salvando, setSalvando] = useState(false);

  // Anual e única só geram vencimento se souberem o mês — sem ele a conta ficaria muda.
  const precisaMes = rec === "anual" || rec === "unica";
  const valido = !!nome.trim() && valor > 0 && (!precisaMes || mesRef !== null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valido) return;
        setSalvando(true);
        try {
          await aoSalvar({
            nome: nome.trim(),
            valor_estimado: valor,
            dia_vencimento: dia,
            recorrencia: rec,
            categoria_id: categoria,
            lembrete_dias: lembrete,
            mes_referencia: precisaMes ? mesRef : null,
            ano_referencia: rec === "unica" ? anoRef : null,
          });
        } finally {
          setSalvando(false);
        }
      }}
    >
      <Campo rotulo="Nome" placeholder="Ex.: Energia, Internet, Aluguel" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
      <CampoMoeda rotulo="Valor estimado" valor={valor} aoMudar={setValor} />
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo={rec === "semanal" ? "Dia da semana (1=seg)" : "Dia do vencimento"} type="number" min={1} max={rec === "semanal" ? 7 : 31} value={dia} onChange={(e) => setDia(Number(e.target.value))} inputMode="numeric" />
        <Campo rotulo="Lembrar (dias antes)" type="number" min={0} max={30} value={lembrete} onChange={(e) => setLembrete(Number(e.target.value))} inputMode="numeric" />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-text-2">Recorrência</p>
        <div className="flex flex-wrap gap-2">
          {RECORRENCIAS.map((r) => (
            <Chip
              key={r.valor}
              ativo={rec === r.valor}
              onClick={() => {
                setRec(r.valor);
                // Ao virar anual/única sem mês escolhido, sugere o mês corrente.
                if ((r.valor === "anual" || r.valor === "unica") && mesRef === null) setMesRef(new Date().getMonth() + 1);
              }}
            >
              {r.rotulo}
            </Chip>
          ))}
        </div>
      </div>
      {precisaMes ? (
        <div>
          <p className="mb-2 text-sm font-medium text-text-2">{rec === "anual" ? "Mês do vencimento" : "Mês e ano do vencimento"}</p>
          <div className="flex flex-wrap gap-2">
            {MESES.map((m) => (
              <Chip key={m.valor} ativo={mesRef === m.valor} onClick={() => setMesRef(m.valor)} className="capitalize">{m.rotulo}</Chip>
            ))}
          </div>
          {rec === "unica" ? (
            <div className="mt-3">
              <Campo rotulo="Ano" type="number" min={anoAtual - 1} max={2100} value={anoRef} onChange={(e) => setAnoRef(Number(e.target.value))} inputMode="numeric" />
            </div>
          ) : null}
        </div>
      ) : null}
      <div>
        <p className="mb-2 text-sm font-medium text-text-2">Categoria</p>
        <SeletorCategoria valor={categoria} aoMudar={setCategoria} priorizarPaiNome="Contas fixas" permitirNenhuma />
      </div>
      <Botao type="submit" tamanho="lg" cheio carregando={salvando} disabled={!valido}>Salvar</Botao>
    </form>
  );
}
