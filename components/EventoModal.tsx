"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Evento, Inscricao } from "@/types";
import { useAuthStore } from "@/store/auth";

// ─────────────────────────────────────────────────────────────
// COMPONENTE: EventoModal
//
// Modal (popup) que mostra os detalhes completos de um evento
// e permite o usuário se inscrever.
//
// Recebe dois props:
//   - evento: o evento a ser exibido
//   - onClose: função pra fechar o modal
//
// Usa um "overlay" escuro cobrindo a tela toda. Ao clicar fora
// (no overlay), fecha. Ao clicar dentro, o clique NÃO propaga.
// ─────────────────────────────────────────────────────────────

interface EventoModalProps {
  evento: Evento;
  onClose: () => void;
}

export function EventoModal({ evento, onClose }: EventoModalProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Estado: o usuário já está inscrito neste evento?
  const [jaInscrito, setJaInscrito] = useState(false);

  // Enquanto verifica inscrição no backend
  const [verificando, setVerificando] = useState(true);

  // Enquanto envia o POST de inscrição
  const [isLoading, setIsLoading] = useState(false);

  // Mensagem de erro (se houver)
  const [erro, setErro] = useState<string | null>(null);

  // ────────────────────────────────────────────────────────────
  // Fechar com a tecla ESC
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    // Cleanup: remove o listener quando o modal fecha
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // ────────────────────────────────────────────────────────────
  // Bloquear scroll da página enquanto o modal está aberto
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      // Quando o modal fecha, restaura o scroll
      document.body.style.overflow = "";
    };
  }, []);

  // ────────────────────────────────────────────────────────────
  // Verificar se o usuário já está inscrito
  //
  // Busca TODAS as inscrições do usuário (via minhas-inscricoes)
  // e checa se alguma tem o mesmo ID do evento atual.
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function verificarInscricao() {
      // Se não estiver logado, nem tenta (evita 401)
      if (!isAuthenticated) {
        setVerificando(false);
        return;
      }

      try {
        const response = await api.get(
          "/events/inscricoes/minhas-inscricoes/"
        );
        const inscricoes: Inscricao[] = response.data.results || response.data;

        // Compara IDs como string (o backend retorna UUID)
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

  // ────────────────────────────────────────────────────────────
  // Inscrever no evento
  // ────────────────────────────────────────────────────────────
  async function handleInscrever() {
    setErro(null);

    // Se não logado, manda pro login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/events/inscricoes/", {
        evento: evento.id,
        // ↑ O backend aceita UUID (UUIDPrimaryKeyRelatedField)
      });
      setJaInscrito(true);
    } catch (err: unknown) {
      // Extrai mensagens do backend
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

  // Mapeia tipo → label legível
  const tipoLabels: Record<Evento["tipo"], string> = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Híbrido",
  };

  return (
    // Overlay: cobre a tela toda, escurece o fundo.
    // Clicar nele (fora do conteúdo) fecha o modal.
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Conteúdo do modal.
          stopPropagation impede que o clique aqui "suba" pro overlay
          e feche o modal por engano. */}
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 transition"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="p-8">
          {/* Badge do tipo */}
          <span className="inline-block px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
            {tipoLabels[evento.tipo]}
          </span>

          {/* Título */}
          <h2 className="text-3xl font-bold text-zinc-900 mt-4">
            {evento.titulo}
          </h2>

          {/* Descrição (whitespace-pre-line preserva quebras) */}
          <p className="text-zinc-600 mt-4 whitespace-pre-line">
            {evento.descricao || "Sem descrição."}
          </p>

          <hr className="my-6 border-zinc-200" />

          {/* Detalhes em formato de "linhas": rótulo + valor */}
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

          {/* Erro (se houver) */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md whitespace-pre-line mb-4">
              {erro}
            </div>
          )}

          {/* ─────────────────────────────────────────────────
              Área de ação: 3 estados possíveis
              1) Verificando...
              2) ✅ Já inscrito
              3) Botão "Inscrever-se" (ou "Vagas esgotadas")
             ───────────────────────────────────────────────── */}
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
                {/* 3 textos possíveis pro botão */}
                {isLoading
                  ? "Inscrevendo..."
                  : evento.vagas_restantes === 0
                  ? "Vagas esgotadas"
                  : "Inscrever-se"}
              </button>

              {/* Aviso se o usuário não estiver logado */}
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