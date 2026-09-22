import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

// ─────────────────────────────────────────────────────────────
// PÁGINA INICIAL (Landing Page)
//
// Essa é a primeira tela que qualquer usuário vê ao acessar
// o site. É pública (não exige login).
//
// É só uma "montagem": importa o Header e o Hero e junta.
// Toda a lógica está dentro dos componentes.
// ─────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div>
      {/* Cabeçalho com logo + botões Entrar / Criar Conta */}
      <Header />
      {/* Seção principal com imagem + título + botão "Explorar Eventos" */}
      <Hero />
    </div>
  );
}