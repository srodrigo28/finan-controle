"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bell, Download, Moon, Sun, MonitorSmartphone, Save } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { useTema, type Tema } from "@/hooks/use-tema";
import { api, API_URL } from "@/lib/api";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Campo, CampoMoeda } from "@/components/ui/campo";
import { Botao } from "@/components/ui/botao";
import { Secao, Segmentado } from "@/components/ui/diversos";
import type { Usuario } from "@/lib/tipos";

export default function PaginaConfig() {
  const { usuario, atualizarUsuario } = useAuth();
  const { tema, aplicar } = useTema();
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [mensal, setMensal] = useState(usuario?.orcamento_mensal ?? 0);
  const [diario, setDiario] = useState(usuario?.orcamento_diario ?? 0);
  const [salvando, setSalvando] = useState(false);
  const [exportando, setExportando] = useState<string | null>(null);

  const salvar = async () => {
    setSalvando(true);
    try {
      const u = await api<Usuario>("/auth/eu", { method: "PATCH", body: { nome: nome.trim(), orcamento_mensal: mensal > 0 ? mensal : null, orcamento_diario: diario > 0 ? diario : null } });
      atualizarUsuario(u);
      toast.success("Configurações salvas");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  const exportar = async (formato: "csv" | "json") => {
    setExportando(formato);
    try {
      const blob = await api<Blob>(`/exportar/lancamentos.${formato}`, { bruto: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finan-lancamentos.${formato}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível exportar");
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="space-y-6">
      <Cabecalho titulo="Configurações" voltar="/mais" />

      <Secao titulo="Perfil e orçamento">
        <div className="cartao space-y-4 p-4">
          <Campo rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Campo rotulo="E-mail" value={usuario?.email ?? ""} readOnly className="text-muted" />
          <CampoMoeda rotulo="Orçamento mensal" valor={mensal} aoMudar={setMensal} dica="Aparece na visão mensal como linha de referência." />
          <CampoMoeda rotulo="Orçamento diário" valor={diario} aoMudar={setDiario} dica="Mostra no início quanto ainda cabe hoje." />
          <Botao cheio onClick={salvar} carregando={salvando}><Save className="size-4" /> Salvar</Botao>
        </div>
      </Secao>

      {/* Push nativo desligado por ora (decisão N6b): a central no sino cobre o aviso em qualquer
          aparelho, sem permissão nem instalação. `NotificacoesPush` segue no código e as inscrições
          continuam no banco — religar é voltar o cron da VPS. */}
      <Secao titulo="Notificações">
        <div className="cartao flex items-start gap-3 p-4">
          <span className="mt-0.5 shrink-0 text-accent"><Bell className="size-5" /></span>
          <p className="text-sm text-text-2">
            Contas vencendo, orçamento estourado e o que mais precisar da sua atenção aparecem no
            <span className="font-medium text-text"> sino, no topo do Início</span> — em qualquer
            aparelho, sem precisar autorizar nada.
          </p>
        </div>
      </Secao>

      <Secao titulo="Aparência">
        <div className="cartao p-4">
          <Segmentado<Tema>
            opcoes={[
              { valor: "claro", rotulo: "Claro" },
              { valor: "escuro", rotulo: "Escuro" },
              { valor: "sistema", rotulo: "Sistema" },
            ]}
            valor={tema}
            aoMudar={aplicar}
          />
          <p className="mt-3 flex items-center gap-2 text-xs text-text-2">
            {tema === "claro" ? <Sun className="size-3.5" /> : tema === "escuro" ? <Moon className="size-3.5" /> : <MonitorSmartphone className="size-3.5" />}
            O Modo Mercado usa contraste alto em qualquer tema.
          </p>
        </div>
      </Secao>

      <Secao titulo="Seus dados">
        <div className="cartao space-y-3 p-4">
          <p className="text-sm text-text-2">Exporte todos os lançamentos. Sem paywall — o dado é seu.</p>
          <div className="flex gap-3">
            <Botao variante="secundario" cheio onClick={() => exportar("csv")} carregando={exportando === "csv"}><Download className="size-4" /> CSV</Botao>
            <Botao variante="secundario" cheio onClick={() => exportar("json")} carregando={exportando === "json"}><Download className="size-4" /> JSON</Botao>
          </div>
        </div>
      </Secao>

      <p className="px-1 text-center text-xs text-muted">Versão {process.env.NEXT_PUBLIC_VERSAO ?? "—"} · API: {API_URL}</p>
    </div>
  );
}
