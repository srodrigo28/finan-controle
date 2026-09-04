"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Paperclip, Pencil, Trash2, FileText, Image as ImagemIcone, ShoppingCart, X } from "lucide-react";
import { useLancamento, useMutacoesLancamento } from "@/hooks/use-lancamentos";
import { useCategorias } from "@/hooks/use-categorias";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Valor } from "@/components/ui/valor";
import { Botao } from "@/components/ui/botao";
import { Folha } from "@/components/ui/folha";
import { Confirmar } from "@/components/ui/confirmar";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import { Skeleton } from "@/components/ui/diversos";
import { FormularioLancamento } from "@/components/formulario-lancamento";
import { AnexoVisual } from "@/components/anexo-visual";
import { dataLonga, FORMAS_PAGAMENTO, moeda } from "@/lib/formatar";

export default function PaginaDetalheLancamento({ params }: PageProps<"/lancamentos/[id]">) {
  const { id } = use(params);
  const roteador = useRouter();
  const { data: l, isPending } = useLancamento(id);
  const { mapa } = useCategorias();
  const { excluir, anexar, removerAnexo } = useMutacoesLancamento();
  const [editando, setEditando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const refArquivo = useRef<HTMLInputElement>(null);

  if (isPending || !l) {
    return (
      <div>
        <Cabecalho titulo="Lançamento" voltar />
        <div className="cartao space-y-3 p-5"><Skeleton className="h-10 w-40" /><Skeleton className="h-4 w-60" /></div>
      </div>
    );
  }

  const categoria = l.categoria_id ? mapa.get(l.categoria_id) : null;
  const receita = l.tipo === "receita";
  const forma = FORMAS_PAGAMENTO.find((f) => f.valor === l.forma_pagamento)?.rotulo;

  const apagar = async () => {
    await excluir.mutateAsync(l.id);
    toast.success("Lançamento excluído");
    roteador.replace("/lancamentos");
  };

  const enviarArquivo = async (arquivo?: File) => {
    if (!arquivo) return;
    try {
      await anexar.mutateAsync({ id: l.id, arquivo });
      toast.success("Comprovante anexado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao anexar");
    }
  };

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo={receita ? "Receita" : "Despesa"}
        voltar
        acoes={
          <>
            {!l.sessao_id ? (
              <Botao variante="fantasma" tamanho="icone" aria-label="Editar" onClick={() => setEditando(true)}><Pencil className="size-5" /></Botao>
            ) : null}
            <Botao variante="fantasma" tamanho="icone" aria-label="Excluir" onClick={() => setExcluindo(true)} carregando={excluir.isPending}><Trash2 className="size-5 text-danger" /></Botao>
          </>
        }
      />

      <section className="cartao p-5">
        <div className="flex items-start gap-4">
          {l.sessao_id ? (
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent"><ShoppingCart className="size-7" /></span>
          ) : (
            <IconeCategoria categoria={categoria} tamanho="lg" />
          )}
          <div className="min-w-0 flex-1">
            <Valor valor={l.valor} tamanho="xl" tipo={receita ? "receita" : "despesa"} sinal="nunca" />
            <p className="mt-1 truncate text-lg font-medium">{l.descricao || categoria?.nome || "—"}</p>
            <p className="text-sm capitalize text-text-2">{dataLonga(l.data)}</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Categoria</dt><dd className="mt-0.5 font-medium">{categoria?.nome ?? "Sem categoria"}</dd></div>
          <div className="rounded-xl bg-surface-2 p-3"><dt className="text-xs text-muted">Pagamento</dt><dd className="mt-0.5 font-medium">{forma ?? "—"}</dd></div>
        </dl>
      </section>

      {l.itens && l.itens.length > 0 ? (
        <section className="cartao">
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Itens da compra</h2>
            <span className="tnum text-xs text-muted">{l.itens.filter((i) => !i.removido).length} itens</span>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {l.itens.filter((i) => !i.removido).map((i) => {
              const c = i.categoria_id ? mapa.get(i.categoria_id) : null;
              return (
                <li key={i.id} className="flex items-center gap-3 px-4 py-2.5">
                  <IconeCategoria categoria={c} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.descricao}</p>
                    <p className="tnum text-xs text-text-2">{Number.isInteger(i.quantidade) ? `${i.quantidade}×` : `${i.quantidade} kg ×`} {moeda(i.valor_unitario)}</p>
                  </div>
                  <span className="tnum text-sm font-medium">{moeda(i.valor_unitario * i.quantidade)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Comprovantes</h2>
          <Botao variante="secundario" tamanho="sm" onClick={() => refArquivo.current?.click()} carregando={anexar.isPending}>
            <Paperclip className="size-4" /> Anexar
          </Botao>
          <input ref={refArquivo} type="file" accept="image/*,application/pdf" capture="environment" className="hidden" onChange={(e) => enviarArquivo(e.target.files?.[0])} />
        </div>
        {l.anexos.length === 0 ? (
          <p className="px-1 text-sm text-text-2">Foto do cupom ou PDF do boleto. Fica guardado junto do lançamento.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {l.anexos.map((a) => (
              <li key={a.id} className="cartao relative overflow-hidden">
                <AnexoVisual anexo={a} />
                <div className="flex items-center gap-2 px-3 py-2 text-xs">
                  {a.tipo_mime.startsWith("image/") ? <ImagemIcone className="size-3.5 text-muted" /> : <FileText className="size-3.5 text-muted" />}
                  <span className="min-w-0 flex-1 truncate">{a.nome}</span>
                  <button type="button" aria-label="Remover anexo" onClick={() => removerAnexo.mutate({ id: a.id, lancamentoId: l.id })} className="text-muted hover:text-danger"><X className="size-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Confirmar
        aberta={excluindo}
        aoMudar={setExcluindo}
        titulo="Excluir este lançamento?"
        descricao="Ele sai dos seus totais do dia, da semana e do mês. Não dá para desfazer."
        rotuloConfirmar="Excluir"
        perigo
        aoConfirmar={apagar}
      />

      <Folha aberta={editando} aoMudar={setEditando} titulo="Editar lançamento">
        <FormularioLancamento inicial={l} emFolha />
      </Folha>
    </div>
  );
}
