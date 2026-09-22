"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import type { Evento } from "@/types";
import { Header } from "@/components/Header";
import { MeuEventoCard } from "@/components/MeuEventoCard";
import { EventoModal } from "@/components/EventoModal";

export default function MeusEventosPage() {
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(
    null
  );

  // Hidrata o estado do auth
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Busca os eventos do usuário logado
  async function fetchMeusEventos() {
    try {
      setLoading(true);
      const response = await api.get("/events/eventos/");
      const todos: Evento[] = response.data.results || response.data;

      // Filtra só os eventos do usuário logado
      const meus = todos.filter((e) => e.organizador === user?.id);
      setEventos(meus);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar seus eventos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) fetchMeusEventos();
  }, [user]);

  // Excluir evento (soft delete)
  async function handleExcluir(eventoId: string, titulo: string) {
    const confirmado = window.confirm(
      `Tem certeza que deseja excluir o evento "${titulo}"?\n\nEssa ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    try {
      await api.delete(`/events/eventos/${eventoId}/`);
      // Remove da lista local
      setEventos((prev) => prev.filter((e) => e.id !== eventoId));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir evento. Tente novamente.");
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-72px)] bg-zinc-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Título + Botão */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Meus Eventos</h1>
            <Link
              href="/eventos/criar"
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium transition"
            >
              + Criar Evento
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12 text-zinc-500">
              Carregando seus eventos...
            </div>
          )}

          {/* Erro */}
          {!loading && erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              {erro}
            </div>
          )}

          {/* Vazio */}
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

          {/* Grid */}
          {!loading && !erro && eventos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
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

      {/* Modal */}
      {eventoSelecionado && (
        <EventoModal
          evento={eventoSelecionado}
          onClose={() => setEventoSelecionado(null)}
        />
      )}
    </>
  );
}