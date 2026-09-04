"use client";

import { useAuth } from "@/stores/auth";
import { useLimite } from "@/stores/limite";
import type { ErroApi } from "@/lib/tipos";

// Em produção (Vercel) o padrão já é a API na VPS; sobrescreva com NEXT_PUBLIC_API_URL se precisar.
const PADRAO = process.env.NODE_ENV === "production" ? "https://99dev.pro/finan-controle-api" : "http://localhost:8030";
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? PADRAO).replace(/\/$/, "");
const PREFIXO = "/api/v1";

export class ErroRequisicao extends Error {
  status: number;
  codigo: string;
  detalhes?: Record<string, unknown>;
  constructor(status: number, erro: ErroApi["erro"]) {
    super(erro.mensagem);
    this.status = status;
    this.codigo = erro.codigo;
    this.detalhes = erro.detalhes;
  }
}

let renovando: Promise<string | null> | null = null;

/** Renova o access token usando o refresh token (uma chamada por vez). */
async function renovarToken(): Promise<string | null> {
  if (renovando) return renovando;
  const { refreshToken, atualizarAccess, sair } = useAuth.getState();
  if (!refreshToken) return null;
  renovando = (async () => {
    try {
      const r = await fetch(`${API_URL}${PREFIXO}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      if (!r.ok) {
        sair();
        return null;
      }
      const dados = (await r.json()) as { access_token: string };
      atualizarAccess(dados.access_token);
      return dados.access_token;
    } catch {
      return null;
    } finally {
      renovando = null;
    }
  })();
  return renovando;
}

type Opcoes = Omit<RequestInit, "body"> & { body?: unknown; semAuth?: boolean; bruto?: boolean };

/** Cliente HTTP com JWT, refresh automático e erros normalizados. */
export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { body, semAuth, bruto, headers, ...resto } = opcoes;
  const ehFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const montar = (token: string | null) => {
    const h = new Headers(headers);
    if (!ehFormData && body !== undefined) h.set("Content-Type", "application/json");
    if (!semAuth && token) h.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${PREFIXO}${caminho}`, {
      ...resto,
      headers: h,
      body: body === undefined ? undefined : ehFormData ? (body as FormData) : JSON.stringify(body),
    });
  };

  let resposta = await montar(useAuth.getState().accessToken);
  if (resposta.status === 401 && !semAuth) {
    const novo = await renovarToken();
    if (novo) resposta = await montar(novo);
  }

  if (!resposta.ok) {
    let erro: ErroApi["erro"] = { codigo: "HTTP_" + resposta.status, mensagem: resposta.statusText || "Erro na requisição" };
    try {
      const corpo = (await resposta.json()) as Partial<ErroApi>;
      if (corpo?.erro) erro = corpo.erro;
    } catch {
      /* corpo não é JSON */
    }
    // 402 = teste vencido. A folha explica o que aconteceu em vez de um toast de erro cru.
    if (resposta.status === 402 && erro.codigo === "TESTE_EXPIRADO") {
      useLimite.getState().abrir(erro.mensagem);
    }
    throw new ErroRequisicao(resposta.status, erro);
  }
  if (resposta.status === 204) return undefined as T;
  if (bruto) return (await resposta.blob()) as T;
  return (await resposta.json()) as T;
}

export function urlAnexo(id: string) {
  return `${API_URL}${PREFIXO}/anexos/${id}/arquivo`;
}
