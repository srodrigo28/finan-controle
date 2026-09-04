"use client";

import { useEffect, useRef } from "react";

/**
 * Atualização silenciosa (decisões E2 · F1 · G1 · I1 · R1b).
 *
 * O service worker usa `skipWaiting`: a versão nova assume assim que é baixada, mas a página aberta
 * segue com o JavaScript antigo. A questão é **quando** recarregar.
 *
 * Só num momento: quando a pessoa volta ao app depois de um tempo fora. Recarregar durante o uso
 * cancela navegação em andamento e derruba formulário sendo preenchido — o teste ponta a ponta pegou
 * exatamente isso. Se ela nunca sair do app, a versão nova entra na próxima abertura, que é o
 * comportamento de qualquer app.
 */
const SEGUNDOS_FORA = 3;

export function AtualizadorPwa() {
  const pendente = useRef(false);
  const saiuEm = useRef(0);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const procurarVersaoNova = () =>
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}));

    const aoAssumir = () => {
      pendente.current = true;
    };

    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") {
        saiuEm.current = Date.now();
        return;
      }
      // Voltou: procura versão nova (G1) e aplica a que já estava esperando (F1).
      procurarVersaoNova();
      const foraTempoSuficiente = Date.now() - saiuEm.current > SEGUNDOS_FORA * 1000;
      if (!pendente.current || !foraTempoSuficiente) return;
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
