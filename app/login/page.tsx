"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";

// ─────────────────────────────────────────────────────────────
// Componente principal
// O Suspense é obrigatório porque useSearchParams lê a URL
// (?tab=register). Sem ele, o Next reclama em build.
// ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────
// Conteúdo da página (abas + formulários)
// ─────────────────────────────────────────────────────────────
function LoginContent() {
  const searchParams = useSearchParams();
  // ↑ Lê parâmetros da URL (ex: /login?tab=register)

  const tabFromUrl = searchParams.get("tab");

  // Aba ativa. Se a URL tem ?tab=register, começa na aba de cadastro.
  const [aba, setAba] = useState<"login" | "register">(
    tabFromUrl === "register" ? "register" : "login"
  );

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Abas (Entrar / Criar Conta).
            A aba ativa fica com fundo branco e borda azul embaixo. */}
        <div className="flex bg-white rounded-t-lg overflow-hidden border border-b-0 border-zinc-200">
          <button
            onClick={() => setAba("login")}
            className={`flex-1 py-4 font-medium transition ${
              aba === "login"
                ? "bg-white text-blue-900 border-b-2 border-blue-900"
                : "bg-zinc-100 text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setAba("register")}
            className={`flex-1 py-4 font-medium transition ${
              aba === "register"
                ? "bg-white text-blue-900 border-b-2 border-blue-900"
                : "bg-zinc-100 text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Renderiza o formulário correspondente à aba ativa */}
        <div className="bg-white rounded-b-lg border border-zinc-200 p-8">
          {aba === "login" ? <FormLogin /> : <FormCadastro />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORMULÁRIO DE LOGIN
// Envia email/senha pro backend. Em caso de sucesso, o store
// (Zustand) salva o usuário + token, e redireciona pra /.
// ─────────────────────────────────────────────────────────────
function FormLogin() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  // ↑ Função do store que faz POST /user/token/ e salva no localStorage

  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    try {
      // login() faz POST /user/token/ e salva o token no localStorage
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setErro("Email ou senha inválidos.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 text-center mb-6">
        Bem-vindo de volta!
      </h2>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md">
          {erro}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-md font-medium transition disabled:opacity-50"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-zinc-600 pt-2">
        Não tem conta?{" "}
        <button
          type="button"
          // Recarrega a página com ?tab=register pra mudar de aba
          onClick={() => (window.location.href = "/login?tab=register")}
          className="text-blue-900 font-medium hover:underline"
        >
          Criar conta
        </button>
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// FORMULÁRIO DE CADASTRO
// Faz POST /user/register/ e, em seguida, login automático.
// ─────────────────────────────────────────────────────────────
function FormCadastro() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [terms, setTerms] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);

  const [erro, setErro] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    // --- Validações locais (antes de enviar pro backend) ---
    if (password1 !== password2) {
      setErro("As senhas não são idênticas.");
      return;
    }

    if (!terms) {
      setErro("Você precisa aceitar os termos e condições.");
      return;
    }

    // Remove pontos/traços do CPF/CNPJ: "111.444.777-35" → "11144477735"
    const cpfLimpo = cpfCnpj.replace(/\D/g, "");
    if (cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
      setErro("CPF deve ter 11 dígitos ou CNPJ 14 dígitos.");
      return;
    }

    setIsLoading(true);

    try {
      // 1) Cria a conta
      await api.post("/user/register/", {
        email,
        cpf_cnpj: cpfLimpo,
        password1,
        password2,
        terms,
        receive_emails: receiveEmails,
      });

      // 2) Faz login automático (o backend não retorna token no register)
      await login(email, password1);
      router.push("/");
    } catch (err: unknown) {
      // Erros do backend (ex: email já cadastrado, CPF inválido)
      console.error(err);
      const axiosError = err as { response?: { data?: unknown } };
      if (axiosError.response?.data) {
        setErro(JSON.stringify(axiosError.response.data));
      } else {
        setErro("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-zinc-900 text-center mb-6">
        Crie sua conta
      </h2>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-md break-words">
          {erro}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
          placeholder="seu@email.com"
        />
      </div>

      {/* CPF ou CNPJ */}
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700">
          CPF ou CNPJ
        </label>
        <input
          type="text"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
          required
          maxLength={18}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
          placeholder="000.000.000-00"
        />
      </div>

      {/* Senha */}
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700">
          Senha
        </label>
        <input
          type="password"
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      {/* Confirmar senha */}
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700">
          Confirmar senha
        </label>
        <input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 placeholder:text-zinc-500"
          placeholder="Repita a senha"
        />
      </div>

      {/* Checkboxes: termos (obrigatório) + emails (opcional) */}
      <div className="space-y-2 pt-2">
        <label className="flex items-start gap-2 text-sm text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5"
            required
          />
          <span>Aceito os termos e condições da plataforma</span>
        </label>

        <label className="flex items-start gap-2 text-sm text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            checked={receiveEmails}
            onChange={(e) => setReceiveEmails(e.target.checked)}
            className="mt-0.5"
          />
          <span>Quero receber comunicações por email</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition disabled:opacity-50"
      >
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </button>

      <p className="text-center text-sm text-zinc-600 pt-2">
        Já tem conta?{" "}
        <button
          type="button"
          onClick={() => (window.location.href = "/login")}
          className="text-blue-900 font-medium hover:underline"
        >
          Entrar
        </button>
      </p>
    </form>
  );
}