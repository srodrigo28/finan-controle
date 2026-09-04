/**
 * Ciclo completo de contas agendadas (headless): criar → editar → ajustar mês → pular →
 * detalhe → arquivar → reativar → excluir. Uso: node e2e/contas.mjs [baseURL]
 * Precisa da API no ar. Screenshots em e2e/capturas/contas-*.png.
 */
import { chromium, devices } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:3001";
mkdirSync("e2e/capturas", { recursive: true });

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ ...devices["Pixel 7"], locale: "pt-BR", colorScheme: "dark" });
ctx.setDefaultTimeout(30000);
const page = await ctx.newPage();
const shot = (nome) => page.screenshot({ path: `e2e/capturas/contas-${nome}.png` });
const erros = [];
page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && erros.push(`console: ${m.text()}`));

const ok = (cond, msg) => {
  if (!cond) throw new Error(`FALHOU: ${msg}`);
  console.log(`  ok · ${msg}`);
};

// Cadastro
const email = `contas-${Date.now()}@exemplo.com.br`;
await page.goto(`${base}/cadastro`);
await page.getByPlaceholder("Como quer ser chamado").fill("Rodrigo Teste");
await page.getByPlaceholder("voce@exemplo.com").fill(email);
await page.getByPlaceholder("Mínimo 8 caracteres").fill("senha12345");
await page.getByRole("button", { name: "Criar conta" }).click();
await page.waitForURL("**/onboarding");
await page.goto(`${base}/contas`);
await page.waitForTimeout(800);

console.log("1. criar conta mensal");
await page.getByRole("button", { name: "Nova conta" }).click();
await page.getByPlaceholder("Ex.: Energia, Internet, Aluguel").fill("Energia");
await page.locator('input[inputmode="numeric"]').first().fill("18000");
await page.getByRole("button", { name: "Salvar" }).click();
await page.waitForTimeout(1200);
await shot("01-mes");
ok((await page.getByRole("button", { name: /^Energia/ }).count()) === 1, "conta aparece no mês");

console.log("2. criar conta anual (mês de referência)");
await page.getByRole("button", { name: "Nova conta" }).click();
await page.getByPlaceholder("Ex.: Energia, Internet, Aluguel").fill("IPVA");
await page.locator('input[inputmode="numeric"]').first().fill("90000");
await page.getByRole("button", { name: "Anual" }).click();
await shot("02-anual");
const mesVisivel = await page.getByRole("button", { name: "jan", exact: true }).isVisible();
ok(mesVisivel, "seletor de mês aparece para recorrência anual");
await page.getByRole("button", { name: "jan", exact: true }).click();
await page.getByRole("button", { name: "Salvar" }).click();
await page.waitForTimeout(1200);

console.log("3. aba Cadastradas + filtro");
await page.getByRole("tab", { name: "Cadastradas" }).click();
await page.waitForTimeout(600);
await shot("03-cadastradas");
ok(await page.getByText(/Anual · \d+ de jan/).isVisible(), "resumo da anual mostra o mês");

console.log("4. detalhe da conta");
await page.getByRole("link", { name: /Energia/ }).click();
await page.waitForURL(/\/contas\/[0-9a-f-]+$/);
await page.waitForTimeout(900);
await shot("04-detalhe");
ok(await page.getByRole("heading", { name: "Energia" }).isVisible(), "abriu o detalhe");
ok(await page.getByText("Histórico").isVisible(), "detalhe tem histórico");

console.log("5. arquivar pelo detalhe");
await page.getByRole("button", { name: "Arquivar conta" }).click();
await page.waitForTimeout(500);
await shot("05-confirmar-arquivar");
await page.getByRole("button", { name: "Arquivar", exact: true }).click();
await page.waitForTimeout(1200);
ok(await page.getByText("Arquivada", { exact: true }).isVisible(), "detalhe marca como arquivada");

await page.goto(`${base}/contas`);
await page.waitForTimeout(1000);
ok((await page.getByRole("button", { name: /^Energia/ }).count()) === 0, "arquivada sumiu do mês");

console.log("6. reativar pela lista");
await page.getByRole("tab", { name: "Cadastradas" }).click();
await page.getByRole("tab", { name: "Arquivadas" }).click();
await page.waitForTimeout(600);
await shot("06-arquivadas");
ok(await page.getByRole("link", { name: /Energia/ }).isVisible(), "aparece no filtro Arquivadas");
await page.getByRole("button", { name: /Ações de Energia/ }).click();
await page.waitForTimeout(500);
await shot("07-acoes");
await page.getByRole("button", { name: "Reativar" }).click();
await page.waitForTimeout(1200);
ok(await page.getByRole("tab", { name: "Ativas" }).isVisible(), "voltou para as ativas");

console.log("7. ajustar e pular o mês");
await page.getByRole("tab", { name: "Este mês" }).click();
await page.waitForTimeout(1000);
await page.getByRole("button", { name: /Energia/ }).first().click();
await page.waitForTimeout(700);
await shot("08-ocorrencia");
await page.getByRole("button", { name: "Pular este mês" }).click();
await page.waitForTimeout(1200);
await shot("09-pulada");
ok(await page.getByText(/Pulada/).isVisible(), "mês marcado como pulado");
const totalPulado = await page.locator("section.cartao").first().innerText();
ok(/0,00/.test(totalPulado), `pulada saiu do total pendente (${totalPulado.split("\n")[1]})`);

console.log("8. excluir de vez");
await page.getByRole("tab", { name: "Cadastradas" }).click();
await page.waitForTimeout(600);
await page.getByRole("button", { name: /Ações de Energia/ }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Excluir", exact: true }).click();
await page.waitForTimeout(500);
await shot("10-confirmar-excluir");
await page.getByRole("button", { name: "Excluir de vez" }).click();
await page.waitForTimeout(1500);
await shot("11-final");
ok((await page.getByRole("link", { name: /Energia/ }).count()) === 0, "conta excluída sumiu da lista");

if (erros.length) {
  console.log("\nErros de console/página:");
  for (const e of erros) console.log(" -", e);
}
console.log(`\n${erros.length === 0 ? "TUDO OK" : "OK com erros de console"} — capturas em e2e/capturas/contas-*.png`);
await navegador.close();
