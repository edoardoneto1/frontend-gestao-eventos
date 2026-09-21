"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Evento, Inscricao } from "@/types";
import { useAuthStore } from "@/store/auth";

interface EventoModalProps {
  evento: Evento;
  onClose: () => void;
}

export function EventoModal({ evento, onClose }: EventoModalProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [jaInscrito, setJaInscrito] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Fecha ao apertar ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Bloqueia scroll da página
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Verifica se o usuário já está inscrito neste evento
  useEffect(() => {
    async function verificarInscricao() {
      if (!isAuthenticated) {
        setVerificando(false);
        return;
      }

      try {
        const response = await api.get(
          "/events/inscricoes/minhas-inscricoes/"
        );
        const inscricoes: Inscricao[] = response.data.results || response.data;
        const inscrito = inscricoes.some(
          (i) => String(i.evento) === String(evento.id)
        );
        setJaInscrito(inscrito);
      } catch (err) {
        console.error("Erro ao verificar inscrição:", err);
      } finally {
        setVerificando(false);
      }
    }

    verificarInscricao();
  }, [evento.id, isAuthenticated]);

  async function handleInscrever() {
    setErro(null);

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/events/inscricoes/", {
        evento: evento.id,
      });
      setJaInscrito(true);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as {
        response?: { data?: Record<string, unknown> };
      };

      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        const mensagens = Object.entries(data)
          .map(([campo, valor]) => {
            const texto = Array.isArray(valor)
              ? valor.join(", ")
              : String(valor);
            return `${campo}: ${texto}`;
          })
          .join("\n");
        setErro(mensagens);
      } else {
        setErro("Erro ao se inscrever. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const tipoLabels: Record<Evento["tipo"], string> = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Híbrido",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="p-8">
          {/* Badge tipo */}
          <span className="inline-block px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
            {tipoLabels[evento.tipo]}
          </span>

          {/* Título */}
          <h2 className="text-3xl font-bold text-zinc-900 mt-4">
            {evento.titulo}
          </h2>

          {/* Descrição */}
          <p className="text-zinc-600 mt-4 whitespace-pre-line">
            {evento.descricao || "Sem descrição."}
          </p>

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

          <hr className="my-6 border-zinc-200" />

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md whitespace-pre-line mb-4">
              {erro}
            </div>
          )}

          {/* Botão / Status */}
          {verificando ? (
            <div className="w-full bg-zinc-100 text-zinc-500 py-3 rounded-md font-medium text-center">
              Verificando...
            </div>
          ) : jaInscrito ? (
            <div className="w-full bg-green-100 text-green-800 py-3 rounded-md font-medium text-center border border-green-200">
              ✅ Você está inscrito neste evento
            </div>
          ) : (
            <>
              <button
                onClick={handleInscrever}
                disabled={evento.vagas_restantes === 0 || isLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white py-3 rounded-md font-medium transition"
              >
                {isLoading
                  ? "Inscrevendo..."
                  : evento.vagas_restantes === 0
                  ? "Vagas esgotadas"
                  : "Inscrever-se"}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-zinc-500 text-center mt-3">
                  Você precisa estar logado para se inscrever
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
