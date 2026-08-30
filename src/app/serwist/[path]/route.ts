import { createSerwistRoute } from "@serwist/turbopack";

// Gera /serwist/sw.js no build. A revisão muda a cada build para invalidar o pré-cache.
const revision = process.env.BUILD_ID ?? crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});
