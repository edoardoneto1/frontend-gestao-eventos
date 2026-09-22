import axios from "axios";

// ─────────────────────────────────────────────────────────────
// CLIENTE HTTP CENTRALIZADO
//
// Esse arquivo cria uma instância customizada do axios que é
// usada em TODA a aplicação pra falar com o backend.
//
// Ele já vem com 2 recursos prontos:
//   1. baseURL (não precisa repetir o endereço da API)
//   2. Interceptors (adiciona token automaticamente + trata 401)
//
// Uso em qualquer arquivo:
//   import api from "@/lib/api";
//   const r = await api.get("/events/eventos/");
// ─────────────────────────────────────────────────────────────

const api = axios.create({
  // Lê a URL da API do .env.local
  // Ex: http://localhost:8000/api/v1
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  headers: {
    "Content-Type": "application/json",
    // ↑ Diz ao backend que estamos enviando JSON
  },
});

// ─────────────────────────────────────────────────────────────
// INTERCEPTOR DE REQUISIÇÃO
//
// Roda ANTES de cada requisição sair.
// Pega o token do localStorage e adiciona no header.
// Assim o backend sabe quem está fazendo a chamada.
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // typeof window garante que estamos no navegador (não no SSR)
  // localStorage só existe no cliente.
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Formato esperado pelo backend: "Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─────────────────────────────────────────────────────────────
// INTERCEPTOR DE RESPOSTA
//
// Roda DEPOIS de cada resposta do backend.
// Se o token expirou (401), limpa o localStorage.
// Assim o front "desloga" automaticamente e o usuário
// é forçado a fazer login de novo.
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  // Resposta com sucesso: passa direto
  (response) => response,

  // Resposta com erro: verifica se é 401 (não autorizado)
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido: limpa os tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    // Rejeita a promise pra quem chamou poder tratar o erro
    return Promise.reject(error);
  }
);

export default api;