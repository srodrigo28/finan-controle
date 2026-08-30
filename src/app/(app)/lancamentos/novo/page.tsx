"use client";

import { Cabecalho } from "@/components/layout/cabecalho";
import { FormularioLancamento } from "@/components/formulario-lancamento";

export default function PaginaNovoLancamento() {
  return (
    <div>
      <Cabecalho titulo="Novo lançamento" voltar />
      <FormularioLancamento />
    </div>
  );
}
