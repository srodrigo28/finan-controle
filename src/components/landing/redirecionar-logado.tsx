"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useAuthHidratado } from "@/stores/auth";

/** Quem já tem sessão não precisa da landing: vai direto para o app. */
export function RedirecionarLogado() {
  const usuario = useAuth((s) => s.usuario);
  const hidratado = useAuthHidratado();
  const roteador = useRouter();
  useEffect(() => {
    if (hidratado && usuario) roteador.replace("/inicio");
  }, [hidratado, usuario, roteador]);
  return null;
}
