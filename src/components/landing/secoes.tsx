"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ShoppingCart, TrendingDown, CalendarRange, CalendarClock, Tags, WifiOff, Download, Camera,
  ArrowRight, Check, Plus, Minus, Receipt, Timer, BellRing,
} from "lucide-react";

const aparecer = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function Rotulo({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--l-verde-3)]">{children}</p>;
}

/* ---------- Problema → solução ---------- */
export function Problema() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <motion.div {...aparecer} className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <Rotulo>O problema</Rotulo>
          <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Você só descobre que estourou quando não dá mais para fazer nada.</h2>
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-[var(--l-tinta-2)]">
          <p>No supermercado é pior: o total aparece no caixa, com fila atrás — e ninguém tem coragem de devolver item.</p>
          <p>
            <strong className="text-[var(--l-tinta)]">Decidir o que cortar é fácil no corredor e constrangedor no caixa.</strong> Se o app
            mostra o total crescendo em tempo real, você se autorregula sozinho. É isso que o Finan faz.
          </p>
        </div>
      </motion.div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { n: "10 s", t: "para registrar um gasto", d: "Valor primeiro, categoria em um toque." },
          { n: "3 toques", t: "para adicionar um item no carrinho", d: "Preço abre direto no teclado numérico." },
          { n: "0 sinal", t: "necessário no mercado", d: "Tudo fica no aparelho e sincroniza depois." },
        ].map((c, i) => (
          <motion.div key={c.t} {...aparecer} transition={{ ...aparecer.transition, delay: i * 0.08 }} className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_-16px_rgba(12,59,46,.25)]">
            <p className="display text-4xl font-bold text-[var(--l-verde)]">{c.n}</p>
            <p className="mt-1 font-semibold">{c.t}</p>
            <p className="mt-1 text-sm text-[var(--l-tinta-2)]">{c.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Recursos ---------- */
const RECURSOS = [
  { I: ShoppingCart, t: "Modo Mercado", d: "Abra uma sessão ao entrar, adicione itens pelo corredor e veja o total sempre visível. Ao fechar, confere com o cupom e vira um lançamento só.", destaque: true },
  { I: TrendingDown, t: "Último preço na hora", d: "\"O arroz está R$ 3,40 mais caro que na última compra.\" Histórico de preço por item, automático." },
  { I: CalendarRange, t: "Timeline semanal", d: "Navegue semana a semana: total, comparação com a anterior, dia mais caro e a semana mais cara do mês." },
  { I: CalendarClock, t: "Contas agendadas", d: "Energia, água, internet, prestações. Valor estimado, lembrete antes do vencimento e \"quanto ainda tenho que pagar\"." },
  { I: Tags, t: "Categorias suas", d: "Sem taxonomia imposta. Cor, ícone, subcategorias e orçamento mensal por categoria — arquive, nunca perca histórico." },
  { I: WifiOff, t: "Offline de verdade", d: "Instale como app. O carrinho funciona sem sinal e sincroniza sozinho quando a rede volta." },
  { I: Camera, t: "Comprovante anexado", d: "Foto do cupom ou PDF do boleto guardados junto do lançamento." },
  { I: Download, t: "Seus dados são seus", d: "Exporte tudo em CSV ou JSON, sem paywall. Nunca." },
];

export function Recursos() {
  return (
    <section id="recursos" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div {...aparecer} className="max-w-2xl">
          <Rotulo>Recursos</Rotulo>
          <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Feito para a vida real, não para o relatório do mês.</h2>
        </motion.div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECURSOS.map((r, i) => (
            <motion.article
              key={r.t}
              {...aparecer}
              transition={{ ...aparecer.transition, delay: (i % 4) * 0.07 }}
              className={`group rounded-3xl p-6 transition-transform hover:-translate-y-1 ${r.destaque ? "bg-[var(--l-verde)] text-white sm:col-span-2 lg:col-span-2" : "border border-black/5 bg-[var(--l-creme)]"}`}
            >
              <span className={`grid size-11 place-items-center rounded-2xl ${r.destaque ? "bg-[var(--l-menta)] text-[var(--l-verde)]" : "bg-white text-[var(--l-verde)] shadow-sm"}`}>
                <r.I className="size-5" strokeWidth={2.3} />
              </span>
              <h3 className="mt-5 text-xl font-semibold">{r.t}</h3>
              <p className={`mt-2 text-[15px] leading-relaxed ${r.destaque ? "text-white/75" : "text-[var(--l-tinta-2)]"}`}>{r.d}</p>
              {r.destaque ? (
                <Link href="/cadastro" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--l-menta)]">
                  Experimentar no próximo mercado <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Como funciona ---------- */
const PASSOS = [
  { I: Plus, t: "Abra o carrinho ao entrar", d: "Opcional: diga onde está e quanto quer gastar nessa compra." },
  { I: Timer, t: "Adicione enquanto anda", d: "Item, preço, quantidade no stepper. O total sobe na hora e avisa quando passar do orçamento." },
  { I: Receipt, t: "Confira no caixa", d: "Digite o valor pago. Se divergir, o app pergunta o motivo e registra. Vira um lançamento com os itens preservados." },
  { I: BellRing, t: "Veja o resultado", d: "Semana, mês, categorias, preço vs última compra. E as contas fixas avisando antes de vencer." },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-24">
      <motion.div {...aparecer} className="max-w-2xl">
        <Rotulo>Como funciona</Rotulo>
        <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Quatro passos. Nenhuma planilha.</h2>
      </motion.div>
      <ol className="mt-12 grid gap-6 md:grid-cols-4">
        {PASSOS.map((p, i) => (
          <motion.li key={p.t} {...aparecer} transition={{ ...aparecer.transition, delay: i * 0.1 }} className="relative">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[var(--l-verde)] text-[var(--l-menta)]"><p.I className="size-5" strokeWidth={2.3} /></span>
              <span className="display text-3xl font-bold text-[var(--l-verde)]/25">0{i + 1}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{p.t}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--l-tinta-2)]">{p.d}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Preços ---------- */
export function Precos() {
  return (
    <section id="precos" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div {...aparecer} className="mx-auto max-w-2xl text-center">
          <Rotulo>Preços</Rotulo>
          <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">30 dias grátis. Sem cartão. Sem pegadinha.</h2>
          <p className="mt-4 text-lg text-[var(--l-tinta-2)]">Use tudo por um mês. Se fizer diferença na sua compra, continue por menos que um café por semana.</p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <motion.div {...aparecer} className="rounded-3xl border border-black/5 bg-[var(--l-creme)] p-8">
            <p className="font-semibold">Teste</p>
            <p className="display mt-3 text-5xl font-bold">R$ 0</p>
            <p className="mt-1 text-sm text-[var(--l-tinta-2)]">por 30 dias · sem cartão</p>
            <ul className="mt-6 space-y-2.5 text-[15px]">
              {["Modo Mercado ilimitado", "Timeline semanal e visão mensal", "Contas agendadas com lembrete", "Categorias, anexos e exportação"].map((t) => (
                <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[var(--l-verde-3)]" />{t}</li>
              ))}
            </ul>
            <Link href="/cadastro" className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full border border-[var(--l-verde)] font-semibold text-[var(--l-verde)] hover:bg-[var(--l-verde)] hover:text-white">
              Começar agora
            </Link>
          </motion.div>

          <motion.div {...aparecer} transition={{ ...aparecer.transition, delay: 0.1 }} className="relative overflow-hidden rounded-3xl bg-[var(--l-verde)] p-8 text-white">
            <span className="absolute right-5 top-5 rounded-full bg-[var(--l-menta)] px-2.5 py-1 text-[11px] font-semibold text-[var(--l-verde)]">Depois do teste</span>
            <p className="font-semibold">Finan Completo</p>
            <p className="display mt-3 text-5xl font-bold">R$ 14,90<span className="text-lg font-medium text-white/60">/mês</span></p>
            <p className="mt-1 text-sm text-white/60">ou R$ 119/ano (2 meses grátis) · cancele quando quiser</p>
            <ul className="mt-6 space-y-2.5 text-[15px] text-white/85">
              {["Tudo do teste, para sempre", "Histórico de preço por item", "Insights automáticos da semana", "Conta compartilhada (em breve)"].map((t) => (
                <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-[var(--l-menta)]" />{t}</li>
              ))}
            </ul>
            <Link href="/cadastro" className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--l-menta)] font-semibold text-[var(--l-verde)] brilho-menta">
              Começar grátis por 30 dias <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const PERGUNTAS = [
  { p: "Funciona mesmo sem internet no mercado?", r: "Sim. O carrinho fica gravado no seu aparelho (IndexedDB) e o app é instalável como PWA. Quando o sinal volta, ele sincroniza sozinho — sem perder nada." },
  { p: "Preciso conectar meu banco?", r: "Não, e nem tem essa opção. O Finan é de lançamento manual rápido (menos de 10 segundos) e do carrinho no mercado. Sem Open Finance, sem senha de banco." },
  { p: "E se o total do carrinho for diferente do cupom?", r: "Ao fechar você digita o valor pago. Se divergir, o app registra a diferença e pergunta o motivo (promoção, item esquecido, erro de digitação). O lançamento fica com o valor real." },
  { p: "Consigo usar no celular e no computador?", r: "Sim. É mobile-first (feito para uma mão, em pé, sob luz forte), mas responsivo até desktop, com a mesma conta." },
  { p: "Meus dados ficam presos no app?", r: "Nunca. Exporte todos os lançamentos em CSV ou JSON a qualquer momento, no plano grátis também." },
  { p: "O que acontece quando os 30 dias acabam?", r: "Você escolhe se continua. Não pedimos cartão no cadastro, então nada é cobrado automaticamente." },
];

export function Perguntas() {
  const [aberta, setAberta] = useState<number | null>(0);
  return (
    <section id="perguntas" className="mx-auto max-w-3xl px-5 py-24">
      <motion.div {...aparecer} className="text-center">
        <Rotulo>Dúvidas</Rotulo>
        <h2 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Perguntas frequentes</h2>
      </motion.div>
      <ul className="mt-10 space-y-3">
        {PERGUNTAS.map((q, i) => {
          const on = aberta === i;
          return (
            <motion.li key={q.p} {...aparecer} transition={{ ...aparecer.transition, delay: i * 0.04 }} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
              <button type="button" onClick={() => setAberta(on ? null : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold">
                {q.p}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--l-creme)] text-[var(--l-verde)]">{on ? <Minus className="size-4" /> : <Plus className="size-4" />}</span>
              </button>
              <AnimatePresence initial={false}>
                {on ? (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}>
                    <p className="px-5 pb-5 text-[15px] leading-relaxed text-[var(--l-tinta-2)]">{q.r}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- CTA final + rodapé ---------- */
export function ChamadaFinal() {
  return (
    <section className="px-5 pb-24">
      <motion.div {...aparecer} className="grade-pontos relative mx-auto max-w-6xl overflow-hidden rounded-[40px] bg-[var(--l-verde)] px-6 py-16 text-center text-white md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--l-menta)]/20 blur-[120px]" />
        <h2 className="relative text-4xl font-bold leading-tight md:text-6xl">Na próxima ida ao mercado,<br />abra o carrinho.</h2>
        <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/70">Leva 1 minuto para criar a conta. Sem cartão, sem banco, sem planilha.</p>
        <Link href="/cadastro" className="relative mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-[var(--l-menta)] px-8 text-base font-semibold text-[var(--l-verde)] brilho-menta transition-transform hover:scale-[1.03]">
          Começar grátis por 30 dias <ArrowRight className="size-5" />
        </Link>
      </motion.div>
    </section>
  );
}

export function Rodape() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--l-tinta-2)] md:flex-row">
        <p className="flex items-center gap-2 font-semibold text-[var(--l-tinta)]">
          <span className="grid size-7 place-items-center rounded-lg bg-[var(--l-verde)] text-[var(--l-menta)]"><ShoppingCart className="size-4" strokeWidth={2.5} /></span> Finan
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-5">
          <a href="#recursos" className="hover:text-[var(--l-tinta)]">Recursos</a>
          <a href="#precos" className="hover:text-[var(--l-tinta)]">Preços</a>
          <a href="#perguntas" className="hover:text-[var(--l-tinta)]">Dúvidas</a>
          <Link href="/entrar" className="hover:text-[var(--l-tinta)]">Entrar</Link>
          <Link href="/cadastro" className="font-semibold text-[var(--l-verde)]">Criar conta</Link>
        </nav>
        <p>© {new Date().getFullYear()} Finan · Controle antes do caixa</p>
      </div>
    </footer>
  );
}
