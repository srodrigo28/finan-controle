"use client";

import { forwardRef, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { mascaraCentavos } from "@/lib/formatar";

type Base = {
  rotulo?: string;
  erro?: string;
  dica?: string;
  prefixo?: React.ReactNode;
  sufixo?: React.ReactNode;
};

type PropsCampo = Base & React.InputHTMLAttributes<HTMLInputElement>;

export const Campo = forwardRef<HTMLInputElement, PropsCampo>(function Campo(
  { rotulo, erro, dica, prefixo, sufixo, className, id, ...resto },
  ref,
) {
  const gerado = useId();
  const idFinal = id ?? gerado;
  return (
    <label htmlFor={idFinal} className="block">
      {rotulo ? <span className="mb-1.5 block text-sm font-medium text-text-2">{rotulo}</span> : null}
      <span
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border bg-surface px-3.5 transition-[box-shadow,border-color] focus-within:ring-2",
          erro ? "border-danger focus-within:ring-danger/25" : "border-border focus-within:border-accent focus-within:ring-accent/25",
        )}
      >
        {prefixo ? <span className="text-muted">{prefixo}</span> : null}
        <input
          ref={ref}
          id={idFinal}
          className={cn("min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted", className)}
          {...resto}
        />
        {sufixo ? <span className="text-muted">{sufixo}</span> : null}
      </span>
      {erro ? (
        <span className="mt-1 block text-xs text-danger">{erro}</span>
      ) : dica ? (
        <span className="mt-1 block text-xs text-muted">{dica}</span>
      ) : null}
    </label>
  );
});

type PropsMoeda = Base & {
  valor: number;
  aoMudar: (valor: number) => void;
  autoFocus?: boolean;
  grande?: boolean;
  id?: string;
  name?: string;
};

/** Campo monetário: abre teclado numérico e digita em centavos ("1250" → 12,50). */
export function CampoMoeda({ rotulo, erro, dica, valor, aoMudar, autoFocus, grande, id, name }: PropsMoeda) {
  const gerado = useId();
  const idFinal = id ?? gerado;
  const [texto, setTexto] = useState(() => (valor ? mascaraCentavos(String(Math.round(valor * 100))).texto : ""));

  return (
    <label htmlFor={idFinal} className="block">
      {rotulo ? <span className="mb-1.5 block text-sm font-medium text-text-2">{rotulo}</span> : null}
      <span
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-surface px-3.5 transition-[box-shadow,border-color] focus-within:ring-2",
          grande ? "h-16" : "h-12",
          erro ? "border-danger focus-within:ring-danger/25" : "border-border focus-within:border-accent focus-within:ring-accent/25",
        )}
      >
        <span className={cn("font-medium text-muted", grande && "text-lg")}>R$</span>
        <input
          id={idFinal}
          name={name}
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder="0,00"
          value={texto}
          onChange={(e) => {
            const { valor: v, texto: t } = mascaraCentavos(e.target.value);
            setTexto(t === "0,00" && e.target.value.replace(/\D/g, "") === "" ? "" : t);
            aoMudar(v);
          }}
          className={cn(
            "tnum min-w-0 flex-1 bg-transparent text-right text-text outline-none placeholder:text-muted",
            grande ? "text-3xl font-semibold" : "text-base",
          )}
        />
      </span>
      {erro ? (
        <span className="mt-1 block text-xs text-danger">{erro}</span>
      ) : dica ? (
        <span className="mt-1 block text-xs text-muted">{dica}</span>
      ) : null}
    </label>
  );
}

type PropsArea = Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export function AreaTexto({ rotulo, erro, dica, className, id, ...resto }: PropsArea) {
  const gerado = useId();
  const idFinal = id ?? gerado;
  return (
    <label htmlFor={idFinal} className="block">
      {rotulo ? <span className="mb-1.5 block text-sm font-medium text-text-2">{rotulo}</span> : null}
      <textarea
        id={idFinal}
        className={cn(
          "w-full rounded-xl border bg-surface px-3.5 py-3 text-base text-text outline-none transition-[box-shadow,border-color] placeholder:text-muted focus:ring-2",
          erro ? "border-danger focus:ring-danger/25" : "border-border focus:border-accent focus:ring-accent/25",
          className,
        )}
        {...resto}
      />
      {erro ? <span className="mt-1 block text-xs text-danger">{erro}</span> : dica ? <span className="mt-1 block text-xs text-muted">{dica}</span> : null}
    </label>
  );
}
