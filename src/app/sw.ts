/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

// Service worker: pré-cache do shell do app + fallback offline para navegação.
// O carrinho do Modo Mercado vive no IndexedDB (Dexie), então continua funcionando sem rede.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// ---------- Web Push (lembretes de vencimento) ----------
type CargaPush = { titulo?: string; corpo?: string; url?: string; tag?: string };

self.addEventListener("push", (evento) => {
  let carga: CargaPush = {};
  try {
    carga = evento.data?.json() ?? {};
  } catch {
    carga = { corpo: evento.data?.text() ?? "" };
  }
  const titulo = carga.titulo ?? "Finan";
  evento.waitUntil(
    self.registration.showNotification(titulo, {
      body: carga.corpo ?? "",
      tag: carga.tag ?? "finan",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: carga.url ?? "/inicio" },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const destino = new URL((evento.notification.data as { url?: string })?.url ?? "/inicio", self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas.find((j) => "focus" in j);
      if (aberta) {
        aberta.navigate(destino);
        return aberta.focus();
      }
      return self.clients.openWindow(destino);
    }),
  );
});
