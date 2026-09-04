"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Base = {
  /** Rótulo acessível — o botão é só ícone. */
  rotulo: string;
  icone?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  className?: string;
};

type Props = Base & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

/**
 * Ação principal da tela, na zona do polegar: canto inferior direito, acima da tab bar.
 * Fica alinhado à borda do conteúdo (não da janela) para acompanhar a coluna central.
 */
export function BotaoFlutuante({ rotulo, icone: Icone = Plus, className, href, onClick }: Props) {
  const conteudo = (
    <motion.span whileTap={{ scale: 0.92 }} className="grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lg shadow-accent/30 botao-brilho">
      <Icone className="size-6" strokeWidth={2.4} />
    </motion.span>
  );

  return (
    // Camada externa reserva a sidebar do desktop; a interna acompanha a coluna de conteúdo.
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-[calc(5rem+var(--safe-b))] z-30 md:bottom-6 md:pl-60", className)}>
      <div className="mx-auto flex max-w-lg justify-end px-4 md:max-w-3xl md:px-8">
        {href ? (
          <Link href={href} aria-label={rotulo} className="pointer-events-auto">
            {conteudo}
          </Link>
        ) : (
          <button type="button" aria-label={rotulo} onClick={onClick} className="pointer-events-auto">
            {conteudo}
          </button>
        )}
      </div>
    </div>
  );
}
