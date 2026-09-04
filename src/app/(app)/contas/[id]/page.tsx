"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Archive, ArchiveRestore, CalendarClock, CheckCircle2, Circle, MinusCircle, Pencil, Trash2 } from "lucide-react";
import { useConta, useContas, useHistoricoConta } from "@/hooks/use-contas";
import { useCategorias } from "@/hooks/use-categorias";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Botao } from "@/components/ui/botao";
import { Confirmar } from "@/components/ui/confirmar";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import { Skeleton, Vazio } from "@/components/ui/diversos";
import { Valor } from "@/components/ui/valor";
import { FolhaConta, resumoRecorrencia } from "@/components/contas/formulario-conta";
import { dataLonga, mesExtenso, moeda } from "@/lib/formatar";
import { cn } from "@/lib/utils";

export default function PaginaDetalheConta({ params }: PageProps<"/contas/[id]">) {
  const { id } = use(params);
  const roteador = useRouter();
  const { data: conta, isPending } = useConta(id);
  const { data: historico } = useHistoricoConta(id);
  const { mapa } = useCategorias();
  const { atualizar, arquivar, reativar, excluir } = useContas({ incluirInativas: true });
  const [editando, setEditando] = useState(false);
  const [confirmando, setConfirmando] = useState<"arquivar" | "excluir" | null>(null);

  if (isPending || !conta) {
    return (
      <div className="space-y-5">
        <Cabecalho titulo="Conta" voltar="/contas" />
        <div className="cartao space-y-3 p-5"><Skeleton className="h-10 w-40" /><Skeleton className="h-4 w-60" /></div>
      </div>
    );
  }

  const categoria = conta.categoria_id ? mapa.get(conta.categoria_id) : null;
  const resumo = conta.resumo;
  const ocorrencias = historico?.dados ?? [];

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo={conta.nome}
        voltar="/contas"
        acoes={
          <Botao variante="fantasma" tamanho="icone" aria-label="Editar" onClick={() => setEditando(true)}><Pencil className="size-5" /></Botao>
        }
      />

      <section className="cartao p-5">
        <div className="flex items-start gap-4">
          <IconeCategoria categoria={categoria} tamanho="lg" />
          <div className="min-w-0 flex-1">
            <Valor valor={conta.valor_estimado} tamanho="xl" sinal="nunca" />
            <p className="mt-1 text-sm text-text-2">{resumoRecorrencia(conta)}</p>
            {!conta.ativa ? (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-2">
                <Archive className="size-3.5" /> Arquivada
              </span>
            ) : null}
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Categoria</dt><dd className="mt-0.5 font-medium">{categoria?.nome ?? "Sem categoria"}</dd></div>
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Lembrete</dt><dd className="mt-0.5 font-medium">{conta.lembrete_dias === 0 ? "Sem lembrete" : `${conta.lembrete_dias} dia${conta.lembrete_dias > 1 ? "s" : ""} antes`}</dd></div>
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Já pago</dt><dd className="tnum mt-0.5 font-medium">{resumo.pagas}× · {moeda(resumo.total_pago)}</dd></div>
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Média paga</dt><dd className="tnum mt-0.5 font-medium">{resumo.media_paga === null ? "—" : moeda(resumo.media_paga)}</dd></div>
        </dl>
        {resumo.ultimo_pagamento ? (
          <p className="mt-3 text-xs capitalize text-text-2">Último pagamento: {dataLonga(resumo.ultimo_pagamento)}</p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted">Histórico</h2>
        {ocorrencias.length === 0 ? (
          <div className="cartao">
            <Vazio icone={CalendarClock} titulo="Ainda sem ocorrências" descricao="Abra o mês em Contas para gerar o próximo vencimento." />
          </div>
        ) : (
          <ul className="cartao divide-y divide-border">
            {ocorrencias.map((o) => {
              const paga = o.status === "paga";
              const pulada = o.status === "pulada";
              const atrasada = o.status === "atrasada";
              const linha = (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className={cn("shrink-0", paga ? "text-accent" : pulada ? "text-muted" : atrasada ? "text-danger" : "text-muted")}>
                    {paga ? <CheckCircle2 className="size-5" /> : pulada ? <MinusCircle className="size-5" /> : <Circle className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium capitalize", (paga || pulada) && "text-text-2")}>{mesExtenso(o.competencia)}</p>
                    <p className={cn("text-xs", atrasada ? "font-medium text-danger" : "text-text-2")}>
                      {paga ? "Paga" : pulada ? "Pulada" : atrasada ? "Atrasada" : "Pendente"} · vence dia {o.vencimento.slice(8, 10)}
                    </p>
                  </div>
                  <span className={cn("tnum text-sm font-medium", (pulada || !paga) && "text-text-2")}>
                    {pulada ? "—" : moeda(o.valor_real ?? conta.valor_estimado)}
                  </span>
                </div>
              );
              return (
                <li key={o.id}>
                  {o.lancamento_id ? <Link href={`/lancamentos/${o.lancamento_id}`} className="block hover:bg-surface-2">{linha}</Link> : linha}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2 pb-4">
        {conta.ativa ? (
          <Botao tamanho="lg" cheio variante="secundario" onClick={() => setConfirmando("arquivar")}>
            <Archive className="size-4" /> Arquivar conta
          </Botao>
        ) : (
          <Botao
            tamanho="lg"
            cheio
            variante="secundario"
            carregando={reativar.isPending}
            onClick={async () => {
              await reativar.mutateAsync(conta.id);
              toast.success("Conta reativada");
            }}
          >
            <ArchiveRestore className="size-4" /> Reativar conta
          </Botao>
        )}
        <Botao tamanho="lg" cheio variante="perigo" onClick={() => setConfirmando("excluir")}>
          <Trash2 className="size-4" /> Excluir conta
        </Botao>
      </section>

      <FolhaConta
        aberta={editando}
        aoMudar={setEditando}
        conta={conta}
        aoSalvar={async (d) => {
          await atualizar.mutateAsync({ id: conta.id, ...d });
          toast.success("Conta salva");
          setEditando(false);
        }}
      />

      <Confirmar
        aberta={confirmando === "arquivar"}
        aoMudar={(a) => !a && setConfirmando(null)}
        titulo={`Arquivar "${conta.nome}"?`}
        descricao="Ela sai do mês e para de mandar lembrete. O histórico fica guardado e você pode reativar quando quiser."
        rotuloConfirmar="Arquivar"
        aoConfirmar={async () => {
          await arquivar.mutateAsync(conta.id);
          toast.success("Conta arquivada");
        }}
      />

      <Confirmar
        aberta={confirmando === "excluir"}
        aoMudar={(a) => !a && setConfirmando(null)}
        titulo={`Excluir "${conta.nome}"?`}
        descricao={
          resumo.pagas > 0
            ? `Some de vez, junto com as ${resumo.ocorrencias_total} ocorrências. Os ${resumo.pagas} pagamentos já lançados continuam nos seus meses. Não dá para desfazer.`
            : "Some de vez. Como nada foi pago ainda, você não perde nenhum lançamento. Não dá para desfazer."
        }
        rotuloConfirmar="Excluir de vez"
        perigo
        alternativa={
          conta.ativa && resumo.pagas > 0
            ? {
                rotulo: "Só arquivar",
                aoEscolher: async () => {
                  await arquivar.mutateAsync(conta.id);
                  toast.success("Conta arquivada");
                },
              }
            : undefined
        }
        aoConfirmar={async () => {
          await excluir.mutateAsync(conta.id);
          toast.success("Conta excluída");
          roteador.replace("/contas");
        }}
      />
    </div>
  );
}
