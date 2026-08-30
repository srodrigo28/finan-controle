import { Suspense } from "react";
import { FormularioAuth } from "@/components/formulario-auth";

export const metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return (
    <Suspense>
      <FormularioAuth modo="entrar" />
    </Suspense>
  );
}
