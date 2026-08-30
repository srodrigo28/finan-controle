import { createElement } from "react";
import { obterIcone } from "@/lib/icones";
import { cn } from "@/lib/utils";
import type { Categoria } from "@/lib/tipos";

type Props = {
  categoria?: Pick<Categoria, "cor" | "icone"> | null;
  tamanho?: "sm" | "md" | "lg";
  className?: string;
};

const TAM = { sm: "size-8 rounded-lg [&>svg]:size-4", md: "size-10 rounded-xl [&>svg]:size-5", lg: "size-14 rounded-2xl [&>svg]:size-7" };

/** Círculo colorido com o ícone da categoria (fallback neutro quando sem categoria). */
export function IconeCategoria({ categoria, tamanho = "md", className }: Props) {
  const cor = categoria?.cor ?? "#7a8987";
  return (
    <span
      className={cn("grid shrink-0 place-items-center", TAM[tamanho], className)}
      style={{ backgroundColor: `${cor}22`, color: cor }}
      aria-hidden
    >
      {createElement(obterIcone(categoria?.icone), { strokeWidth: 2.2 })}
    </span>
  );
}
