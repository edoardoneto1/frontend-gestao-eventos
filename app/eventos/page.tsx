"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { Evento } from "@/types";
import { EventoCard } from "@/components/EventoCard";
import { Header } from "@/components/Header";
import { EventoModal } from "@/components/EventoModal";

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(
    null
  );

  useEffect(() => {
    async function fetchEventos() {
      try {
        setLoading(true);
        const response = await api.get("/events/eventos/");
        setEventos(response.data.results || response.data);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar eventos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchEventos();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-72px)] bg-zinc-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Título + Botões */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Eventos</h1>
            <div className="flex gap-3">
              <Link
                href="/meus-eventos"
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium transition"
              >
                Meus Eventos
              </Link>
              <Link
                href="/eventos/criar"
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-md font-medium transition"
              >
                + Criar Evento
              </Link>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12 text-zinc-500">
              Carregando eventos...
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
            <div className="text-center py-12 text-zinc-500">
              Nenhum evento encontrado.
            </div>
          )}

          {/* Grid */}
          {!loading && !erro && eventos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  onVerMais={() => setEventoSelecionado(evento)}
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