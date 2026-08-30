import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finan — controle antes do caixa",
    short_name: "Finan",
    description: "Controle financeiro pessoal com Modo Mercado: saiba o total antes de chegar no caixa.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0e0f",
    theme_color: "#0b0e0f",
    lang: "pt-BR",
    categories: ["finance", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Modo Mercado", url: "/mercado?abrir=1", description: "Abrir uma nova sessão de compra" },
      { name: "Novo lançamento", url: "/lancamentos/novo" },
    ],
  };
}
