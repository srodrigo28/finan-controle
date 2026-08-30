"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Mail, Lock, User } from "lucide-react";
import { api, ErroRequisicao } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { Botao } from "@/components/ui/botao";
import { Campo } from "@/components/ui/campo";
import type { Usuario } from "@/lib/tipos";

type Resposta = { usuario: Usuario; access_token: string; refresh_token: string };

export function FormularioAuth({ modo }: { modo: "entrar" | "cadastro" }) {
  const roteador = useRouter();
  const params = useSearchParams();
  const entrar = useAuth((s) => s.entrar);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const r = await api<Resposta>(modo === "entrar" ? "/auth/login" : "/auth/registrar", {
        method: "POST",
        semAuth: true,
        body: modo === "entrar" ? { email, senha } : { nome, email, senha },
      });
      entrar(r);
      const proximo = params.get("proximo");
      roteador.replace(modo === "cadastro" ? "/onboarding" : proximo && proximo.startsWith("/") ? proximo : "/inicio");
    } catch (err) {
      const detalhe = err instanceof ErroRequisicao && err.detalhes ? Object.values(err.detalhes).find((v) => typeof v === "string") : null;
      const msg = err instanceof ErroRequisicao ? (typeof detalhe === "string" ? detalhe : err.message) : "Não foi possível conectar. Tente novamente.";
      setErro(msg);
      toast.error(msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <motion.form
      onSubmit={enviar}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
        {modo === "entrar" ? "Bem-vindo de volta" : "Saiba o total antes do caixa"}
      </h1>
      <p className="mt-2 text-text-2">
        {modo === "entrar"
          ? "Entre para continuar controlando seus gastos."
          : "Crie sua conta em segundos. Seus dados são seus — exporte quando quiser."}
      </p>

      <div className="mt-8 space-y-4">
        {modo === "cadastro" ? (
          <Campo rotulo="Nome" placeholder="Como quer ser chamado" value={nome} onChange={(e) => setNome(e.target.value)} required autoComplete="name" prefixo={<User className="size-4" />} />
        ) : null}
        <Campo rotulo="E-mail" type="email" placeholder="voce@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" prefixo={<Mail className="size-4" />} />
        <Campo
          rotulo="Senha"
          type="password"
          placeholder={modo === "cadastro" ? "Mínimo 8 caracteres" : "Sua senha"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          minLength={8}
          autoComplete={modo === "cadastro" ? "new-password" : "current-password"}
          prefixo={<Lock className="size-4" />}
          erro={erro ?? undefined}
        />
      </div>

      <div className="mt-auto pt-8">
        <Botao type="submit" tamanho="lg" cheio carregando={carregando}>
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </Botao>
        <p className="mt-4 text-center text-sm text-text-2">
          {modo === "entrar" ? (
            <>
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-medium text-accent">
                Criar agora
              </Link>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <Link href="/entrar" className="font-medium text-accent">
                Entrar
              </Link>
            </>
          )}
        </p>
      </div>
    </motion.form>
  );
}
