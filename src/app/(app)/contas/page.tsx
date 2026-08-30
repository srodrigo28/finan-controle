"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle, CalendarClock, Pencil, Trash2 } from "lucide-react";
import { addMonths, format, subMonths } from "date-fns";
import { useContas, useOcorrencias } from "@/hooks/use-contas";
import { useCategorias } from "@/hooks/use-categorias";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Botao } from "@/components/ui/botao";
import { Folha } from "@/components/ui/folha";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { Chip, Secao, Segmentado, Skeleton, Vazio } from "@/components/ui/diversos";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import { SeletorCategoria } from "@/components/seletor-categoria";
import { Valor } from "@/components/ui/valor";
import { FORMAS_PAGAMENTO, hojeISO, mesExtenso, moeda } from "@/lib/formatar";
import { cn } from "@/lib/utils";
import type { Categoria, ContaAgendada, OcorrenciaConta, Recorrencia } from "@/lib/tipos";

const RECORRENCIAS: { valor: Recorrencia; rotulo: string }[] = [
  { valor: "mensal", rotulo: "Mensal" },
  { valor: "semanal", rotulo: "Semanal" },
  { valor: "anual", rotulo: "Anual" },
  { valor: "unica", rotulo: "Única" },
];

export default function PaginaContas() {
  const [ref, setRef] = useState(new Date());
  const competencia = format(ref, "yyyy-MM");
  const { data, isPending } = useOcorrencias(competencia);
  const { contas, criar, atualizar, desativar, pagar, reabrir } = useContas();
  const { mapa } = useCategorias();
  const [editando, setEditando] = useState<ContaAgendada | null | "nova">(null);
  const [pagando, setPagando] = useState<OcorrenciaConta | null>(null);
  const [aba, setAba] = useState<"mes" | "cadastro">("mes");

  const ocorrencias = [...(data?.dados ?? [])].sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const pendentes = ocorrencias.filter((o) => o.status !== "paga");
  const pagas = ocorrencias.filter((o) => o.status === "paga");

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Contas"
        voltar="/mais"
        acoes={
          <Botao tamanho="icone" aria-label="Nova conta" onClick={() => setEditando("nova")}><Plus className="size-5" strokeWidth={2.4} /></Botao>
        }
      />

      <Segmentado opcoes={[{ valor: "mes", rotulo: "Este mês" }, { valor: "cadastro", rotulo: "Cadastradas" }]} valor={aba} aoMudar={setAba} />

      {aba === "mes" ? (
        <>
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Mês anterior" onClick={() => setRef(subMonths(ref, 1))} className="grid size-10 place-items-center rounded-full hover:bg-surface-2"><ChevronLeft className="size-5" /></button>
            <p className="font-semibold capitalize">{mesExtenso(competencia)}</p>
            <button type="button" aria-label="Próximo mês" onClick={() => setRef(addMonths(ref, 1))} className="grid size-10 place-items-center rounded-full hover:bg-surface-2"><ChevronRight className="size-5" /></button>
          </div>

          <section className="cartao p-5">
            <p className="text-sm text-text-2">Ainda tenho que pagar</p>
            {isPending && !data ? <Skeleton className="mt-2 h-10 w-40" /> : <div className="mt-1"><Valor valor={data?.total_pendente ?? 0} tamanho="xl" animado /></div>}
            <p className="mt-2 text-xs text-text-2">Já pago: <span className="tnum font-medium text-text">{moeda(data?.total_pago ?? 0)}</span></p>
          </section>

          {ocorrencias.length === 0 && !isPending ? (
            <div className="cartao">
              <Vazio icone={CalendarClock} titulo="Nenhuma conta neste mês" descricao="Cadastre energia, água, internet, aluguel… e receba lembrete antes do vencimento." acao={<Botao variante="secundario" tamanho="sm" onClick={() => setEditando("nova")}><Plus className="size-4" /> Cadastrar conta</Botao>} />
            </div>
          ) : null}

          {pendentes.length > 0 ? (
            <Secao titulo="Pendentes">
              <ul className="cartao divide-y divide-border">
                <AnimatePresence initial={false}>
                  {pendentes.map((o) => <LinhaOcorrencia key={o.id} o={o} categoria={o.conta.categoria_id ? mapa.get(o.conta.categoria_id) : null} aoPagar={() => setPagando(o)} />)}
                </AnimatePresence>
              </ul>
            </Secao>
          ) : null}
          {pagas.length > 0 ? (
            <Secao titulo="Pagas">
              <ul className="cartao divide-y divide-border">
                {pagas.map((o) => <LinhaOcorrencia key={o.id} o={o} categoria={o.conta.categoria_id ? mapa.get(o.conta.categoria_id) : null} aoReabrir={() => reabrir.mutate(o.id)} />)}
              </ul>
            </Secao>
          ) : null}
        </>
      ) : (
        <ul className="cartao divide-y divide-border">
          {contas.length === 0 ? <Vazio icone={CalendarClock} titulo="Nenhuma conta cadastrada" /> : null}
          {contas.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <IconeCategoria categoria={c.categoria_id ? mapa.get(c.categoria_id) : null} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.nome}</p>
                <p className="text-xs text-text-2">{RECORRENCIAS.find((r) => r.valor === c.recorrencia)?.rotulo} · dia {c.dia_vencimento} · {moeda(c.valor_estimado)}</p>
              </div>
              <button type="button" aria-label="Editar" onClick={() => setEditando(c)} className="grid size-10 place-items-center rounded-full text-text-2 hover:bg-surface-2"><Pencil className="size-4" /></button>
              <button type="button" aria-label="Desativar" onClick={async () => { if (confirm(`Desativar "${c.nome}"?`)) { await desativar.mutateAsync(c.id); toast.success("Conta desativada"); } }} className="grid size-10 place-items-center rounded-full text-text-2 hover:bg-surface-2"><Trash2 className="size-4 text-danger" /></button>
            </li>
          ))}
        </ul>
      )}

      <FolhaConta
        aberta={editando !== null}
        aoMudar={(a) => !a && setEditando(null)}
        conta={editando === "nova" ? null : editando}
        aoSalvar={async (d) => {
          if (editando && editando !== "nova") await atualizar.mutateAsync({ id: editando.id, ...d });
          else await criar.mutateAsync(d);
          toast.success("Conta salva");
          setEditando(null);
        }}
      />

      <FolhaPagar
        ocorrencia={pagando}
        aoMudar={(a) => !a && setPagando(null)}
        aoConfirmar={async (d) => {
          if (!pagando) return;
          await pagar.mutateAsync({ id: pagando.id, ...d });
          toast.success("Conta paga e lançada");
          setPagando(null);
        }}
      />
    </div>
  );
}

function LinhaOcorrencia({ o, categoria, aoPagar, aoReabrir }: { o: OcorrenciaConta; categoria?: Categoria | null; aoPagar?: () => void; aoReabrir?: () => void }) {
  const paga = o.status === "paga";
  const atrasada = o.status === "atrasada";
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 px-4 py-3">
      <button type="button" aria-label={paga ? "Reabrir" : "Marcar como paga"} onClick={paga ? aoReabrir : aoPagar} className={cn("grid size-10 shrink-0 place-items-center rounded-full", paga ? "text-accent" : atrasada ? "text-danger" : "text-muted")}>
        {paga ? <CheckCircle2 className="size-6" /> : atrasada ? <AlertCircle className="size-6" /> : <Circle className="size-6" />}
      </button>
      <IconeCategoria categoria={categoria} tamanho="sm" />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium", paga && "text-text-2 line-through")}>{o.conta.nome}</p>
        <p className={cn("text-xs", atrasada ? "font-medium text-danger" : "text-text-2")}>{atrasada ? "Atrasada · " : paga ? "Paga · " : ""}vence dia {o.vencimento.slice(8, 10)}</p>
      </div>
      <Valor valor={o.valor_real ?? o.conta.valor_estimado} tamanho="md" className={cn("font-medium", paga && "text-text-2")} />
    </motion.li>
  );
}

function FolhaConta({ aberta, aoMudar, conta, aoSalvar }: { aberta: boolean; aoMudar: (a: boolean) => void; conta: ContaAgendada | null; aoSalvar: (d: Partial<ContaAgendada>) => Promise<void> }) {
  return (
    <Folha aberta={aberta} aoMudar={aoMudar} titulo={conta ? "Editar conta" : "Nova conta"} descricao="Valor fixo ou estimado — você informa o real ao pagar.">
      {aberta ? <FormularioConta conta={conta} aoSalvar={aoSalvar} /> : null}
    </Folha>
  );
}

function FormularioConta({ conta, aoSalvar }: { conta: ContaAgendada | null; aoSalvar: (d: Partial<ContaAgendada>) => Promise<void> }) {
  const [nome, setNome] = useState(conta?.nome ?? "");
  const [valor, setValor] = useState(conta?.valor_estimado ?? 0);
  const [dia, setDia] = useState(conta?.dia_vencimento ?? 10);
  const [rec, setRec] = useState<Recorrencia>(conta?.recorrencia ?? "mensal");
  const [categoria, setCategoria] = useState<string | null>(conta?.categoria_id ?? null);
  const [lembrete, setLembrete] = useState(conta?.lembrete_dias ?? 3);
  const [salvando, setSalvando] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSalvando(true);
        try {
          await aoSalvar({ nome: nome.trim(), valor_estimado: valor, dia_vencimento: dia, recorrencia: rec, categoria_id: categoria, lembrete_dias: lembrete });
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
        <div className="flex flex-wrap gap-2">{RECORRENCIAS.map((r) => <Chip key={r.valor} ativo={rec === r.valor} onClick={() => setRec(r.valor)}>{r.rotulo}</Chip>)}</div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-text-2">Categoria</p>
        <SeletorCategoria valor={categoria} aoMudar={setCategoria} priorizarPaiNome="Contas fixas" permitirNenhuma />
      </div>
      <Botao type="submit" tamanho="lg" cheio carregando={salvando} disabled={!nome.trim() || valor <= 0}>Salvar</Botao>
    </form>
  );
}

function FolhaPagar({ ocorrencia, aoMudar, aoConfirmar }: { ocorrencia: OcorrenciaConta | null; aoMudar: (a: boolean) => void; aoConfirmar: (d: { valor_real: number; data: string; forma_pagamento?: string }) => Promise<void> }) {
  return (
    <Folha aberta={!!ocorrencia} aoMudar={aoMudar} titulo={`Pagar ${ocorrencia?.conta.nome ?? ""}`} descricao="Vira um lançamento do dia. Ajuste se o valor real for diferente.">
      {ocorrencia ? <FormularioPagar ocorrencia={ocorrencia} aoConfirmar={aoConfirmar} /> : null}
    </Folha>
  );
}

function FormularioPagar({ ocorrencia, aoConfirmar }: { ocorrencia: OcorrenciaConta; aoConfirmar: (d: { valor_real: number; data: string; forma_pagamento?: string }) => Promise<void> }) {
  const [valor, setValor] = useState(ocorrencia.valor_real ?? ocorrencia.conta.valor_estimado);
  const [data, setData] = useState(hojeISO());
  const [forma, setForma] = useState<string | undefined>();
  const [salvando, setSalvando] = useState(false);
  return (
    <div className="space-y-4">
      <CampoMoeda rotulo="Valor pago" valor={valor} aoMudar={setValor} grande autoFocus />
      <Campo rotulo="Data do pagamento" type="date" value={data} onChange={(e) => setData(e.target.value)} />
      <div className="flex flex-wrap gap-2">{FORMAS_PAGAMENTO.map((f) => <Chip key={f.valor} ativo={forma === f.valor} onClick={() => setForma(forma === f.valor ? undefined : f.valor)}>{f.rotulo}</Chip>)}</div>
      <Botao
        tamanho="lg"
        cheio
        carregando={salvando}
        disabled={valor <= 0}
        onClick={async () => {
          setSalvando(true);
          try {
            await aoConfirmar({ valor_real: valor, data, forma_pagamento: forma });
          } finally {
            setSalvando(false);
          }
        }}
      >
        Confirmar pagamento
      </Botao>
    </div>
  );
}
