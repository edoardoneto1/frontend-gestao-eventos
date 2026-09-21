"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Evento } from "@/types";
import { EventoCard } from "@/components/EventoCard";

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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
    <div className="min-h-[calc(100vh-72px)] bg-zinc-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Título */}
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Eventos</h1>

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
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}