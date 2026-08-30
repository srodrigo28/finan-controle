"use client";

import { createElement, useState } from "react";
import { motion, Reorder } from "motion/react";
import { toast } from "sonner";
import { Plus, Archive, ArchiveRestore, GripVertical, ChevronRight, Check } from "lucide-react";
import { useCategorias } from "@/hooks/use-categorias";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Botao } from "@/components/ui/botao";
import { Folha } from "@/components/ui/folha";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import { Segmentado } from "@/components/ui/diversos";
import { CORES_CATEGORIA, NOMES_ICONES, obterIcone } from "@/lib/icones";
import { moeda } from "@/lib/formatar";
import { cn } from "@/lib/utils";
import type { Categoria } from "@/lib/tipos";

export default function PaginaCategorias() {
  const { categorias, raizes, filhasDe, criar, atualizar, arquivar, reordenar } = useCategorias(true);
  const [editando, setEditando] = useState<Partial<Categoria> | null>(null);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  const [ordem, setOrdem] = useState<string[] | null>(null);

  const ativas = raizes.filter((c) => !c.arquivada);
  const lista = ordem ? ordem.map((id) => ativas.find((c) => c.id === id)!).filter(Boolean) : ativas;
  const arquivadas = categorias.filter((c) => c.arquivada);

  const salvar = async (d: Partial<Categoria>) => {
    try {
      if (d.id) await atualizar.mutateAsync({ id: d.id, ...d });
      else await criar.mutateAsync(d);
      toast.success("Categoria salva");
      setEditando(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    }
  };

  return (
    <div className="space-y-5">
      <Cabecalho titulo="Categorias" voltar="/mais" subtitulo="Arraste para reordenar. Toque para editar." acoes={<Botao tamanho="icone" aria-label="Nova categoria" onClick={() => setEditando({})}><Plus className="size-5" strokeWidth={2.4} /></Botao>} />

      <Reorder.Group
        axis="y"
        values={lista.map((c) => c.id)}
        onReorder={(ids) => setOrdem(ids as string[])}
        className="space-y-2"
      >
        {lista.map((c) => {
          const filhas = filhasDe(c.id).filter((f) => !f.arquivada);
          return (
            <Reorder.Item
              key={c.id}
              value={c.id}
              onDragEnd={() => ordem && reordenar.mutate(ordem)}
              className="cartao overflow-hidden"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <span className="cursor-grab touch-none text-muted"><GripVertical className="size-5" /></span>
                <button type="button" onClick={() => setEditando(c)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <IconeCategoria categoria={c} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.nome}</p>
                    <p className="text-xs text-text-2">{c.orcamento_mensal ? `Orçamento ${moeda(c.orcamento_mensal)}/mês` : "Sem orçamento"}{filhas.length ? ` · ${filhas.length} sub` : ""}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted" />
                </button>
              </div>
              {filhas.length > 0 ? (
                <ul className="border-t border-border bg-surface-2/40">
                  {filhas.map((f) => (
                    <li key={f.id}>
                      <button type="button" onClick={() => setEditando(f)} className="flex w-full items-center gap-3 py-2 pl-12 pr-4 text-left">
                        <IconeCategoria categoria={f} tamanho="sm" />
                        <span className="flex-1 truncate text-sm">{f.nome}</span>
                        <ChevronRight className="size-4 text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button type="button" onClick={() => setEditando({ pai_id: c.id, cor: c.cor })} className="flex w-full items-center gap-2 border-t border-border px-4 py-2 text-xs font-medium text-accent">
                <Plus className="size-3.5" /> Subcategoria em {c.nome}
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {arquivadas.length > 0 ? (
        <div>
          <button type="button" onClick={() => setMostrarArquivadas((v) => !v)} className="px-1 text-sm font-medium text-text-2">
            {mostrarArquivadas ? "Ocultar" : "Mostrar"} arquivadas ({arquivadas.length})
          </button>
          {mostrarArquivadas ? (
            <ul className="cartao mt-2 divide-y divide-border">
              {arquivadas.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3 opacity-70">
                  <IconeCategoria categoria={c} tamanho="sm" />
                  <span className="flex-1 truncate">{c.nome}</span>
                  <button type="button" onClick={() => atualizar.mutate({ id: c.id, arquivada: false })} className="flex items-center gap-1 text-sm font-medium text-accent"><ArchiveRestore className="size-4" /> Restaurar</button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <FolhaCategoria
        categoria={editando}
        aoMudar={(a) => !a && setEditando(null)}
        aoSalvar={salvar}
        aoArquivar={editando?.id ? async () => { await arquivar.mutateAsync(editando.id!); toast.success("Categoria arquivada"); setEditando(null); } : undefined}
        pais={ativas}
      />
    </div>
  );
}

function FolhaCategoria({ categoria, aoMudar, aoSalvar, aoArquivar, pais }: { categoria: Partial<Categoria> | null; aoMudar: (a: boolean) => void; aoSalvar: (d: Partial<Categoria>) => Promise<void>; aoArquivar?: () => Promise<void>; pais: Categoria[] }) {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState(CORES_CATEGORIA[0]);
  const [icone, setIcone] = useState("shopping-cart");
  const [paiId, setPaiId] = useState<string | null>(null);
  const [orcamento, setOrcamento] = useState(0);
  const [chave, setChave] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const id = categoria ? (categoria.id ?? `nova-${categoria.pai_id ?? ""}`) : null;
  if (categoria && id !== chave) {
    setChave(id);
    setNome(categoria.nome ?? "");
    setCor(categoria.cor ?? CORES_CATEGORIA[pais.length % CORES_CATEGORIA.length]);
    setIcone(categoria.icone ?? "shopping-cart");
    setPaiId(categoria.pai_id ?? null);
    setOrcamento(categoria.orcamento_mensal ?? 0);
  }

  return (
    <Folha aberta={!!categoria} aoMudar={aoMudar} titulo={categoria?.id ? "Editar categoria" : "Nova categoria"}>
      <form className="space-y-5" onSubmit={async (e) => { e.preventDefault(); setSalvando(true); try { await aoSalvar({ id: categoria?.id, nome: nome.trim(), cor, icone, pai_id: paiId, orcamento_mensal: orcamento > 0 ? orcamento : null }); } finally { setSalvando(false); } }}>
        <div className="flex items-center gap-4">
          <motion.span key={cor + icone} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="grid size-16 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: `${cor}22`, color: cor }}>
            {createElement(obterIcone(icone), { className: "size-8", strokeWidth: 2.2 })}
          </motion.span>
          <Campo rotulo="Nome" placeholder="Ex.: Mercado" value={nome} onChange={(e) => setNome(e.target.value)} required className="flex-1" />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text-2">Cor</p>
          <div className="flex flex-wrap gap-2">
            {CORES_CATEGORIA.map((c) => (
              <button key={c} type="button" aria-label={c} onClick={() => setCor(c)} className={cn("grid size-9 place-items-center rounded-full transition-transform", cor === c && "scale-110 ring-2 ring-text ring-offset-2 ring-offset-surface")} style={{ backgroundColor: c }}>
                {cor === c ? <Check className="size-4 text-white" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text-2">Ícone</p>
          <div className="grid grid-cols-8 gap-2">
            {NOMES_ICONES.map((n) => (
              <button key={n} type="button" aria-label={n} onClick={() => setIcone(n)} className={cn("grid aspect-square place-items-center rounded-xl bg-surface-2 text-text-2 transition-colors", icone === n && "bg-text text-bg")}>
                {createElement(obterIcone(n), { className: "size-5" })}
              </button>
            ))}
          </div>
        </div>

        {!categoria?.id || categoria.pai_id !== undefined ? (
          <div>
            <p className="mb-2 text-sm font-medium text-text-2">Dentro de</p>
            <Segmentado
              opcoes={[{ valor: "", rotulo: "Principal" }, ...pais.filter((p) => p.id !== categoria?.id).slice(0, 3).map((p) => ({ valor: p.id, rotulo: p.nome }))]}
              valor={paiId ?? ""}
              aoMudar={(v) => setPaiId(v || null)}
            />
            {pais.length > 3 ? (
              <select value={paiId ?? ""} onChange={(e) => setPaiId(e.target.value || null)} className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3">
                <option value="">Categoria principal</option>
                {pais.filter((p) => p.id !== categoria?.id).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            ) : null}
          </div>
        ) : null}

        <CampoMoeda key={chave} rotulo="Orçamento mensal (opcional)" valor={orcamento} aoMudar={setOrcamento} dica="Você recebe alerta quando o gasto passar deste valor." />

        <div className="flex gap-3">
          {aoArquivar ? <Botao type="button" variante="perigo" tamanho="icone" aria-label="Arquivar" onClick={aoArquivar}><Archive className="size-5" /></Botao> : null}
          <Botao type="submit" tamanho="lg" cheio carregando={salvando} disabled={!nome.trim()}>Salvar</Botao>
        </div>
      </form>
    </Folha>
  );
}
