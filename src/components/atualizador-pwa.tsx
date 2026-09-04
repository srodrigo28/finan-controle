"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Atualização silenciosa (decisões E2 · F1 · G1 · I1 · R1b).
 *
 * O service worker usa `skipWaiting`: a versão nova assume assim que é baixada, mas a página aberta
 * segue com o JavaScript antigo. A questão é **quando** recarregar.
 *
 * Só quando a pessoa volta ao app depois de um tempo fora — nunca durante o uso, porque isso cancela
 * navegação em andamento e derruba formulário sendo preenchido. E nunca dentro do Modo Mercado: quem
 * sai para responder uma mensagem no meio da compra volta para o carrinho, não para uma tela
 * recarregando. Nesse caso o reload espera a compra terminar.
 */
const SEGUNDOS_FORA = 3;

export function AtualizadorPwa() {
  const caminho = usePathname();
  const pendente = useRef(false);
  const emCompra = useRef(false);

  // Ref porque quem lê é o listener do service worker, registrado uma vez só.
  useEffect(() => {
    emCompra.current = /^\/mercado\/[^/]+/.test(caminho);
  }, [caminho]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const procurarVersaoNova = () =>
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}));

    const aoAssumir = () => {
      pendente.current = true;
    };

    let saiuEm = 0;
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") {
        saiuEm = Date.now();
        return;
      }
      procurarVersaoNova(); // G1
      if (!pendente.current || emCompra.current) return;
      if (Date.now() - saiuEm <= SEGUNDOS_FORA * 1000) return;
      if (sessionStorage.getItem("finan:recarregando") === "1") return;
      sessionStorage.setItem("finan:recarregando", "1");
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", aoAssumir);
    document.addEventListener("visibilitychange", aoMudarVisibilidade);

    // A trava vale só para o carregamento que veio do reload.
    sessionStorage.removeItem("finan:recarregando");
    procurarVersaoNova();

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", aoAssumir);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
    };
  }, []);

  return null;
}
