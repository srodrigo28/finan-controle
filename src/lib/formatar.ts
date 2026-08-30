import { format, parseISO, isToday, isYesterday, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const fmtNum = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function moeda(valor: number | null | undefined) {
  return fmtBRL.format(valor ?? 0);
}

/** Separa "R$ 1.234", "56" para tipografia com centavos menores. */
export function moedaPartes(valor: number | null | undefined) {
  const texto = fmtNum.format(Math.abs(valor ?? 0));
  const [inteiro, centavos] = texto.split(",");
  return { sinal: (valor ?? 0) < 0 ? "−" : "", inteiro, centavos };
}

export function pct(valor: number | null | undefined, casas = 0) {
  if (valor === null || valor === undefined) return "—";
  return `${valor > 0 ? "+" : ""}${valor.toFixed(casas).replace(".", ",")}%`;
}

export function hojeISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function dataCurta(iso: string) {
  return format(parseISO(iso), "dd MMM", { locale: ptBR });
}

export function dataLonga(iso: string) {
  const t = format(parseISO(iso), "EEEE, d 'de' MMMM", { locale: ptBR });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function dataRelativa(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  const dif = differenceInCalendarDays(new Date(), d);
  if (dif < 7) return format(d, "EEEE", { locale: ptBR });
  return format(d, "d 'de' MMM", { locale: ptBR });
}

export function mesExtenso(yyyyMM: string) {
  return format(parseISO(`${yyyyMM}-01`), "MMMM yyyy", { locale: ptBR });
}

export function horaCurta(iso: string) {
  return format(parseISO(iso), "HH:mm");
}

/** Converte texto digitado (ex.: "12,50" ou "1.234,5") para número. */
export function parseValor(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : 0;
}

/** Máscara para digitação de moeda: dígitos viram centavos ("1250" → "12,50"). */
export function mascaraCentavos(digitos: string) {
  const apenas = digitos.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  const n = parseInt(apenas || "0", 10) / 100;
  return { valor: n, texto: fmtNum.format(n) };
}

export const FORMAS_PAGAMENTO: { valor: string; rotulo: string }[] = [
  { valor: "pix", rotulo: "Pix" },
  { valor: "debito", rotulo: "Débito" },
  { valor: "credito", rotulo: "Crédito" },
  { valor: "dinheiro", rotulo: "Dinheiro" },
  { valor: "boleto", rotulo: "Boleto" },
  { valor: "outro", rotulo: "Outro" },
];
