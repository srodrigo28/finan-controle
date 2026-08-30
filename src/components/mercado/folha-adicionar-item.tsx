"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react";
import { Folha } from "@/components/ui/folha";
import { Botao } from "@/components/ui/botao";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { Stepper } from "@/components/ui/diversos";
import { SeletorCategoria } from "@/components/seletor-categoria";
import { sugestoesLocais, ultimoPreco } from "@/hooks/use-sessoes";
import { useAuth } from "@/stores/auth";
import { moeda } from "@/lib/formatar";
import { vibrar } from "@/lib/utils";
import type { ItemLocal } from "@/lib/db";

type Dados = { descricao: string; categoria_id: string | null; valor_unitario: number; quantidade: number };

type Props = {
  aberta: boolean;
  aoMudar: (a: boolean) => void;
  aoSalvar: (dados: Dados) => Promise<void> | void;
  aoRemover?: () => Promise<void> | void;
  item?: ItemLocal | null;
  categoriaPadrao?: string | null;
};

/** Adicionar/editar item: descrição → preço → quantidade (stepper) → categoria. Máximo 3 toques. */
export function FolhaAdicionarItem({ aberta, aoMudar, aoSalvar, aoRemover, item, categoriaPadrao = null }: Props) {
  return (
    <Folha aberta={aberta} aoMudar={aoMudar} titulo={item ? "Editar item" : "Adicionar item"}>
      {/* O formulário monta/desmonta com a folha: o estado sempre começa limpo. */}
      {aberta ? <FormularioItem aoFechar={() => aoMudar(false)} aoSalvar={aoSalvar} aoRemover={aoRemover} item={item ?? null} categoriaPadrao={categoriaPadrao} /> : null}
    </Folha>
  );
}

function FormularioItem({
  aoFechar,
  aoSalvar,
  aoRemover,
  item,
  categoriaPadrao,
}: {
  aoFechar: () => void;
  aoSalvar: Props["aoSalvar"];
  aoRemover?: Props["aoRemover"];
  item: ItemLocal | null;
  categoriaPadrao: string | null;
}) {
  const usuarioId = useAuth((s) => s.usuario?.id) ?? "";
  const [descricao, setDescricao] = useState(item?.descricao ?? "");
  const [valor, setValor] = useState(item?.valor_unitario ?? 0);
  const [quantidade, setQuantidade] = useState(item?.quantidade ?? 1);
  const [categoria, setCategoria] = useState<string | null>(item?.categoria_id ?? categoriaPadrao);
  const [granel, setGranel] = useState(item ? !Number.isInteger(item.quantidade) : false);
  const [sugestoes, setSugestoes] = useState<Awaited<ReturnType<typeof sugestoesLocais>>>([]);
  const [anterior, setAnterior] = useState<{ valor_unitario: number; data: string } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [chaveMoeda, setChaveMoeda] = useState(0);
  const refDescricao = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => refDescricao.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  // Sugestões e último preço conforme digita (resultado chega de forma assíncrona)
  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    const t = setTimeout(async () => {
      const s = await sugestoesLocais(usuarioId, descricao);
      if (ativo) setSugestoes(s);
      const u = await ultimoPreco(usuarioId, descricao);
      if (ativo) setAnterior(u);
    }, 220);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
  }, [descricao, usuarioId]);

  const subtotal = valor * quantidade;
  const valido = descricao.trim().length > 0 && valor > 0 && quantidade > 0;

  const salvar = async () => {
    if (!valido) return;
    setSalvando(true);
    vibrar(15);
    await aoSalvar({ descricao: descricao.trim(), categoria_id: categoria, valor_unitario: valor, quantidade });
    setSalvando(false);
    aoFechar();
  };

  const dif = anterior ? valor - anterior.valor_unitario : 0;
  const mostrarSugestoes = sugestoes.length > 0 && descricao.trim() && sugestoes[0].descricao.toLowerCase() !== descricao.trim().toLowerCase();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      <div className="relative">
        <Campo
          ref={refDescricao}
          rotulo="Item"
          placeholder="Ex.: arroz 5kg"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          autoComplete="off"
          enterKeyHint="next"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget.form?.querySelector('input[inputmode="numeric"]') as HTMLInputElement | null)?.focus();
            }
          }}
        />
        <AnimatePresence>
          {mostrarSugestoes ? (
            <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="sem-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {sugestoes.map((s) => (
                <li key={s.descricao}>
                  <button
                    type="button"
                    onClick={() => {
                      setDescricao(s.descricao);
                      setCategoria(s.categoria_id);
                      if (!valor) {
                        setValor(s.valor_unitario);
                        setChaveMoeda((k) => k + 1);
                      }
                    }}
                    className="whitespace-nowrap rounded-full bg-surface-2 px-3 py-1.5 text-sm"
                  >
                    {s.descricao} <span className="tnum text-muted">{moeda(s.valor_unitario)}</span>
                  </button>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      <div>
        <CampoMoeda key={chaveMoeda} rotulo={granel ? "Preço por kg" : "Preço unitário"} valor={valor} aoMudar={setValor} grande />
        <AnimatePresence>
          {anterior && valor > 0 ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-2 flex items-center gap-1 text-sm ${dif > 0.005 ? "text-warn" : dif < -0.005 ? "text-accent" : "text-text-2"}`}
            >
              {dif > 0.005 ? <ArrowUpRight className="size-4" /> : dif < -0.005 ? <ArrowDownRight className="size-4" /> : null}
              {Math.abs(dif) < 0.005
                ? `Mesmo preço da última compra (${moeda(anterior.valor_unitario)})`
                : `${moeda(Math.abs(dif))} ${dif > 0 ? "mais caro" : "mais barato"} que da última vez (${moeda(anterior.valor_unitario)})`}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-2">Quantidade</p>
          <button
            type="button"
            onClick={() => {
              setGranel((g) => !g);
              setQuantidade(1);
            }}
            className="mt-0.5 text-xs text-accent"
          >
            {granel ? "Voltar para unidades" : "Vendido por peso (kg)?"}
          </button>
        </div>
        <Stepper valor={quantidade} aoMudar={setQuantidade} min={granel ? 0.1 : 1} passo={granel ? 0.1 : 1} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-text-2">Categoria</p>
        <SeletorCategoria valor={categoria} aoMudar={setCategoria} priorizarPaiNome="Mercado" permitirNenhuma />
      </div>

      <div className="flex items-center gap-3 pt-1">
        {item && aoRemover ? (
          <Botao
            type="button"
            variante="perigo"
            tamanho="icone"
            aria-label="Remover item"
            onClick={async () => {
              await aoRemover();
              aoFechar();
            }}
          >
            <Trash2 className="size-5" />
          </Botao>
        ) : null}
        <Botao type="submit" tamanho="lg" cheio disabled={!valido} carregando={salvando}>
          {item ? "Salvar" : "Adicionar"}
          {subtotal > 0 ? <span className="tnum opacity-80">· {moeda(subtotal)}</span> : null}
        </Botao>
      </div>
    </form>
  );
}
