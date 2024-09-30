"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ThemeState {
  theme: "dark" | "light";
  toggleTheme: () => void;
  initialTheme: () => void;
}

export const useThemeStore = create(
  persist<ThemeState>(
    (set, get) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => {
          let newTheme = state.theme;
          if (typeof window === "undefined") state.theme;
          if (state.theme === "dark") {
            document.documentElement.classList.remove("dark");
            newTheme = "light";
          } else {
            document.documentElement.classList.add("dark");
            newTheme = "dark";
          }
          return { theme: newTheme };
        }),
      initialTheme: () => {
        if (typeof window === "undefined") return;
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
          set({ theme: "dark" });
          return;
        }
        if (get().theme === "dark") {
          document.documentElement.classList.add("dark");
          return;
        }
        document.documentElement.classList.remove("dark");
        set({ theme: "light" });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);

const selectors = {
  theme: (state: ThemeState) => state.theme,
  toggleTheme: (state: ThemeState) => state.toggleTheme,
  initialThme: (state: ThemeState) => state.initialTheme,
};

export const useTheme = () => useThemeStore(selectors.theme);
export const useToggleTheme = () => useThemeStore(selectors.toggleTheme);
export const useInitialTheme = () => useThemeStore(selectors.initialThme);
