import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Permite abrir o dev server por 127.0.0.1 e pela rede local (teste no celular)
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.*.*", "10.*.*.*"],
};

export default withSerwist(nextConfig);
