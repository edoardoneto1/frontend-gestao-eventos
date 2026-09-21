"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="bg-blue-900 text-white">
      <div className="flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-xl font-bold">EventHub</Link>

        <div className="flex gap-4 items-center">
          {isAuthenticated && user ? (
            <>
              <span>Olá, {user.email.split("@")[0]}</span>
              <button onClick={logout} className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md font-medium transition">Sair</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-orange-400 transition">
                Entrar
              </Link>
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