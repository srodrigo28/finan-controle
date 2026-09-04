"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle, CalendarClock, Pencil, Trash2, MoreVertical, Archive, ArchiveRestore, MinusCircle } from "lucide-react";
import { addMonths, format, subMonths } from "date-fns";
import { useContas, useOcorrencias } from "@/hooks/use-contas";
import { useCategorias } from "@/hooks/use-categorias";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Botao } from "@/components/ui/botao";
import { Folha } from "@/components/ui/folha";
import { Confirmar } from "@/components/ui/confirmar";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { FolhaConta, resumoRecorrencia } from "@/components/contas/formulario-conta";
import { Chip, Secao, Segmentado, Skeleton, Vazio } from "@/components/ui/diversos";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import { Valor } from "@/components/ui/valor";
import { FORMAS_PAGAMENTO, hojeISO, mesExtenso, moeda } from "@/lib/formatar";
import { cn } from "@/lib/utils";
import type { Categoria, ContaAgendada, OcorrenciaConta } from "@/lib/tipos";


export default function PaginaContas() {
  const [ref, setRef] = useState(new Date());
  const competencia = format(ref, "yyyy-MM");
  const { data, isPending } = useOcorrencias(competencia);
  const { contas, criar, atualizar, arquivar, reativar, excluir, pagar, reabrir, ajustarOcorrencia, excluirOcorrencia } = useContas({ incluirInativas: true });
  const { mapa } = useCategorias();
  const [editando, setEditando] = useState<ContaAgendada | null | "nova">(null);
  const [pagando, setPagando] = useState<OcorrenciaConta | null>(null);
  const [ajustando, setAjustando] = useState<OcorrenciaConta | null>(null);
  const [aba, setAba] = useState<"mes" | "cadastro">("mes");
  const [filtro, setFiltro] = useState<"ativas" | "arquivadas">("ativas");
  const [acoes, setAcoes] = useState<ContaAgendada | null>(null);
  const [confirmando, setConfirmando] = useState<{ conta: ContaAgendada; tipo: "arquivar" | "excluir" } | null>(null);

  const ocorrencias = [...(data?.dados ?? [])].sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const pendentes = ocorrencias.filter((o) => o.status !== "paga");
  const pagas = ocorrencias.filter((o) => o.status === "paga");
  const visiveis = contas.filter((c) => (filtro === "ativas" ? c.ativa : !c.ativa));

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
                  {pendentes.map((o) => (
                    <LinhaOcorrencia
                      key={o.id}
                      o={o}
                      categoria={o.conta.categoria_id ? mapa.get(o.conta.categoria_id) : null}
                      aoPagar={() => setPagando(o)}
                      aoAbrirAcoes={() => setAjustando(o)}
                      aoDespular={() => ajustarOcorrencia.mutate({ id: o.id, status: "pendente" })}
                    />
                  ))}
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
        <>
          <Segmentado
            opcoes={[{ valor: "ativas", rotulo: "Ativas" }, { valor: "arquivadas", rotulo: "Arquivadas" }]}
            valor={filtro}
            aoMudar={setFiltro}
          />
          <ul className="cartao divide-y divide-border">
            {visiveis.length === 0 ? (
              <Vazio
                icone={CalendarClock}
                titulo={filtro === "ativas" ? "Nenhuma conta cadastrada" : "Nenhuma conta arquivada"}
                descricao={filtro === "ativas" ? undefined : "Conta arquivada some do mês e dos lembretes, mas guarda o histórico."}
              />
            ) : null}
            {visiveis.map((c) => (
              <li key={c.id} className="flex items-center gap-1 pr-2">
                <Link href={`/contas/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-l-xl px-4 py-3 hover:bg-surface-2">
                  <IconeCategoria categoria={c.categoria_id ? mapa.get(c.categoria_id) : null} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate font-medium", !c.ativa && "text-text-2")}>{c.nome}</p>
                    <p className="text-xs text-text-2">{resumoRecorrencia(c)} · {moeda(c.valor_estimado)}</p>
                  </div>
                </Link>
                <button type="button" aria-label={`Ações de ${c.nome}`} onClick={() => setAcoes(c)} className="grid size-10 shrink-0 place-items-center rounded-full text-text-2 hover:bg-surface-2"><MoreVertical className="size-5" /></button>
              </li>
            ))}
          </ul>
        </>
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

      <Folha aberta={acoes !== null} aoMudar={(a) => !a && setAcoes(null)} titulo={acoes?.nome ?? ""} descricao={acoes ? resumoRecorrencia(acoes) : undefined}>
        {acoes ? (
          <div className="space-y-2">
            <Botao tamanho="lg" cheio variante="secundario" onClick={() => { setEditando(acoes); setAcoes(null); }}>
              <Pencil className="size-4" /> Editar
            </Botao>
            {acoes.ativa ? (
              <Botao tamanho="lg" cheio variante="secundario" onClick={() => { setConfirmando({ conta: acoes, tipo: "arquivar" }); setAcoes(null); }}>
                <Archive className="size-4" /> Arquivar
              </Botao>
            ) : (
              <Botao
                tamanho="lg"
                cheio
                variante="secundario"
                carregando={reativar.isPending}
                onClick={async () => {
                  const c = acoes;
                  setAcoes(null);
                  await reativar.mutateAsync(c.id);
                  toast.success(`"${c.nome}" voltou para as ativas`);
                  setFiltro("ativas");
                }}
              >
                <ArchiveRestore className="size-4" /> Reativar
              </Botao>
            )}
            <Botao tamanho="lg" cheio variante="perigo" onClick={() => { setConfirmando({ conta: acoes, tipo: "excluir" }); setAcoes(null); }}>
              <Trash2 className="size-4" /> Excluir
            </Botao>
          </div>
        ) : null}
      </Folha>

      <Confirmar
        aberta={confirmando?.tipo === "arquivar"}
        aoMudar={(a) => !a && setConfirmando(null)}
        titulo={`Arquivar "${confirmando?.conta.nome ?? ""}"?`}
        descricao="Ela sai deste mês e para de mandar lembrete. O histórico fica guardado e você pode reativar quando quiser."
        rotuloConfirmar="Arquivar"
        aoConfirmar={async () => {
          if (!confirmando) return;
          await arquivar.mutateAsync(confirmando.conta.id);
          toast.success("Conta arquivada");
        }}
      />

      <Confirmar
        aberta={confirmando?.tipo === "excluir"}
        aoMudar={(a) => !a && setConfirmando(null)}
        titulo={`Excluir "${confirmando?.conta.nome ?? ""}"?`}
        descricao="Some de vez, com todas as ocorrências. Os lançamentos que você já pagou continuam nos seus meses. Não dá para desfazer."
        rotuloConfirmar="Excluir de vez"
        perigo
        alternativa={
          confirmando?.conta.ativa
            ? {
                rotulo: "Só arquivar",
                aoEscolher: async () => {
                  if (!confirmando) return;
                  await arquivar.mutateAsync(confirmando.conta.id);
                  toast.success("Conta arquivada");
                },
              }
            : undefined
        }
        aoConfirmar={async () => {
          if (!confirmando) return;
          await excluir.mutateAsync(confirmando.conta.id);
          toast.success("Conta excluída");
        }}
      />

      <FolhaOcorrencia
        ocorrencia={ajustando}
        aoMudar={(a) => !a && setAjustando(null)}
        aoAjustar={async (d) => {
          if (!ajustando) return;
          await ajustarOcorrencia.mutateAsync({ id: ajustando.id, ...d });
          toast.success(d.status === "pulada" ? "Mês pulado" : d.status === "pendente" ? "Mês de volta na lista" : "Ajuste salvo");
          setAjustando(null);
        }}
        aoExcluir={async () => {
          if (!ajustando) return;
          await excluirOcorrencia.mutateAsync(ajustando.id);
          toast.success("Vencimento removido");
          setAjustando(null);
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

function LinhaOcorrencia({ o, categoria, aoPagar, aoReabrir, aoAbrirAcoes, aoDespular }: { o: OcorrenciaConta; categoria?: Categoria | null; aoPagar?: () => void; aoReabrir?: () => void; aoAbrirAcoes?: () => void; aoDespular?: () => void }) {
  const paga = o.status === "paga";
  const pulada = o.status === "pulada";
  const atrasada = o.status === "atrasada";
  const rotuloStatus = atrasada ? "Atrasada · " : paga ? "Paga · " : pulada ? "Pulada · " : "";
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className={cn("flex items-center gap-3 px-4 py-3", pulada && "opacity-60")}>
      <button
        type="button"
        aria-label={paga ? "Reabrir" : pulada ? "Não pular mais" : "Marcar como paga"}
        onClick={paga ? aoReabrir : pulada ? aoDespular : aoPagar}
        className={cn("grid size-10 shrink-0 place-items-center rounded-full", paga ? "text-accent" : atrasada ? "text-danger" : "text-muted")}
      >
        {paga ? <CheckCircle2 className="size-6" /> : pulada ? <MinusCircle className="size-6" /> : atrasada ? <AlertCircle className="size-6" /> : <Circle className="size-6" />}
      </button>
      <IconeCategoria categoria={categoria} tamanho="sm" />
      <button type="button" onClick={aoAbrirAcoes} disabled={!aoAbrirAcoes} className="min-w-0 flex-1 text-left disabled:cursor-default">
        <p className={cn("truncate font-medium", (paga || pulada) && "text-text-2", paga && "line-through")}>{o.conta.nome}</p>
        <p className={cn("text-xs", atrasada ? "font-medium text-danger" : "text-text-2")}>{rotuloStatus}vence dia {o.vencimento.slice(8, 10)}</p>
      </button>
      <Valor valor={o.valor_real ?? o.conta.valor_estimado} tamanho="md" className={cn("font-medium", (paga || pulada) && "text-text-2")} />
    </motion.li>
  );
}

/** Ajustes que valem só para este mês — o resto da recorrência continua como está. */
function FolhaOcorrencia({
  ocorrencia,
  aoMudar,
  aoAjustar,
  aoExcluir,
}: {
  ocorrencia: OcorrenciaConta | null;
  aoMudar: (a: boolean) => void;
  aoAjustar: (d: { valor_real?: number | null; vencimento?: string; status?: "pendente" | "pulada" }) => Promise<void>;
  aoExcluir: () => Promise<void>;
}) {
  return (
    <Folha
      aberta={!!ocorrencia}
      aoMudar={aoMudar}
      titulo={ocorrencia?.conta.nome ?? ""}
      descricao={ocorrencia ? `${mesExtenso(ocorrencia.competencia)} · vence dia ${ocorrencia.vencimento.slice(8, 10)}` : undefined}
    >
      {ocorrencia ? <FormularioOcorrencia ocorrencia={ocorrencia} aoAjustar={aoAjustar} aoExcluir={aoExcluir} /> : null}
    </Folha>
  );
}

function FormularioOcorrencia({
  ocorrencia,
  aoAjustar,
  aoExcluir,
}: {
  ocorrencia: OcorrenciaConta;
  aoAjustar: (d: { valor_real?: number | null; vencimento?: string; status?: "pendente" | "pulada" }) => Promise<void>;
  aoExcluir: () => Promise<void>;
}) {
  const [valor, setValor] = useState(ocorrencia.valor_real ?? ocorrencia.conta.valor_estimado);
  const [vencimento, setVencimento] = useState(ocorrencia.vencimento);
  const [salvando, setSalvando] = useState<string | null>(null);
  const pulada = ocorrencia.status === "pulada";
  const mudou = valor !== (ocorrencia.valor_real ?? ocorrencia.conta.valor_estimado) || vencimento !== ocorrencia.vencimento;

  const executar = async (chave: string, acao: () => Promise<void>) => {
    setSalvando(chave);
    try {
      await acao();
    } finally {
      setSalvando(null);
    }
  };

  return (
    <div className="space-y-4">
      <CampoMoeda rotulo="Valor deste mês" valor={valor} aoMudar={setValor} dica="Só muda este mês; a conta continua com o valor estimado." />
      <Campo rotulo="Vencimento deste mês" type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} max="2100-12-31" />
      <Botao
        tamanho="lg"
        cheio
        disabled={!mudou || valor <= 0 || salvando !== null}
        carregando={salvando === "salvar"}
        onClick={() => executar("salvar", () => aoAjustar({ valor_real: valor, vencimento }))}
      >
        Salvar ajuste
      </Botao>
      <div className="space-y-2 border-t border-border pt-4">
        <Botao
          tamanho="lg"
          cheio
          variante="secundario"
          disabled={salvando !== null}
          carregando={salvando === "pular"}
          onClick={() => executar("pular", () => aoAjustar({ status: pulada ? "pendente" : "pulada" }))}
        >
          <MinusCircle className="size-4" /> {pulada ? "Não pular mais este mês" : "Pular este mês"}
        </Botao>
        <Botao tamanho="lg" cheio variante="fantasma" disabled={salvando !== null} carregando={salvando === "excluir"} onClick={() => executar("excluir", aoExcluir)}>
          <Trash2 className="size-4" /> Remover este vencimento
        </Botao>
        <p className="px-1 text-xs text-muted">
          Pular deixa registrado que este mês não tem conta. Remover apaga o vencimento, mas ele volta se a conta ainda cair neste mês.
        </p>
      </div>
    </div>
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
