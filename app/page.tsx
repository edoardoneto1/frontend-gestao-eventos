"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Evento } from "@/types";

export default function Home() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventos() {
      try {
        setLoading(true);
        const response = await api.get("/events/eventos/");
        console.log("✅ Resposta da API:", response.data);
        setEventos(response.data.results || response.data);
      } catch (err: unknown) {
        console.error("❌ Erro na API:", err);
        setErro("Falha ao carregar eventos. Verifique o console.");
      } finally {
        setLoading(false);
      }
    }

    fetchEventos();
  }, []);

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Eventos</h1>
      {erro && <p className="text-red-500 mb-4">{erro}</p>}
      {eventos.length === 0 && !erro ? (
        <p className="text-gray-500">Nenhum evento encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {eventos.map((evento) => (
            <li key={evento.id} className="border p-4 rounded">
              <h2 className="font-semibold">{evento.titulo}</h2>
              <p className="text-sm text-gray-600">{evento.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}