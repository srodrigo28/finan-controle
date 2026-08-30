/**
 * Fluxo ponta a ponta (headless): cadastro → onboarding → Modo Mercado → itens → fechar → início.
 * Uso: node e2e/fluxo.mjs [baseURL]   (padrão http://127.0.0.1:3001; API precisa estar no ar)
 * Salva screenshots em e2e/capturas/.
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:3001";
mkdirSync("e2e/capturas", { recursive: true });
const shot = (page, nome) => page.screenshot({ path: `e2e/capturas/${nome}.png`, fullPage: false });

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ ...devices["Pixel 7"], locale: "pt-BR", colorScheme: "dark" });
ctx.setDefaultTimeout(40000); ctx.setDefaultNavigationTimeout(40000);
const page = await ctx.newPage();
const erros = [];
page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && erros.push(`console: ${m.text()}`));

const email = `e2e-${Date.now()}@exemplo.com.br`;

// 1. Cadastro
await page.goto(`${base}/cadastro`);
await page.getByPlaceholder("Como quer ser chamado").fill("Rodrigo Teste");
await page.getByPlaceholder("voce@exemplo.com").fill(email);
await page.getByPlaceholder("Mínimo 8 caracteres").fill("senha12345");
await shot(page, "01-cadastro");
await page.getByRole("button", { name: "Criar conta" }).click();
await page.waitForURL("**/onboarding", { timeout: 40000 });

// 2. Onboarding
await page.getByPlaceholder("0,00").fill("300000");
await shot(page, "02-onboarding-orcamento");
await page.getByRole("button", { name: /Continuar/ }).click();
await page.waitForTimeout(600);
await shot(page, "03-onboarding-categorias");
await page.getByRole("button", { name: /Continuar/ }).click();
await page.waitForTimeout(600);
await shot(page, "04-onboarding-pronto");
await page.getByRole("button", { name: /Abrir Modo Mercado/ }).click();
await page.waitForURL("**/mercado?abrir=1");
await page.waitForTimeout(800);

// 3. Nova compra
await shot(page, "05-mercado-nova-compra");
await page.getByPlaceholder("Ex.: Atacadão, feira…").fill("Atacadão");
await page.locator('input[placeholder="0,00"]').fill("25000");
await page.getByRole("button", { name: /Começar/ }).click();
await page.waitForURL(/\/mercado\/[0-9a-f-]+$/);
await page.waitForTimeout(600);
await shot(page, "06-carrinho-vazio");

// 4. Itens
const itens = [
  ["Arroz 5kg", "2490", 2],
  ["Feijão 1kg", "890", 3],
  ["Detergente", "299", 1],
  ["Picanha kg", "7990", 1],
  ["Cerveja lata", "450", 12],
];
for (const [desc, preco, qtd] of itens) {
  await page.getByRole("button", { name: /^Adicionar$/ }).click();
  await page.getByPlaceholder("Ex.: arroz 5kg").fill(desc);
  await page.locator('input[inputmode="numeric"]').fill(preco);
  for (let i = 1; i < qtd; i++) await page.getByRole("button", { name: "Aumentar" }).click();
  if (desc === "Arroz 5kg") await shot(page, "07-adicionar-item");
  await page.getByRole("button", { name: /^Adicionar/ }).last().click();
  await page.waitForTimeout(350);
}
await page.waitForTimeout(700);
await shot(page, "08-carrinho-cheio");

// Filtro por categoria (se houver mais de uma)
const chips = page.getByRole("button", { name: /Sem categoria|Mercado|Todas/ });
if ((await chips.count()) > 1) {
  await chips.nth(1).click();
  await page.waitForTimeout(400);
  await shot(page, "09-carrinho-filtrado");
  await chips.first().click();
}

// 5. Fechar
await page.getByRole("link", { name: "Fechar" }).click();
await page.waitForURL(/\/fechar$/);
await page.waitForTimeout(500);
await shot(page, "10-fechar-conferencia");
await page.locator('input[inputmode="numeric"]').fill("15900");
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Promoção/ }).click();
await shot(page, "11-fechar-divergencia");
await page.getByRole("button", { name: /^Confirmar/ }).click();
await page.waitForTimeout(900);
await shot(page, "12-fechado");
await page.waitForURL(`${base}/`, { timeout: 40000 });
await page.waitForTimeout(1200);
await shot(page, "13-inicio");

// 6. Outras telas
for (const [rota, nome] of [["/lancamentos", "14-lancamentos"], ["/semana", "15-semana"], ["/mes", "16-mes"], ["/contas", "17-contas"], ["/categorias", "18-categorias"], ["/config", "19-config"]]) {
  await page.goto(`${base}${rota}`);
  await page.waitForTimeout(1200);
  await shot(page, nome);
}

// Detalhe do lançamento gerado
await page.goto(`${base}/lancamentos`);
await page.waitForTimeout(1000);
await page.getByRole("link", { name: /Atacadão|Compra/ }).first().click();
await page.waitForTimeout(1000);
await shot(page, "20-detalhe-lancamento");

// Tema claro
await ctx.close();
const ctxClaro = await navegador.newContext({ ...devices["Pixel 7"], locale: "pt-BR", colorScheme: "light" });
ctxClaro.setDefaultTimeout(40000); ctxClaro.setDefaultNavigationTimeout(40000);
const p2 = await ctxClaro.newPage();
await p2.goto(`${base}/entrar`);
await p2.getByPlaceholder("voce@exemplo.com").fill(email);
await p2.getByPlaceholder("Sua senha").fill("senha12345");
await p2.getByRole("button", { name: "Entrar" }).click();
await p2.waitForURL(`${base}/`);
await p2.waitForTimeout(1500);
await shot(p2, "21-inicio-claro");
await p2.goto(`${base}/mercado`);
await p2.waitForTimeout(1200);
await shot(p2, "22-mercado-claro");

await navegador.close();
console.log(erros.length ? `ERROS (${erros.length}):\n${erros.join("\n")}` : "Fluxo completo sem erros de página.");
process.exit(erros.length ? 1 : 0);
