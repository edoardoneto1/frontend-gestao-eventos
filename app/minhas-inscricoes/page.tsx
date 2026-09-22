"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { Inscricao } from "@/types";
import { Header } from "@/components/Header";

export default function MinhasInscricoesPage() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [checkinLoadingId, setCheckinLoadingId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchInscricoes();
  }, []);

  async function handleCheckin(inscricaoId: string) {
    setCheckinLoadingId(inscricaoId);
    try {
      await api.post(`/events/inscricoes/${inscricaoId}/check-in/`);
      // Atualiza só a inscrição afetada
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

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-72px)] bg-zinc-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-zinc-900 mb-8">
            Minhas Inscrições
          </h1>

          {loading && (
            <div className="text-center py-12 text-zinc-500">
              Carregando inscrições...
            </div>
          )}

          {!loading && erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {erro}
            </div>
          )}

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

          {!loading && !erro && inscricoes.length > 0 && (
            <div className="space-y-4">
              {inscricoes.map((inscricao) => {
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

                    {/* Status + Botões */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {inscricao.presenca_confirmada ? (
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          ✅ Check-in feito
                        </span>
                      ) : (
                        <>
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                            ⏳ Aguardando check-in
                          </span>

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

                    {/* Botão Ver evento */}
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