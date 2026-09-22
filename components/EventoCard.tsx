import type { Evento } from "@/types";

// ─────────────────────────────────────────────────────────────
// COMPONENTE: EventoCard
//
// Card reutilizável que exibe um evento em formato resumido.
// É usado em várias páginas: /eventos, /meus-eventos, etc.
//
// Não busca dados nem tem estado próprio: recebe um evento
// via props e uma função onVerMais (que abre o modal).
// ─────────────────────────────────────────────────────────────

interface EventoCardProps {
  evento: Evento;
  onVerMais: () => void;
  // ↑ Callback: a página decide o que fazer ao clicar em "Ver mais"
  //   (normalmente abrir o EventoModal)
}

export function EventoCard({ evento, onVerMais }: EventoCardProps) {
  // Mapeia cada tipo de evento → suas cores (badge)
  const tipoCores: Record<Evento["tipo"], string> = {
    PRESENCIAL: "bg-blue-100 text-blue-800",
    ONLINE: "bg-green-100 text-green-800",
    HIBRIDO: "bg-purple-100 text-purple-800",
  };

  // Mapeia cada tipo de evento → sua label legível
  const tipoLabels: Record<Evento["tipo"], string> = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Híbrido",
  };

  return (
    <div className="bg-zinc-300 rounded-lg border border-blue-900 p-6 shadow-sm hover:shadow-md transition flex flex-col">
      {/* ↑ flex flex-col: pra o botão "Ver mais" ficar sempre no
             final do card, alinhado com os outros cards do grid. */}

      {/* Badge do tipo com cor dinâmica */}
      <span
        className={`inline-block self-start px-2 py-1 text-xs font-medium rounded ${tipoCores[evento.tipo]}`}
      >
        {tipoLabels[evento.tipo]}
      </span>

      {/* Título (limitado a 2 linhas) */}
      <h2 className="text-xl font-bold text-zinc-900 mt-3 line-clamp-2">
        {evento.titulo}
      </h2>

      {/* Descrição (2 linhas + flex-grow pra empurrar o botão pro fim) */}
      <p className="text-sm text-zinc-600 mt-2 line-clamp-2 flex-grow">
        {evento.descricao || "Sem descrição"}
      </p>

      {/* Informações rápidas: data, local, vagas */}
      <div className="mt-4 space-y-1 text-sm text-zinc-600">
        <p>
          📅{" "}
          {/* Formata a data ISO pra "20 de novembro de 2026" */}
          {new Date(evento.data_inicio).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p>
          {/* Se for online, mostra "Online". Senão, mostra o local.
              Se não tiver local, mostra "A definir". */}
          {evento.tipo === "ONLINE"
            ? "🌐 Online"
            : `📍 ${evento.local_presencial || "Local a definir"}`}
        </p>
        <p>
          👥{" "}
          {/* Se tiver vagas, mostra o número. Senão, "Esgotado". */}
          {evento.vagas_restantes > 0
            ? `${evento.vagas_restantes} vagas restantes`
            : "Esgotado"}
        </p>
      </div>

      {/* Botão que dispara o callback (normalmente abre o modal) */}
      <button
        onClick={onVerMais}
        className="block w-full mt-4 text-center bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-medium transition"
      >
        Ver mais
      </button>
    </div>
  );
}