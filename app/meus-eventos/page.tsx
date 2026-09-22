"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import type { Evento } from "@/types";
import { Header } from "@/components/Header";
import { MeuEventoCard } from "@/components/MeuEventoCard";
import { EventoModal } from "@/components/EventoModal";

export default function MeusEventosPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useAuthStore((s) => s.hydrate);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Evento selecionado pra abrir no modal (null = fechado)
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(
    null
  );

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

  // Busca TODOS os eventos e filtra só os do usuário logado.
  // O filtro é feito no front porque o backend não tem
  // suporte a ?organizador= ainda.
  async function fetchMeusEventos() {
    try {
      setLoading(true);
      const response = await api.get("/events/eventos/");
      const todos: Evento[] = response.data.results || response.data;

      // Compara o pkid do organizador com o id do usuário logado
      const meus = todos.filter((e) => e.organizador === user?.id);
      setEventos(meus);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar seus eventos.");
    } finally {
      setLoading(false);
    }
  }

  // Só busca quando o user estiver carregado (senão o filtro falha)
  useEffect(() => {
    if (user) fetchMeusEventos();
  }, [user]);

  // Excluir evento.
  // O backend faz SOFT DELETE: marca is_active=false em vez de
  // apagar de verdade. O registro continua no banco (segurança).
  async function handleExcluir(eventoId: string, titulo: string) {
    // Confirmação nativa do navegador
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir o evento "${titulo}"?\n\nEssa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    try {
      await api.delete(`/events/eventos/${eventoId}/`);
      // Remove da lista local sem precisar refetch
      setEventos((prev) => prev.filter((e) => e.id !== eventoId));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir evento. Tente novamente.");
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
        <div className="max-w-6xl mx-auto px-6">
          {/* Título + botão de criar */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Meus Eventos</h1>
            <Link
              href="/eventos/criar"
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium transition"
            >
              + Criar Evento
            </Link>
          </div>

          {/* Estado: carregando */}
          {loading && (
            <div className="text-center py-12 text-zinc-500">
              Carregando seus eventos...
            </div>
          )}

          {/* Estado: erro */}
          {!loading && erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {erro}
            </div>
          )}

          {/* Estado: vazio — CTA pra criar o primeiro evento */}
          {!loading && !erro && eventos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 mb-4">
                Você ainda não criou nenhum evento.
              </p>
              <Link
                href="/eventos/criar"
                className="inline-block bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium transition"
              >
                Criar meu primeiro evento
              </Link>
            </div>
          )}

          {/* Estado: com dados — grid de cards */}
          {!loading && !erro && eventos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                // MeuEventoCard (diferente do EventoCard padrão)
                // tem botões Ver / Editar / Excluir
                <MeuEventoCard
                  key={evento.id}
                  evento={evento}
                  onVerMais={() => setEventoSelecionado(evento)}
                  onExcluir={() => handleExcluir(evento.id, evento.titulo)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalhes (mesmo componente da lista geral) */}
      {eventoSelecionado && (
        <EventoModal
          evento={eventoSelecionado}
          onClose={() => setEventoSelecionado(null)}
        />
      )}
    </>
  );
}