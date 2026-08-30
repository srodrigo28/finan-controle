"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, BellOff, BellRing, Share, Smartphone } from "lucide-react";
import { Botao } from "@/components/ui/botao";
import { ativarPush, desativarPush, estadoPush, testarPush, ehIOS, type EstadoPush } from "@/lib/push";

/** Card de notificações (Configurações): diagnóstico, ativar/desativar e enviar teste. */
export function NotificacoesPush() {
  const [estado, setEstado] = useState<EstadoPush | "carregando">("carregando");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let ativo = true;
    estadoPush().then((e) => ativo && setEstado(e));
    return () => {
      ativo = false;
    };
  }, []);

  const alternar = async () => {
    setOcupado(true);
    try {
      if (estado === "ativo") {
        await desativarPush();
        toast("Notificações desativadas neste aparelho");
      } else {
        await ativarPush();
        toast.success("Notificações ativadas! Você recebe lembretes antes do vencimento.");
      }
      setEstado(await estadoPush());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível ativar");
      setEstado(await estadoPush());
    } finally {
      setOcupado(false);
    }
  };

  const enviarTeste = async () => {
    setOcupado(true);
    try {
      const n = await testarPush();
      toast.success(n > 0 ? "Teste enviado — deve aparecer em instantes" : "Nenhum aparelho inscrito");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao enviar");
    } finally {
      setOcupado(false);
    }
  };

  if (estado === "carregando") return <div className="cartao h-24 animate-pulse" />;

  if (estado === "precisa_instalar") {
    return (
      <div className="cartao space-y-2 p-4">
        <p className="flex items-center gap-2 font-medium"><Smartphone className="size-4 text-accent" /> Instale o app para receber notificações</p>
        <p className="text-sm text-text-2">
          No iPhone, toque em <Share className="inline size-3.5" /> <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong>. Depois abra o Finan pelo ícone e volte aqui para ativar.
        </p>
      </div>
    );
  }

  if (estado === "nao_suportado") {
    return (
      <div className="cartao p-4 text-sm text-text-2">
        <p className="flex items-center gap-2 font-medium text-text"><BellOff className="size-4" /> Este navegador não suporta notificações</p>
        <p className="mt-1">Use o Chrome no Android ou instale o app na tela inicial.</p>
      </div>
    );
  }

  return (
    <div className="cartao space-y-3 p-4">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${estado === "ativo" ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted"}`}>
          {estado === "ativo" ? <BellRing className="size-5" /> : <Bell className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Lembretes de vencimento</p>
          <p className="text-xs text-text-2">
            {estado === "ativo"
              ? "Ativo neste aparelho. Aviso diário das contas que vencem nos próximos dias."
              : estado === "bloqueado"
                ? "Bloqueado nas configurações do navegador. Libere em Site → Notificações."
                : "Receba um aviso antes de cada conta vencer — mesmo com o app fechado."}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Botao variante={estado === "ativo" ? "secundario" : "primario"} cheio onClick={alternar} carregando={ocupado} disabled={estado === "bloqueado"}>
          {estado === "ativo" ? "Desativar" : "Ativar notificações"}
        </Botao>
        {estado === "ativo" ? (
          <Botao variante="contorno" onClick={enviarTeste} carregando={ocupado}>Testar</Botao>
        ) : null}
      </div>
      {ehIOS() ? <p className="text-[11px] text-muted">No iPhone as notificações só chegam com o app instalado na tela inicial (iOS 16.4+).</p> : null}
    </div>
  );
}
