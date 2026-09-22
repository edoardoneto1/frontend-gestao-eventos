import { create } from "zustand";
import type { AuthUser } from "@/types";
import {
  login as apiLogin,
  logout as apiLogout,
  getStoredUser,
} from "@/lib/auth";

// ─────────────────────────────────────────────────────────────
// STORE DE AUTENTICAÇÃO (Zustand)
//
// Gerencia o estado GLOBAL da autenticação na aplicação.
// Qualquer componente pode ler/escrever nesse estado via o hook
// `useAuthStore`.
//
// DIFERENÇA em relação ao lib/auth.ts:
//   lib/auth.ts   → faz as operações (chama API, salva localStorage)
//   store/auth.ts → guarda o estado + notifica quem usa
//
// Sem isso, cada componente teria que ler o localStorage
// manualmente e não saberia quando o usuário loga/desloga.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// TIPAGEM DO ESTADO
// ─────────────────────────────────────────────────────────────
interface AuthState {
  // Dados
  user: AuthUser | null;      // Usuário logado (ou null se deslogado)
  isAuthenticated: boolean;   // Está logado?
  isLoading: boolean;         // Está fazendo login agora?

  // Ações
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

// ─────────────────────────────────────────────────────────────
// CRIAÇÃO DO STORE
//
// "create" vem do Zustand. Recebe uma função que retorna o
// objeto de estado inicial + as ações.
//
// "set" é uma função que atualiza o estado (parcialmente).
// O Zustand mescla o objeto novo no estado existente.
// ─────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  // ─────────────────────────────────────────────
  // ESTADO INICIAL
  // ─────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // ─────────────────────────────────────────────
  // LOGIN
  // Chama o backend, salva o token, atualiza o estado.
  // ─────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiLogin(email, password);
      // apiLogin() já salvou os tokens no localStorage
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      // Em caso de erro, desliga o "carregando"
      // e repassa o erro pra quem chamou tratar
      set({ isLoading: false });
      throw err;
    }
  },

  // ─────────────────────────────────────────────
  // LOGOUT
  // Chama a função de limpeza + reseta o estado.
  // ─────────────────────────────────────────────
  logout: () => {
    // apiLogout() limpa o localStorage e redireciona pra /login
    apiLogout();
    // Limpa o estado global
    set({ user: null, isAuthenticated: false });
  },

  // ─────────────────────────────────────────────
  // HYDRATE
  // Lê o usuário salvo no localStorage e coloca no estado.
  // Chamado pelo <AuthHydrator> quando o app carrega.
  // Sem isso, ao recarregar a página o usuário "deslogava"
  // visualmente (mesmo com token salvo).
  // ─────────────────────────────────────────────
  hydrate: () => {
    const user = getStoredUser();
    // Se existe user no localStorage, marca como logado.
    // O "!!" converte pra boolean (user ou null).
    set({ user, isAuthenticated: !!user });
  },
}));