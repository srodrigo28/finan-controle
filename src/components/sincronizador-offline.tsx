"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { sincronizarSessoes } from "@/lib/sincronizacao";
import { useOnline } from "@/hooks/use-online";

/** Dispara a sincronização do carrinho quando a rede volta ou o app ganha foco. */
export function SincronizadorOffline() {
  const usuario = useAuth((s) => s.usuario);
  const online = useOnline();
  const qc = useQueryClient();

  useEffect(() => {
    if (!usuario || !online) return;
    let cancelado = false;
    const rodar = async () => {
      try {
        const r = await sincronizarSessoes(usuario.id);
        if (!cancelado && r.enviadas > 0) {
          toast.success(`${r.enviadas} compra${r.enviadas > 1 ? "s" : ""} sincronizada${r.enviadas > 1 ? "s" : ""}`);
          qc.invalidateQueries({ queryKey: ["lancamentos"] });
          qc.invalidateQueries({ queryKey: ["metricas"] });
        }
      } catch {
        /* tenta de novo no próximo evento */
      }
    };
    rodar();
    const aoFocar = () => rodar();
    window.addEventListener("focus", aoFocar);
    const intervalo = window.setInterval(rodar, 60_000);
    return () => {
      cancelado = true;
      window.removeEventListener("focus", aoFocar);
      window.clearInterval(intervalo);
    };
  }, [usuario, online, qc]);

  return null;
}
