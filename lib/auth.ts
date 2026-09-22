import api from "./api";
import type { LoginResponse } from "@/types";

// ─────────────────────────────────────────────────────────────
// FUNÇÕES DE AUTENTICAÇÃO
//
// Esse arquivo contém funções utilitárias que lidam com o
// ciclo de vida da autenticação:
//   - login: chama a API e salva os tokens
//   - logout: limpa os tokens e volta pro /login
//   - leitura: pega token/usuário do localStorage
//
// NÃO guarda estado (isso é papel do store/auth.ts).
// Só faz as operações "cruas" no localStorage e na API.
// ─────────────────────────────────────────────────────────────

// Chaves usadas no localStorage.
// Constantes pra evitar erros de digitação ("access_token" vs "acess_token")
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user_data";

// ─────────────────────────────────────────────────────────────
// LOGIN
//
// Faz POST /user/token/ no backend, recebe { access, refresh, user },
// e salva tudo no localStorage.
// ─────────────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/user/token/", {
    email,
    password,
  });

  const { access, refresh, user } = response.data;

  // Só salva se estiver no navegador (SSR não tem localStorage)
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    // user é objeto → precisa virar string pra caber no localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  return response.data;
}

// ─────────────────────────────────────────────────────────────
// LOGOUT
//
// Limpa os 3 itens do localStorage e redireciona pra /login.
// O redirecionamento é "hard" (recarrega a página) pra garantir
// que o Zustand também seja resetado.
// ─────────────────────────────────────────────────────────────
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/login";
  }
}

// ─────────────────────────────────────────────────────────────
// LEITURA DO TOKEN
//
// Retorna o access token salvo ou null.
// Usado principalmente pelo api.ts (interceptor de request).
// ─────────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  // Se estiver no servidor, não tem localStorage
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

// ─────────────────────────────────────────────────────────────
// LEITURA DO USUÁRIO
//
// Retorna o objeto do usuário salvo (desserializado).
// Usado pelo AuthHydrator pra restaurar a sessão ao recarregar.
// ─────────────────────────────────────────────────────────────
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  // Se não tem nada, retorna null. Se tem, faz JSON.parse.
  return raw ? JSON.parse(raw) : null;
}

// ─────────────────────────────────────────────────────────────
// VERIFICAÇÃO RÁPIDA
//
// Retorna true se há token salvo.
// O "!!" converte qualquer valor pra boolean:
//   "abc"  → true
//   null   → false
//   ""     → false
// ─────────────────────────────────────────────────────────────
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}