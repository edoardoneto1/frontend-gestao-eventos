"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import type { Inscricao } from "@/types";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/store/auth";

export default function MinhasInscricoesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Guarda o ID da inscrição que está fazendo check-in.
  // Serve pra mostrar "Fazendo check-in..." só no botão clicado
  // (e desabilitar os outros).
  const [checkinLoadingId, setCheckinLoadingId] = useState<string | null>(null);

  // Carrega o auth do localStorage
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Proteção: redireciona pra /login se não logado
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Busca as inscrições do usuário logado.
  // O backend já filtra automaticamente pelo participante
  // (via action minhas_inscricoes do InscricaoViewSet).
  async function fetchInscricoes() {
    try {
      setLoading(true);
      const response = await api.get("/events/inscricoes/minhas-inscricoes/");
      setInscricoes(response.data.results || response.data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar inscrições.");
    } finally {
      setLoading(false);
    }
  }

  // Só busca se estiver logado (evita 401)
  useEffect(() => {
    if (isAuthenticated) fetchInscricoes();
  }, [isAuthenticated]);

  // Faz o check-in de uma inscrição específica.
  // No backend, o check-in:
  //   1. Marca presenca_confirmada = true
  //   2. Preenche data_checkin
  //   3. Gera um certificado automaticamente
  async function handleCheckin(inscricaoId: string) {
    setCheckinLoadingId(inscricaoId);
    try {
      await api.post(`/events/inscricoes/${inscricaoId}/check-in/`);

      // Atualização otimista: muda só a inscrição afetada,
      // sem precisar refazer o GET.
      setInscricoes((prev) =>
        prev.map((i) =>
          i.id === inscricaoId
            ? {
                ...i,
                presenca_confirmada: true,
                data_checkin: new Date().toISOString(),
              }
            : i
        )
      );
    } catch (err) {
      console.error(err);
      const axiosError = err as {
        response?: { data?: { detail?: string } };
      };
      alert(
        axiosError.response?.data?.detail ||
          "Erro ao fazer check-in. Tente novamente."
      );
    } finally {
      setCheckinLoadingId(null);
    }
  }

  // Loading enquanto verifica autenticação
  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-72px)] bg-zinc-50 flex items-center justify-center">
          <p className="text-zinc-500">Verificando autenticação...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-72px)] bg-zinc-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-zinc-900 mb-8">
            Minhas Inscrições
          </h1>

          {/* Estado: carregando */}
          {loading && (
            <div className="text-center py-12 text-zinc-500">
              Carregando inscrições...
            </div>
          )}

          {/* Estado: erro */}
          {!loading && erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {erro}
            </div>
          )}

          {/* Estado: vazio */}
          {!loading && !erro && inscricoes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 mb-4">
                Você ainda não se inscreveu em nenhum evento.
              </p>
              <Link
                href="/eventos"
                className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium transition"
              >
                Ver eventos disponíveis
              </Link>
            </div>
          )}

          {/* Estado: com dados — lista de inscrições */}
          {!loading && !erro && inscricoes.length > 0 && (
            <div className="space-y-4">
              {inscricoes.map((inscricao) => {
                // O botão de check-in só aparece se o evento já começou.
                // Comparamos data_inicio com o "agora".
                const eventoComecou = inscricao.evento_detalhes
                  ? new Date(inscricao.evento_detalhes.data_inicio) <=
                    new Date()
                  : false;

                return (
                  <div
                    key={inscricao.id}
                    className="bg-white rounded-lg border border-blue-900 p-6 shadow-sm"
                  >
                    <h2 className="text-xl font-bold text-zinc-900">
                      {inscricao.evento_titulo}
                    </h2>

                    {/* Dados extras do evento (vêm de evento_detalhes,
                        aninhado no serializer do backend) */}
                    {inscricao.evento_detalhes && (
                      <div className="mt-2 space-y-1 text-sm text-zinc-600">
                        <p>
                          📅{" "}
                          {new Date(
                            inscricao.evento_detalhes.data_inicio
                          ).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p>
                          {inscricao.evento_detalhes.tipo === "ONLINE"
                            ? "🌐 Online"
                            : `📍 ${
                                inscricao.evento_detalhes.local_presencial ||
                                "Local a definir"
                              }`}
                        </p>
                      </div>
                    )}

                    {/* Status da presença + botão de check-in */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {inscricao.presenca_confirmada ? (
                        // Já fez check-in: mostra só o badge verde
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          ✅ Check-in feito
                        </span>
                      ) : (
                        <>
                          {/* Ainda não fez: badge amarelo */}
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                            ⏳ Aguardando check-in
                          </span>

                          {/* Botão de check-in só se o evento já começou */}
                          {eventoComecou && (
                            <button
                              onClick={() => handleCheckin(inscricao.id)}
                              disabled={checkinLoadingId === inscricao.id}
                              className="bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium text-sm transition"
                            >
                              {checkinLoadingId === inscricao.id
                                ? "Fazendo check-in..."
                                : "Fazer check-in"}
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Botão secundário pra voltar à lista de eventos */}
                    <div className="mt-4">
                      <Link
                        href="/eventos"
                        className="inline-block text-center bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-md font-medium transition"
                      >
                        Ver evento
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}