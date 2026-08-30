"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { House, ReceiptText, ShoppingCart, CalendarRange, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const ABAS = [
  { href: "/", rotulo: "Início", icone: House },
  { href: "/lancamentos", rotulo: "Lançamentos", icone: ReceiptText },
  { href: "/mercado", rotulo: "Mercado", icone: ShoppingCart, destaque: true },
  { href: "/semana", rotulo: "Semana", icone: CalendarRange },
  { href: "/mais", rotulo: "Mais", icone: Menu },
] as const;

/** Navegação principal: bottom tab bar no celular, trilho lateral no desktop. */
export function BarraAbas() {
  const caminho = usePathname();
  const ativa = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

  return (
    <>
      {/* Mobile */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/85 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "var(--safe-b)" }}
      >
        <ul className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
          {ABAS.map((aba) => {
            const Icone = aba.icone;
            const on = ativa(aba.href);
            if ("destaque" in aba && aba.destaque) {
              return (
                <li key={aba.href} className="flex flex-1 items-center justify-center">
                  <Link
                    href={aba.href}
                    aria-label={aba.rotulo}
                    className="relative -mt-7 grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lg shadow-accent/30 botao-brilho"
                  >
                    <motion.span whileTap={{ scale: 0.9 }} className="grid place-items-center">
                      <Icone className="size-6" strokeWidth={2.4} />
                    </motion.span>
                  </Link>
                </li>
              );
            }
            return (
              <li key={aba.href} className="flex flex-1">
                <Link
                  href={aba.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                    on ? "text-text" : "text-muted",
                  )}
                >
                  <span className="relative grid place-items-center">
                    {on ? (
                      <motion.span layoutId="aba-ativa" className="absolute -inset-x-3 -inset-y-1 rounded-full bg-accent-soft" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    ) : null}
                    <Icone className="relative size-[22px]" strokeWidth={on ? 2.4 : 2} />
                  </span>
                  {aba.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-fg">
            <ShoppingCart className="size-5" strokeWidth={2.4} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Finan</span>
        </Link>
        <ul className="space-y-1">
          {ABAS.map((aba) => {
            const Icone = aba.icone;
            const on = ativa(aba.href);
            return (
              <li key={aba.href}>
                <Link
                  href={aba.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors",
                    on ? "bg-accent-soft text-text" : "text-text-2 hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <Icone className="size-5" strokeWidth={on ? 2.4 : 2} />
                  {aba.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}
