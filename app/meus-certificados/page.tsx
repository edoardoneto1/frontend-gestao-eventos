"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Certificado } from "@/types";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/store/auth";

export default function MeusCertificadosPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);

  // Lista de certificados do usuário logado
  const [certificados, setCertificados] = useState<Certificado[]>([]);

  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

  // Busca os certificados do usuário.
  // O backend já filtra automaticamente pelo usuário logado
  // (via get_queryset do CertificadoViewSet).
  useEffect(() => {
    async function fetchCertificados() {
      try {
        setLoading(true);
        const response = await api.get("/events/certificados/");
        setCertificados(response.data.results || response.data);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar certificados.");
      } finally {
        setLoading(false);
      }
    }
    // Só busca se estiver logado (evita 401)
    if (isAuthenticated) fetchCertificados();
  }, [isAuthenticated]);

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
            Meus Certificados
          </h1>

          {/* Estado: carregando */}
          {loading && (
            <div className="text-center py-12 text-zinc-500">
              Carregando certificados...
            </div>
          )}

          {/* Estado: erro */}
          {!loading && erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {erro}
            </div>
          )}

          {/* Estado: vazio — usuário não tem certificados ainda */}
          {!loading && !erro && certificados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 mb-4">
                Você ainda não possui certificados.
              </p>
              <p className="text-sm text-zinc-400">
                Faça check-in em um evento para gerar seu certificado.
              </p>
            </div>
          )}

          {/* Estado: com dados — lista de certificados */}
          {!loading && !erro && certificados.length > 0 && (
            <div className="space-y-4">
              {certificados.map((certificado) => (
                // Cada certificado é um "cartão" com borda azul
                <div
                  key={certificado.id}
                  className="bg-white rounded-lg border-2 border-blue-900 p-8 shadow-md"
                >
                  {/* Cabeçalho: ícone + título */}
                  <div className="text-center border-b border-zinc-200 pb-4 mb-4">
                    <span className="text-4xl">🎓</span>
                    <h2 className="text-sm font-medium text-blue-900 uppercase tracking-wide mt-2">
                      Certificado de Participação
                    </h2>
                  </div>

                  {/* Corpo: dados do certificado */}
                  <div className="text-center space-y-3">
                    <p className="text-zinc-600 text-sm">Certificamos que</p>
                    <p className="text-2xl font-bold text-zinc-900">
                      {/* Fallback: se o backend não mandar o nome, mostra "Participante" */}
                      {certificado.participante_nome || "Participante"}
                    </p>
                    <p className="text-zinc-600 text-sm">
                      participou do evento
                    </p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {certificado.evento_titulo}
                    </p>
                    <p className="text-zinc-600 text-sm">
                      com carga horária total de{" "}
                      <strong>{certificado.carga_horaria}h</strong>
                    </p>
                  </div>

                  {/* Rodapé: data de emissão + código de validação */}
                  <div className="mt-6 pt-4 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-zinc-500">
                    <span>
                      📅 Emitido em{" "}
                      {new Date(certificado.data_emissao).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                    <span className="font-mono">
                      {/* Código usado pra validar publicamente em /certificados/validar */}
                      🔑 Código: {certificado.codigo_validacao}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}