"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Evento } from "@/types";
import { useAuthStore } from "@/store/auth";

interface EventoModalProps {
  evento: Evento;
  onClose: () => void;
}

export function EventoModal({ evento, onClose }: EventoModalProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Fecha o modal ao apertar ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Bloqueia o scroll da página enquanto o modal está aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleInscrever() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // TODO: fazer POST /api/v1/events/inscricoes/
    alert("Em breve: inscrição!");
  }

  const tipoLabels: Record<Evento["tipo"], string> = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Híbrido",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose} // Fecha ao clicar fora
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Não fecha ao clicar dentro
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Conteúdo */}
        <div className="p-8">
          {/* Badge tipo */}
          <span className="inline-block px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
            {tipoLabels[evento.tipo]}
          </span>

          {/* Título */}
          <h2 className="text-3xl font-bold text-zinc-900 mt-4">
            {evento.titulo}
          </h2>

          {/* Descrição completa */}
          <p className="text-zinc-600 mt-4 whitespace-pre-line">
            {evento.descricao || "Sem descrição."}
          </p>

          {/* Divisor */}
          <hr className="my-6 border-zinc-200" />

          {/* Detalhes */}
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-zinc-500 w-32">📅 Início:</span>
              <span className="text-zinc-900">
                {new Date(evento.data_inicio).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex gap-3">
              <span className="text-zinc-500 w-32">📅 Fim:</span>
              <span className="text-zinc-900">
                {new Date(evento.data_fim).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex gap-3">
              <span className="text-zinc-500 w-32">📍 Local:</span>
              <span className="text-zinc-900">
                {evento.tipo === "ONLINE"
                  ? "Online (ao vivo)"
                  : evento.local_presencial || "A definir"}
              </span>
            </div>

            <div className="flex gap-3">
              <span className="text-zinc-500 w-32">⏱ Carga horária:</span>
              <span className="text-zinc-900">
                {evento.carga_horaria_horas}h
              </span>
            </div>

            <div className="flex gap-3">
              <span className="text-zinc-500 w-32">👥 Vagas:</span>
              <span className="text-zinc-900">
                {evento.vagas_restantes} de {evento.vagas_totais} disponíveis
              </span>
            </div>
          </div>

          {/* Divisor */}
          <hr className="my-6 border-zinc-200" />

          {/* Botão Inscrever */}
          <button
            onClick={handleInscrever}
            disabled={evento.vagas_restantes === 0}
            className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white py-3 rounded-md font-medium transition"
          >
            {evento.vagas_restantes === 0
              ? "Vagas esgotadas"
              : "Inscrever-se"}
          </button>

          {!isAuthenticated && (
            <p className="text-xs text-zinc-500 text-center mt-3">
              Você precisa estar logado para se inscrever
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
