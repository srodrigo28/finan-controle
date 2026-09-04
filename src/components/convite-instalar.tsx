"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Share, Plus, X } from "lucide-react";
import { useInstalacao } from "@/hooks/use-instalacao";
import { Folha } from "@/components/ui/folha";
import { Botao } from "@/components/ui/botao";

/**
 * Banner discreto no rodapé (A1) que vira folha com o passo a passo no iPhone (B1). No iOS a folha
 * **nunca** abre sozinha — só ao tocar no banner (R2a): ela cobre a tela e apareceria a cada acesso.
 */
export function ConviteInstalar() {
  const caminho = usePathname();
  const { podeConvidar, precisaDePassoAPasso, instalar, dispensar } = useInstalacao();
  const [passoAPasso, setPassoAPasso] = useState(false);

  // J3: durante uma compra a tela é sagrada.
  const emCompra = /^\/mercado\/[^/]+/.test(caminho);
  if (!podeConvidar || emCompra) return null;

  const aoTocar = async () => {
    if (precisaDePassoAPasso) return setPassoAPasso(true);
    const r = await instalar();
    if (r === "sem-prompt") setPassoAPasso(true);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+var(--safe-b))] z-30 md:bottom-4 md:pl-60">
        <div className="mx-auto max-w-lg px-4 md:max-w-3xl md:px-8">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-card">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Download className="size-4.5" />
            </span>
            <button type="button" onClick={aoTocar} className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium">Instalar o Finan</p>
              <p className="truncate text-xs text-text-2">Abre direto da tela de início, sem navegador</p>
            </button>
            <Botao tamanho="sm" onClick={aoTocar}>Instalar</Botao>
            <button type="button" aria-label="Agora não" onClick={dispensar} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2">
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <Folha aberta={passoAPasso} aoMudar={setPassoAPasso} titulo="Instalar no iPhone" descricao="São dois toques — o Safari não tem botão automático.">
        <ol className="space-y-3">
          {[
            { icone: <Share className="size-5" />, texto: "Toque em Compartilhar, na barra de baixo do Safari" },
            { icone: <Plus className="size-5" />, texto: 'Role e escolha "Adicionar à Tela de Início"' },
            { icone: <Download className="size-5" />, texto: "Confirme — o Finan vira um app na sua tela" },
          ].map((passo, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface text-accent">{passo.icone}</span>
              <p className="text-sm">
                <span className="mr-1.5 font-semibold text-text-2">{i + 1}.</span>
                {passo.texto}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-text-2">
          Instalado, o app abre em tela cheia e passa a receber os lembretes de conta.
        </p>
        <Botao tamanho="lg" cheio variante="secundario" className="mt-4" onClick={() => setPassoAPasso(false)}>
          Entendi
        </Botao>
      </Folha>
    </>
  );
}
