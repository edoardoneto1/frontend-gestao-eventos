"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/store/auth";

export default function EditarEventoPage() {
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id as string;
  // ↑ Pega o ID do evento da URL (ex: /eventos/ABC/editar → ABC)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);

  // Estados do formulário (cada campo do evento)
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tipo, setTipo] = useState<"PRESENCIAL" | "ONLINE" | "HIBRIDO">(
    "PRESENCIAL"
  );
  const [localPresencial, setLocalPresencial] = useState("");
  const [vagasTotais, setVagasTotais] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");

  // Estados de controle da página
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega o auth do localStorage
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Proteção: redireciona pra /login se não estiver logado
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Busca os dados do evento pra preencher o formulário
  useEffect(() => {
    async function fetchEvento() {
      try {
        const response = await api.get(`/events/eventos/${eventoId}/`);
        const e = response.data;

        setTitulo(e.titulo);
        setDescricao(e.descricao || "");
        setTipo(e.tipo);
        setLocalPresencial(e.local_presencial || "");
        setVagasTotais(String(e.vagas_totais));
        setCargaHoraria(String(e.carga_horaria_horas));

        // Converte data ISO (backend) pra formato do <input datetime-local>
        // ISO: "2026-11-20T19:30:00-03:00"
        // Input: "2026-11-20T19:30"
        function toLocalInput(d: Date) {
          const pad = (n: number) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate()
          )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }

        setDataInicio(toLocalInput(new Date(e.data_inicio)));
        setDataFim(toLocalInput(new Date(e.data_fim)));
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar evento.");
      } finally {
        setCarregando(false);
      }
    }

    if (eventoId) fetchEvento();
  }, [eventoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setIsLoading(true);

    try {
      // PATCH atualiza só os campos enviados (não substitui o objeto todo)
      await api.patch(`/events/eventos/${eventoId}/`, {
        titulo,
        descricao: descricao || null,
        data_inicio: new Date(dataInicio).toISOString(),
        data_fim: new Date(dataFim).toISOString(),
        tipo,
        // Local só faz sentido se não for online
        local_presencial: tipo === "ONLINE" ? null : localPresencial || null,
        vagas_totais: parseInt(vagasTotais),
        carga_horaria_horas: parseInt(cargaHoraria) || 0,
      });

      router.push("/meus-eventos");
    } catch (err: unknown) {
      // O backend retorna { errors: { campo: [mensagem] } }.
      // Extraímos e transformamos em texto legível.
      console.error(err);
      const axiosError = err as {
        response?: { data?: Record<string, unknown> };
      };

      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        const erros = (data.errors || data) as Record<string, unknown>;
        const mensagens = Object.entries(erros)
          .map(([campo, valor]) => {
            const texto = Array.isArray(valor)
              ? valor.join(", ")
              : typeof valor === "object"
              ? JSON.stringify(valor)
              : String(valor);
            return `${campo}: ${texto}`;
          })
          .join("\n");
        setErro(mensagens);
      } else {
        setErro("Erro ao atualizar evento. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Enquanto não verifica auth ou não carrega o evento, mostra loading
  if (!isAuthenticated || carregando) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-72px)] bg-zinc-50 flex items-center justify-center">
          <p className="text-zinc-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <Link
            href="/meus-eventos"
            className="text-sm text-blue-900 hover:underline mb-4 inline-block"
          >
            ← Voltar para meus eventos
          </Link>

          <h1 className="text-3xl font-bold text-zinc-900 mb-8">
            Editar Evento
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-zinc-200 p-8 space-y-6"
          >
            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md whitespace-pre-line">
                {erro}
              </div>
            )}

            {/* Título */}
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-700">
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-700">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500 resize-none"
              />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700">
                  Data início *
                </label>
                <input
                  type="datetime-local"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700">
                  Data fim *
                </label>
                <input
                  type="datetime-local"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-700">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(
                    e.target.value as "PRESENCIAL" | "ONLINE" | "HIBRIDO"
                  )
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 bg-white"
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="ONLINE">Online</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>

            {/* Local (só se Presencial ou Híbrido) */}
            {(tipo === "PRESENCIAL" || tipo === "HIBRIDO") && (
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700">
                  Local presencial
                </label>
                <input
                  type="text"
                  value={localPresencial}
                  onChange={(e) => setLocalPresencial(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
                />
              </div>
            )}

            {/* Vagas + Carga horária */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700">
                  Vagas totais *
                </label>
                <input
                  type="number"
                  value={vagasTotais}
                  onChange={(e) => setVagasTotais(e.target.value)}
                  required
                  min={1}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700">
                  Carga horária (horas)
                </label>
                <input
                  type="number"
                  value={cargaHoraria}
                  onChange={(e) => setCargaHoraria(e.target.value)}
                  min={0}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/meus-eventos"
                className="flex-1 text-center border border-zinc-300 hover:bg-zinc-50 text-zinc-700 py-3 rounded-md font-medium transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-md font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}