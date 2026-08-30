"use client";

import Link from "next/link";
import { Sparkles, Clock } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { cn } from "@/lib/utils";

/** Faixa discreta do teste grátis: some no plano completo; fica mais visível nos últimos 5 dias. */
export function BannerTeste({ className }: { className?: string }) {
  const usuario = useAuth((s) => s.usuario);
  if (!usuario || usuario.plano === "completo") return null;
  const dias = usuario.dias_restantes_teste ?? 0;
  const acabando = dias <= 5;
  const acabou = dias <= 0;

  return (
    <Link
      href="/plano"
      className={cn(
        "flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm transition-colors",
        acabou ? "bg-warn-soft text-warn" : acabando ? "bg-warn-soft text-text" : "bg-accent-soft text-text",
        className,
      )}
    >
      {acabou ? <Clock className="size-4 shrink-0" /> : <Sparkles className="size-4 shrink-0 text-accent" />}
      <span className="min-w-0 flex-1 truncate">
        {acabou
          ? "Seu teste grátis terminou — continue com o Finan Completo"
          : `Teste grátis: ${dias} ${dias === 1 ? "dia restante" : "dias restantes"}`}
      </span>
      <span className="shrink-0 text-xs font-semibold text-accent">{acabou ? "Ver planos" : "Detalhes"}</span>
    </Link>
  );
}
