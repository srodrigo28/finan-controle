/** Tipos espelhando o contrato em docs/API.md */

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  moeda: "BRL";
  orcamento_mensal: number | null;
  orcamento_diario: number | null;
  plano: "teste" | "completo";
  teste_expira_em: string | null;
  dias_restantes_teste: number | null;
  teste_ativo: boolean;
  criado_em: string;
};

export type Categoria = {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  pai_id: string | null;
  orcamento_mensal: number | null;
  arquivada: boolean;
  ordem: number;
  criado_em: string;
};

export type TipoLancamento = "despesa" | "receita";
export type FormaPagamento = "dinheiro" | "debito" | "credito" | "pix" | "boleto" | "outro";

export type Anexo = {
  id: string;
  lancamento_id: string;
  nome: string;
  tipo_mime: string;
  tamanho: number;
  url: string;
  criado_em: string;
};

export type Lancamento = {
  id: string;
  tipo: TipoLancamento;
  valor: number;
  categoria_id: string | null;
  descricao: string;
  data: string;
  forma_pagamento: FormaPagamento | null;
  sessao_id: string | null;
  conta_id: string | null;
  anexos: Anexo[];
  itens?: ItemCompra[];
  criado_em: string;
  atualizado_em: string;
};

export type StatusSessao = "aberta" | "fechada" | "abandonada";

export type ItemCompra = {
  id: string;
  sessao_id: string;
  descricao: string;
  categoria_id: string | null;
  valor_unitario: number;
  quantidade: number;
  removido: boolean;
  criado_em: string;
  atualizado_em?: string;
};

export type SessaoCompra = {
  id: string;
  local: string | null;
  orcamento: number | null;
  status: StatusSessao;
  aberta_em: string;
  fechada_em: string | null;
  total_carrinho: number;
  total_pago: number | null;
  motivo_divergencia: string | null;
  lancamento_id: string | null;
  itens?: ItemCompra[];
  atualizado_em?: string;
};

export type Recorrencia = "mensal" | "semanal" | "anual" | "unica";

export type StatusOcorrencia = "pendente" | "paga" | "atrasada" | "pulada";

export type ContaAgendada = {
  id: string;
  nome: string;
  valor_estimado: number;
  dia_vencimento: number;
  recorrencia: Recorrencia;
  categoria_id: string | null;
  ativa: boolean;
  lembrete_dias: number;
  /** Anual e única: mês (1-12) do vencimento. Única também fixa o ano. */
  mes_referencia: number | null;
  ano_referencia: number | null;
  criado_em: string;
};

export type ResumoConta = {
  ocorrencias_total: number;
  pagas: number;
  total_pago: number;
  media_paga: number | null;
  ultimo_pagamento: string | null;
};

export type OcorrenciaConta = {
  id: string;
  conta_id: string;
  competencia: string;
  vencimento: string;
  valor_real: number | null;
  status: StatusOcorrencia;
  lancamento_id: string | null;
  conta: { nome: string; categoria_id: string | null; valor_estimado: number };
};

export type MetricaDiaria = {
  data: string;
  total_despesas: number;
  total_receitas: number;
  orcamento_diario: number | null;
  saldo_orcamento: number | null;
  por_categoria: { categoria_id: string | null; total: number }[];
  lancamentos: Lancamento[];
};

export type MetricaSemanal = {
  inicio: string;
  fim: string;
  total: number;
  total_anterior: number;
  variacao_valor: number;
  variacao_pct: number | null;
  por_dia: { data: string; total: number }[];
  por_categoria: { categoria_id: string | null; total: number; pct: number }[];
  dia_mais_caro: string | null;
  semana_mais_cara_do_mes: boolean;
};

export type MetricaMensal = {
  mes: string;
  total_despesas: number;
  total_receitas: number;
  meses_anteriores: { mes: string; total: number }[];
  por_categoria: { categoria_id: string | null; total: number; orcamento: number | null; pct_orcamento: number | null }[];
  contas: { pagas: number; pendentes: number; total_pendente: number };
  projecao_fechamento: number;
  semanas: { inicio: string; total: number }[];
};

export type Paginado<T> = { dados: T[]; total: number; pagina: number; por_pagina: number };
export type Lista<T> = { dados: T[] };

export type ErroApi = { erro: { codigo: string; mensagem: string; detalhes?: Record<string, unknown> } };

export type Notificacao = {
  id: string;
  chave: string;
  tipo: string;
  nivel: "atencao" | "bom" | "info";
  titulo: string;
  corpo: string | null;
  link: string | null;
  lida: boolean;
  resolvida: boolean;
  criado_em: string;
};
