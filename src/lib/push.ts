"use client";

import { api } from "@/lib/api";

export type EstadoPush = "nao_suportado" | "precisa_instalar" | "bloqueado" | "inativo" | "ativo";

function base64UrlParaUint8(b64: string) {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const bruto = atob((b64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bruto, (c) => c.charCodeAt(0));
}

export function ehIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function estaInstalado() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

export function suportaPush() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Diagnóstico para a tela: o que está impedindo (ou não) as notificações. */
export async function estadoPush(): Promise<EstadoPush> {
  if (!suportaPush()) return ehIOS() && !estaInstalado() ? "precisa_instalar" : "nao_suportado";
  if (Notification.permission === "denied") return "bloqueado";
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return sub ? "ativo" : "inativo";
}

/** Pede permissão, assina no navegador e registra o aparelho na API. */
export async function ativarPush(): Promise<void> {
  const { chave_publica, ativo } = await api<{ chave_publica: string; ativo: boolean }>("/notificacoes/vapid", { semAuth: true });
  if (!ativo || !chave_publica) throw new Error("Notificações ainda não configuradas no servidor.");
  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") throw new Error("Permissão de notificação negada.");
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlParaUint8(chave_publica) }));
  await api("/notificacoes/inscrever", { method: "POST", body: { ...sub.toJSON(), aparelho: navigator.userAgent.slice(0, 200) } });
}

export async function desativarPush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await api("/notificacoes/inscrever", { method: "DELETE", body: { endpoint: sub.endpoint } }).catch(() => {});
    await sub.unsubscribe();
  }
}

export async function testarPush(): Promise<number> {
  const r = await api<{ enviados: number }>("/notificacoes/testar", { method: "POST" });
  return r.enviados;
}
