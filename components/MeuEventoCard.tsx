import Link from "next/link";
import type { Evento } from "@/types";

interface MeuEventoCardProps {
  evento: Evento;
  onVerMais: () => void;
  onExcluir: () => void;
}

export function MeuEventoCard({
  evento,
  onVerMais,
  onExcluir,
}: MeuEventoCardProps) {
  const tipoCores: Record<Evento["tipo"], string> = {
    PRESENCIAL: "bg-blue-100 text-blue-800",
    ONLINE: "bg-green-100 text-green-800",
    HIBRIDO: "bg-purple-100 text-purple-800",
  };

  const tipoLabels: Record<Evento["tipo"], string> = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Híbrido",
  };

  return (
    <div className="bg-zinc-50 rounded-lg border border-blue-900 p-6 shadow-sm hover:shadow-md transition flex flex-col">
      {/* Badge */}
      <span
        className={`inline-block self-start px-2 py-1 text-xs font-medium rounded ${tipoCores[evento.tipo]}`}
      >
        {tipoLabels[evento.tipo]}
      </span>

      {/* Título */}
      <h2 className="text-xl font-bold text-zinc-900 mt-3 line-clamp-2">
        {evento.titulo}
      </h2>

      {/* Descrição */}
      <p className="text-sm text-zinc-600 mt-2 line-clamp-2 flex-grow">
        {evento.descricao || "Sem descrição"}
      </p>

      {/* Informações */}
      <div className="mt-4 space-y-1 text-sm text-zinc-600">
        <p>
          📅{" "}
          {new Date(evento.data_inicio).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p>
          {evento.tipo === "ONLINE"
            ? "🌐 Online"
            : `📍 ${evento.local_presencial || "Local a definir"}`}
        </p>
        <p>
          👥{" "}
          {evento.vagas_restantes} de {evento.vagas_totais} vagas
        </p>
      </div>

      {/* Botões */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onVerMais}
          className="text-center bg-zinc-200 hover:bg-zinc-300 text-zinc-700 py-2 rounded-md font-medium text-sm transition"
        >
          Ver
        </button>
        <Link
          href={`/eventos/${evento.id}/editar`}
          className="text-center bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-medium text-sm transition"
        >
          Editar
        </Link>
        <button
          onClick={onExcluir}
          className="text-center bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium text-sm transition"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}