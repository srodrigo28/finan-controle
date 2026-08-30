"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#recursos", rotulo: "Recursos" },
  { href: "#graficos", rotulo: "Gráficos" },
  { href: "#como-funciona", rotulo: "Como funciona" },
  { href: "#precos", rotulo: "Preços" },
  { href: "#perguntas", rotulo: "Dúvidas" },
];

export function Navegacao() {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const ao = () => setRolou(window.scrollY > 24);
    ao();
    window.addEventListener("scroll", ao, { passive: true });
    return () => window.removeEventListener("scroll", ao);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-colors duration-300", rolou ? "bg-[var(--l-verde)]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,.08)]" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--l-menta)] text-[var(--l-verde)]">
            <ShoppingCart className="size-5" strokeWidth={2.5} />
          </span>
          <span className="display text-lg font-semibold">Finan</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-white/75 transition-colors hover:text-white">
              {l.rotulo}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/entrar" className="rounded-full px-4 py-2 text-sm font-medium text-white/85 hover:text-white">
            Entrar
          </Link>
          <Link href="/cadastro" className="rounded-full bg-[var(--l-menta)] px-4 py-2 text-sm font-semibold text-[var(--l-verde)] transition-transform hover:scale-[1.03]">
            Começar grátis
          </Link>
        </div>

        <button type="button" aria-label="Menu" onClick={() => setAberto((v) => !v)} className="grid size-11 place-items-center rounded-full text-white md:hidden">
          {aberto ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {aberto ? (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="border-t border-white/10 bg-[var(--l-verde)] px-5 pb-6 pt-3 md:hidden">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setAberto(false)} className="block py-3 text-base font-medium text-white/85">
                {l.rotulo}
              </a>
            ))}
            <div className="mt-3 flex gap-3">
              <Link href="/entrar" className="flex-1 rounded-full border border-white/20 py-3 text-center font-medium text-white">Entrar</Link>
              <Link href="/cadastro" className="flex-1 rounded-full bg-[var(--l-menta)] py-3 text-center font-semibold text-[var(--l-verde)]">Começar grátis</Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
