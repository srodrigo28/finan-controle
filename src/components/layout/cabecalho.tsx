"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  voltar?: boolean | string;
  acoes?: React.ReactNode;
  className?: string;
  grande?: boolean;
};

export function Cabecalho({ titulo, subtitulo, voltar, acoes, className, grande }: Props) {
  const roteador = useRouter();
  return (
    <header className={cn("sticky top-0 z-20 -mx-4 mb-2 bg-bg/80 px-4 pb-2 pt-[calc(0.75rem+var(--safe-t))] backdrop-blur-xl md:static md:mx-0 md:bg-transparent md:px-0 md:pt-2", className)}>
      <div className="flex items-center gap-2">
        {voltar ? (
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => (typeof voltar === "string" ? roteador.push(voltar) : roteador.back())}
            className="-ml-2 grid size-11 place-items-center rounded-full text-text-2 hover:bg-surface-2"
          >
            <ChevronLeft className="size-6" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className={cn("truncate font-semibold tracking-tight", grande ? "text-[28px]" : "text-xl")}>{titulo}</h1>
          {subtitulo ? <p className="truncate text-sm text-text-2">{subtitulo}</p> : null}
        </div>
        {acoes ? <div className="flex shrink-0 items-center gap-1">{acoes}</div> : null}
      </div>
    </header>
  );
}
