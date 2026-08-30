import { Suspense } from "react";
import { FormularioAuth } from "@/components/formulario-auth";

export const metadata = { title: "Criar conta" };

export default function PaginaCadastro() {
  return (
    <Suspense>
      <FormularioAuth modo="cadastro" />
    </Suspense>
  );
}
