"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="bg-blue-900 text-white">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo (esquerda) */}
        <Link href="/" className="text-xl font-bold">
          EventHub
        </Link>

        {/* Botões (direita) */}
        <div className="flex gap-4 items-center">
          <Link
            href="/login"
            className="hover:text-orange-400 transition"
          >
            Entrar
          </Link>
          <Link
            href="/login?tab=register"
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md font-medium transition"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </header>
  );
}
