"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

const dia = (d: Date) => format(d, "yyyy-MM-dd");

/**
 * Data corrente que se mantém correta sozinha. Um PWA instalado é suspenso, não fechado: sem isto,
 * abrir na terça e voltar na quinta deixa a tela na terça. Atualiza ao voltar para o primeiro plano
 * e na virada da meia-noite — e só troca a referência quando o dia realmente muda, para não
 * disparar renderização à toa.
 */
export function useHoje() {
  const [hoje, setHoje] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const atualizar = () => setHoje((atual) => (dia(atual) === dia(new Date()) ? atual : new Date()));

    const aoVoltar = () => {
      if (document.visibilityState === "visible") atualizar();
    };

    // Um timeout por vez, sempre mirando a próxima meia-noite (+1s de folga).
    const agendarViradaDoDia = () => {
      const agora = new Date();
      const proxima = new Date(agora);
      proxima.setHours(24, 0, 1, 0);
      timer = setTimeout(() => {
        atualizar();
        agendarViradaDoDia();
      }, proxima.getTime() - agora.getTime());
    };

    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("focus", atualizar);
    agendarViradaDoDia();

    return () => {
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("focus", atualizar);
      clearTimeout(timer);
    };
  }, []);

  return hoje;
}

/** O mesmo relógio, já no formato `yyyy-MM-dd` que a API usa. */
export function useHojeISO() {
  return dia(useHoje());
}
