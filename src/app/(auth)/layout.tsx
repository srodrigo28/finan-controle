import { ShoppingCart } from "lucide-react";

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="fundo-aurora flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-[calc(2.5rem+var(--safe-t))]">
        <div className="mb-10 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-fg botao-brilho">
            <ShoppingCart className="size-6" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-lg font-semibold leading-tight tracking-tight">Finan</p>
            <p className="text-xs text-text-2">Controle antes do caixa</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
