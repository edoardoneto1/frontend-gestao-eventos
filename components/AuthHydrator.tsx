"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

// ─────────────────────────────────────────────────────────────
// COMPONENTE: AuthHydrator
//
// Envolve toda a aplicação (é usado no layout.tsx).
// Sua única função é "hidratar" o estado de autenticação:
// ou seja, quando o app carrega, ele lê o usuário e o token
// salvos no localStorage e coloca no Zustand.
//
// Sem isso, ao recarregar a página o usuário "perderia" a
// sessão visualmente (mesmo com o token salvo), porque o
// Zustand começa sempre com estado vazio.
// ─────────────────────────────────────────────────────────────

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  // ↑ Função do store que lê o localStorage e preenche o estado

  // Roda uma vez, quando o app carrega
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Não renderiza nada visualmente: só repassa os filhos.
  // O <>{children}</> é um "Fragment" — agrupa sem criar <div>.
  return <>{children}</>;
}