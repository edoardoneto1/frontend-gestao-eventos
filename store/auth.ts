import { create } from "zustand";
import type { AuthUser } from "@/types";
import { login as apiLogin, logout as apiLogout, getStoredUser } from "@/lib/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiLogin(email, password);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    apiLogout();
    set({ user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const user = getStoredUser();
    set({ user, isAuthenticated: !!user });
  },
}));
