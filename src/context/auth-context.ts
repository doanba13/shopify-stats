import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const TTL = 1000 * 60 * 60 * 24 * 2;

interface AuthState {
  authenticated: boolean;
  expiresAt: number | null;
  setAuth: (authenticated: boolean) => void;
  logout: () => void;
}

export const useAuthContext = create<AuthState>()(
  persist(
    (set) => ({
      authenticated: false,
      expiresAt: null,

      setAuth: (authenticated: boolean) => {
        if (authenticated) {
          set({
            authenticated: true,
            expiresAt: Date.now() + TTL,
          });
        } else {
          set({ authenticated: false, expiresAt: null });
        }
      },

      logout: () => set({ authenticated: false, expiresAt: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const { expiresAt } = state;
        if (expiresAt && Date.now() > expiresAt) {
          state.authenticated = false;
          state.expiresAt = null;
        }
      },
    }
  )
);
