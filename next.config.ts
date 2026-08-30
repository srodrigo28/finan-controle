import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

// `output: "standalone"` é só para a imagem Docker (deploy fora da Vercel). Na Vercel ele é
// desnecessário e, no Next 16.3.x, faz o passo onBuildComplete falhar procurando
// `.next/next-server.js.nft.json` (ENOENT). A Vercel define VERCEL=1 no build.
const naVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

const nextConfig: NextConfig = {
  ...(naVercel ? {} : { output: "standalone" as const }),
  reactCompiler: true,
  // Permite abrir o dev server por 127.0.0.1 e pela rede local (teste no celular)
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.*.*", "10.*.*.*"],
};

export default withSerwist(nextConfig);
