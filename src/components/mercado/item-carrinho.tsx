"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { Trash2 } from "lucide-react";
import { IconeCategoria } from "@/components/ui/icone-categoria";
import { moeda } from "@/lib/formatar";
import { vibrar } from "@/lib/utils";
import type { ItemLocal } from "@/lib/db";
import type { Categoria } from "@/lib/tipos";

type Props = {
  item: ItemLocal;
  categoria?: Categoria | null;
  aoTocar: () => void;
  aoRemover: () => void;
};

/** Linha do carrinho: toque para editar, arraste para a esquerda para remover. */
export function ItemCarrinho({ item, categoria, aoTocar, aoRemover }: Props) {
  const x = useMotionValue(0);
  const fundoOpacidade = useTransform(x, [-96, -24, 0], [1, 0.4, 0]);
  const subtotal = item.valor_unitario * item.quantidade;
  const qtd = Number.isInteger(item.quantidade) ? `${item.quantidade}×` : `${item.quantidade.toFixed(3).replace(/0+$/, "").replace(".", ",")} kg ×`;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className="relative overflow-hidden rounded-2xl"
    >
      <motion.div style={{ opacity: fundoOpacidade }} className="absolute inset-0 flex items-center justify-end rounded-2xl bg-danger pr-6 text-white">
        <Trash2 className="size-5" />
      </motion.div>
      <motion.button
        type="button"
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.08}
        dragSnapToOrigin
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -96) {
            vibrar(20);
            aoRemover();
          }
        }}
        onClick={aoTocar}
        className="relative flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left"
      >
        <IconeCategoria categoria={categoria} tamanho="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{item.descricao}</p>
          <p className="tnum text-xs text-text-2">
            {qtd} {moeda(item.valor_unitario)}
            {categoria ? ` · ${categoria.nome}` : ""}
          </p>
        </div>
        <span className="tnum text-base font-semibold">{moeda(subtotal)}</span>
      </motion.button>
    </motion.li>
  );
}
