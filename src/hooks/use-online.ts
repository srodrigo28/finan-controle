"use client";

import { useSyncExternalStore } from "react";

function assinar(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/** `true` quando o navegador reporta conexão. */
export function useOnline() {
  return useSyncExternalStore(
    assinar,
    () => navigator.onLine,
    () => true,
  );
}
