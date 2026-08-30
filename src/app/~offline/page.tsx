import { WifiOff } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Sem conexão" };

export default function PaginaOffline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-accent-soft text-accent">
        <WifiOff className="size-8" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Você está offline</h1>
      <p className="max-w-xs text-text-2">
        O carrinho do Modo Mercado continua funcionando. O restante sincroniza quando o sinal voltar.
      </p>
      <Link href="/mercado" className="rounded-full bg-accent px-5 py-3 font-medium text-accent-fg">
        Abrir Modo Mercado
      </Link>
    </main>
  );
}
