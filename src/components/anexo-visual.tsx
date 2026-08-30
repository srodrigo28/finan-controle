"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { api } from "@/lib/api";
import type { Anexo } from "@/lib/tipos";

/** Carrega o anexo autenticado como blob e mostra miniatura (imagem) ou ícone (PDF). */
export function AnexoVisual({ anexo }: { anexo: Anexo }) {
  const [url, setUrl] = useState<string | null>(null);
  const ehImagem = anexo.tipo_mime.startsWith("image/");

  useEffect(() => {
    let objeto: string | null = null;
    let ativo = true;
    api<Blob>(`/anexos/${anexo.id}/arquivo`, { bruto: true })
      .then((b) => {
        if (!ativo) return;
        objeto = URL.createObjectURL(b);
        setUrl(objeto);
      })
      .catch(() => {});
    return () => {
      ativo = false;
      if (objeto) URL.revokeObjectURL(objeto);
    };
  }, [anexo.id]);

  if (ehImagem) {
    return url ? (
      <a href={url} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={anexo.nome} className="size-full object-cover" />
      </a>
    ) : (
      <div className="skeleton aspect-[4/3] rounded-none" />
    );
  }
  return (
    <a href={url ?? undefined} target="_blank" rel="noreferrer" className="grid aspect-[4/3] place-items-center bg-surface-2 text-muted">
      <FileText className="size-8" />
    </a>
  );
}
