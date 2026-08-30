"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useAuthHidratado } from "@/stores/auth";
import { BarraAbas } from "@/components/layout/barra-abas";
import { useOnline } from "@/hooks/use-online";
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/** Área autenticada: guarda de sessão + navegação. Sem tab bar dentro do carrinho ativo. */
export default function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = useAuth((s) => s.usuario);
  const hidratado = useAuthHidratado();
  const roteador = useRouter();
  const caminho = usePathname();
  const online = useOnline();

  useEffect(() => {
    if (hidratado && !usuario) roteador.replace(`/entrar?proximo=${encodeURIComponent(caminho)}`);
  }, [hidratado, usuario, roteador, caminho]);

  if (!hidratado || !usuario) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="size-8 animate-pulse rounded-xl bg-accent-soft" />
      </div>
    );
  }

  const imersivo = /^\/mercado\/[^/]+/.test(caminho);

  return (
    <div className="min-h-dvh md:pl-60">
      <AnimatePresence>
        {!online ? (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed inset-x-0 top-0 z-40 flex items-center justify-center gap-2 bg-warn px-3 py-1.5 text-xs font-medium text-black"
            style={{ paddingTop: "calc(0.375rem + var(--safe-t))" }}
          >
            <WifiOff className="size-3.5" /> Offline — o carrinho continua funcionando
          </motion.div>
        ) : null}
      </AnimatePresence>
      <main className={imersivo ? "mx-auto w-full max-w-lg md:max-w-2xl" : "mx-auto w-full max-w-lg px-4 pb-28 md:max-w-3xl md:px-8 md:pb-12"}>
        {children}
      </main>
      {!imersivo ? <BarraAbas /> : null}
    </div>
  );
}
