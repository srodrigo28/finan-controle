/**
 * Metade em Node do teste de deploy — quem orquestra é `e2e/deploy.sh`.
 * Abre o app na versão A, espera o sinal de que a versão B subiu, simula a pessoa saindo e voltando,
 * e confere se a versão na tela mudou sozinha. Precisa da API local no ar.
 */
import { chromium, devices } from "playwright";
import { writeFileSync, existsSync } from "node:fs";

const base = "http://127.0.0.1:3001";
const API = "http://127.0.0.1:8030/api/v1";
const LIMPO = " · API: http://127.0.0.1:8030";

const s = await (await fetch(`${API}/auth/registrar`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Deploy Teste", email: `deploy-${Date.now()}@exemplo.com.br`, senha: "senha12345" }),
})).json();

const nav = await chromium.launch();
const ctx = await nav.newContext({ ...devices["Pixel 7"], locale: "pt-BR", colorScheme: "dark" });
const page = await ctx.newPage();
await page.addInitScript((d) => localStorage.setItem("finan:auth", JSON.stringify({
  state: { usuario: d.usuario, accessToken: d.access_token, refreshToken: d.refresh_token }, version: 0 })), s);

await page.goto(`${base}/config`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const versaoA = (await page.getByText(/Versão .* · API:/).innerText()).replace(LIMPO, "");
console.log(`1. app aberto na ${versaoA}`);

await page.waitForTimeout(2500);
console.log(`   service worker controlando a página: ${await page.evaluate(() => !!navigator.serviceWorker.controller)}`);

writeFileSync("e2e/.pronto-para-deploy", "1");
for (let i = 0; i < 240 && !existsSync("e2e/.deploy-feito"); i++) await page.waitForTimeout(1000);
console.log("2. versão B publicada com o app aberto");

// a pessoa sai do app e volta depois de mais de 3 segundos
const visibilidade = (valor) => page.evaluate((v) => {
  Object.defineProperty(document, "visibilityState", { value: v, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}, valor);
await visibilidade("hidden");
await page.waitForTimeout(4000);
await visibilidade("visible");

let versaoB = versaoA;
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(1000);
  try {
    versaoB = (await page.getByText(/Versão .* · API:/).innerText({ timeout: 2000 })).replace(LIMPO, "");
    if (versaoB !== versaoA) break;
  } catch {
    /* recarregando */
  }
}
console.log(`3. depois de sair e voltar: ${versaoB}`);
console.log(versaoA !== versaoB ? "RESULTADO OK - versao nova entrou sozinha, sem reinstalar" : "RESULTADO FALHOU - continuou na versao antiga");
await nav.close();
process.exit(versaoA !== versaoB ? 0 : 1);
