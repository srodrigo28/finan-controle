"use client";

import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

type Props = {
  aberta: boolean;
  aoMudar: (aberta: boolean) => void;
  titulo?: string;
  descricao?: string;
  children: React.ReactNode;
  className?: string;
  /** Não fecha ao arrastar/clicar fora (fluxos críticos). */
  bloqueada?: boolean;
};

/** Folha inferior (bottom sheet) com gesto de arrastar — ações na zona do polegar. */
export function Folha({ aberta, aoMudar, titulo, descricao, children, className, bloqueada }: Props) {
  return (
    <Drawer.Root open={aberta} onOpenChange={aoMudar} dismissible={!bloqueada} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[94dvh] w-full max-w-lg flex-col rounded-t-[28px] border-t border-border bg-surface outline-none",
            className,
          )}
        >
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-surface-3" />
          <div className="shrink-0 px-5 pt-4">
            {titulo ? (
              <Drawer.Title className="text-lg font-semibold tracking-tight">{titulo}</Drawer.Title>
            ) : (
              <Drawer.Title className="sr-only">Painel</Drawer.Title>
            )}
            {descricao ? (
              <Drawer.Description className="mt-0.5 text-sm text-text-2">{descricao}</Drawer.Description>
            ) : (
              <Drawer.Description className="sr-only">Conteúdo do painel</Drawer.Description>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(1.25rem+var(--safe-b))] pt-4">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
