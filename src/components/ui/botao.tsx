"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const estilos = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium select-none transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
  {
    variants: {
      variante: {
        primario: "bg-accent text-accent-fg botao-brilho hover:bg-accent-strong",
        secundario: "bg-surface-2 text-text hover:bg-surface-3",
        contorno: "border border-border bg-surface text-text hover:bg-surface-2",
        fantasma: "text-text-2 hover:bg-surface-2 hover:text-text",
        perigo: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
      },
      tamanho: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-14 px-6 text-base",
        icone: "size-11",
        iconeSm: "size-9",
      },
      cheio: { true: "w-full" },
    },
    defaultVariants: { variante: "primario", tamanho: "md" },
  },
);

type Props = Omit<HTMLMotionProps<"button">, "children"> &
  VariantProps<typeof estilos> & { carregando?: boolean; children?: React.ReactNode };

export function Botao({ className, variante, tamanho, cheio, carregando, children, disabled, ...resto }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(estilos({ variante, tamanho, cheio }), className)}
      disabled={disabled || carregando}
      {...resto}
    >
      {carregando ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </motion.button>
  );
}
