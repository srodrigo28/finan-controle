"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Usuario } from "@/lib/tipos";

type EstadoAuth = {
  usuario: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;
  entrar: (dados: { usuario: Usuario; access_token: string; refresh_token: string }) => void;
  atualizarAccess: (token: string) => void;
  atualizarUsuario: (usuario: Usuario) => void;
  sair: () => void;
};

/** Sessão do usuário persistida em localStorage (o app precisa abrir offline). */
export const useAuth = create<EstadoAuth>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      entrar: ({ usuario, access_token, refresh_token }) =>
        set({ usuario, accessToken: access_token, refreshToken: refresh_token }),
      atualizarAccess: (token) => set({ accessToken: token }),
      atualizarUsuario: (usuario) => set({ usuario }),
      sair: () => set({ usuario: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "finan:auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ usuario: s.usuario, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    },
  ),
);

/** `true` depois que o estado persistido foi lido do localStorage (evita flash de tela de login). */
export function useAuthHidratado() {
  return useSyncExternalStore(
    (cb) => useAuth.persist.onFinishHydration(cb),
    () => useAuth.persist.hasHydrated(),
    () => false,
  );
}
