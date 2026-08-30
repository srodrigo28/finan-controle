"use client";

import Link from "next/link";
import { BarChart3, CalendarClock, Tags, Settings, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { Cabecalho } from "@/components/layout/cabecalho";

const ITENS = [
  { href: "/mes", rotulo: "Visão mensal", descricao: "Evolução, categorias e projeção", icone: BarChart3 },
  { href: "/contas", rotulo: "Contas agendadas", descricao: "Energia, água, internet, prestações", icone: CalendarClock },
  { href: "/categorias", rotulo: "Categorias", descricao: "Cores, ícones, subcategorias e orçamentos", icone: Tags },
  { href: "/config", rotulo: "Configurações", descricao: "Perfil, orçamento, tema e exportação", icone: Settings },
];

export default function PaginaMais() {
  const { usuario, sair } = useAuth();
  return (
    <div className="space-y-5">
      <Cabecalho titulo="Mais" grande />
      <div className="cartao flex items-center gap-4 p-4">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-lg font-semibold text-accent-fg">{usuario?.nome.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{usuario?.nome}</p>
          <p className="truncate text-sm text-text-2">{usuario?.email}</p>
        </div>
      </div>
      <ul className="cartao divide-y divide-border">
        {ITENS.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2/60">
              <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-text"><i.icone className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{i.rotulo}</p>
                <p className="truncate text-xs text-text-2">{i.descricao}</p>
              </div>
              <ChevronRight className="size-4 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" onClick={sair} className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-danger hover:bg-danger-soft">
        <LogOut className="size-4" /> Sair da conta
      </button>
    </div>
  );
}
