import Link from "next/link";
import type { Evento } from "@/types";

// ─────────────────────────────────────────────────────────────
// COMPONENTE: MeuEventoCard
//
// Versão do card de evento usada APENAS em /meus-eventos.
//
// Diferença em relação ao EventoCard normal:
//   - Tem 3 botões (Ver / Editar / Excluir) em vez de 1
//   - Background levemente cinza (zinc-50) pra diferenciar
//
// Recebe 3 props:
//   - evento: dados do evento
//   - onVerMais: callback pra abrir o modal
//   - onExcluir: callback pra excluir o evento (com confirmação)
// ─────────────────────────────────────────────────────────────

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
  // Mapeia tipo → cor do badge
  const tipoCores: Record<Evento["tipo"], string> = {
    PRESENCIAL: "bg-blue-100 text-blue-800",
    ONLINE: "bg-green-100 text-green-800",
    HIBRIDO: "bg-purple-100 text-purple-800",
  };

  // Mapeia tipo → label legível
  const tipoLabels: Record<Evento["tipo"], string> = {
    PRESENCIAL: "Presencial",
    ONLINE: "Online",
    HIBRIDO: "Híbrido",
  };

  return (
    <div className="bg-zinc-50 rounded-lg border border-blue-900 p-6 shadow-sm hover:shadow-md transition flex flex-col">
      {/* ↑ bg-zinc-50: fundo levemente cinza (diferencia do EventoCard).
             flex flex-col: botões ficam sempre no final, alinhados. */}

      {/* Badge do tipo */}
      <span
        className={`inline-block self-start px-2 py-1 text-xs font-medium rounded ${tipoCores[evento.tipo]}`}
      >
        {tipoLabels[evento.tipo]}
      </span>

      {/* Título (limitado a 2 linhas) */}
      <h2 className="text-xl font-bold text-zinc-900 mt-3 line-clamp-2">
        {evento.titulo}
      </h2>

      {/* Descrição (2 linhas + flex-grow pra empurrar botões pro fim) */}
      <p className="text-sm text-zinc-600 mt-2 line-clamp-2 flex-grow">
        {evento.descricao || "Sem descrição"}
      </p>

      {/* Informações rápidas */}
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
          {/* Formato "X de Y vagas" (diferente do EventoCard que
              mostra só "X vagas restantes") */}
          {evento.vagas_restantes} de {evento.vagas_totais} vagas
        </p>
      </div>

      {/* 3 botões lado a lado (grid de 3 colunas).
          Cada um com uma cor diferente pra dar hierarquia:
            Cinza  = ação neutra (Ver)
            Azul   = ação principal (Editar)
            Vermelho = ação destrutiva (Excluir) */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {/* Ver: abre o modal (onVerMais é passado pela página) */}
        <button
          onClick={onVerMais}
          className="text-center bg-zinc-200 hover:bg-zinc-300 text-zinc-700 py-2 rounded-md font-medium text-sm transition"
        >
          Ver
        </button>

        {/* Editar: navega pra página de edição. É um <Link>,
            não <button>, porque muda de URL. */}
        <Link
          href={`/eventos/${evento.id}/editar`}
          className="text-center bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-medium text-sm transition"
        >
          Editar
        </Link>

        {/* Excluir: chama onExcluir (que mostra window.confirm) */}
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