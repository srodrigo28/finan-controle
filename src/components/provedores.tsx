"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { SerwistProvider } from "@serwist/turbopack/react";
import { SincronizadorOffline } from "@/components/sincronizador-offline";

export function Provedores({ children }: { children: React.ReactNode }) {
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            // O app volta do segundo plano mostrando dado de dias atrás se não revalidar aqui.
            // Com staleTime de 30s isso não vira tempestade de requisição.
            refetchOnWindowFocus: true,
            networkMode: "offlineFirst",
          },
          mutations: { networkMode: "offlineFirst" },
        },
      }),
  );

  return (
    <SerwistProvider swUrl="/serwist/sw.js">
      <QueryClientProvider client={cliente}>
        {children}
        <SincronizadorOffline />
        <Toaster position="top-center" richColors closeButton toastOptions={{ className: "font-sans" }} />
      </QueryClientProvider>
    </SerwistProvider>
  );
}
