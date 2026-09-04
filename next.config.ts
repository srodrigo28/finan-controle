import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

// `output: "standalone"` é só para a imagem Docker (deploy fora da Vercel). Na Vercel ele é
// desnecessário e, no Next 16.3.x, faz o passo onBuildComplete falhar procurando
// `.next/next-server.js.nft.json` (ENOENT). A Vercel define VERCEL=1 no build.
const naVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

// Versão exibida em Configurações: ajuda no suporte ("qual versão você está usando?").
// Na Vercel vem do commit; local, do horário do build.
const versao =
  process.env.NEXT_PUBLIC_VERSAO ??
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  new Date().toISOString().slice(0, 16).replace("T", " ");

const nextConfig: NextConfig = {
  ...(naVercel ? {} : { output: "standalone" as const }),
  env: { NEXT_PUBLIC_VERSAO: versao },
  reactCompiler: true,
  // Permite abrir o dev server por 127.0.0.1 e pela rede local (teste no celular)
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.*.*", "10.*.*.*"],
};

export default withSerwist(nextConfig);
