"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Header
//
// Cabeçalho global da aplicação.
// Fica no topo de todas as páginas internas (exceto /login).
//
// É "adaptativo": mostra coisas diferentes conforme o usuário
// está logado ou não:
//
//   Deslogado:              Logado:
//   ┌─────────────┐         ┌─────────────────────────────┐
//   │ Entrar      │         │ Olá, admin                  │
//   │ Criar Conta │         │ [Minhas Inscrições]         │
//   └─────────────┘         │ [Meus Certificados] [Sair]  │
//                           └─────────────────────────────┘
// ─────────────────────────────────────────────────────────────

export function Header() {
  // Lê o estado global do Zustand
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // ↑ Se o usuário está logado

  const user = useAuthStore((s) => s.user);
  // ↑ Dados do usuário (email, id, name)

  const logout = useAuthStore((s) => s.logout);
  // ↑ Função que limpa localStorage + estado + redireciona pra /login

  return (
    <header className="bg-blue-900 text-white">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo (à esquerda).
            Link: navegação client-side (sem recarregar a página). */}
        <Link href="/" className="text-xl font-bold">
          EventHub
        </Link>

        {/* Área direita: muda conforme o login */}
        <div className="flex gap-4 items-center">
          {isAuthenticated && user ? (
            // ────────────────────────────────────────────
            // USUÁRIO LOGADO
            // ────────────────────────────────────────────
            <>
              {/* Mostra só a parte antes do @ do email.
                  Ex: admin@boilerplatejwt.com.br → "admin" */}
              <span className="text-sm">Olá, {user.email.split("@")[0]}</span>

              {/* Botões de navegação rápida */}
              <Link
                href="/minhas-inscricoes"
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md font-medium transition text-sm"
              >
                Minhas Inscrições
              </Link>
              <Link
                href="/meus-certificados"
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md font-medium transition text-sm"
              >
                Meus Certificados
              </Link>

              {/* Botão de logout.
                  Não é Link porque não navega: chama uma função. */}
              <button
                onClick={logout}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md font-medium transition text-sm"
              >
                Sair
              </button>
            </>
          ) : (
            // ────────────────────────────────────────────
            // USUÁRIO DESLOGADO
            // ────────────────────────────────────────────
            <>
              {/* Link de texto simples */}
              <Link
                href="/login"
                className="hover:text-orange-400 transition"
              >
                Entrar
              </Link>

              {/* Botão destacado.
                  ?tab=register faz o /login abrir direto na aba de cadastro */}
              <Link
                href="/login?tab=register"
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md font-medium transition"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}