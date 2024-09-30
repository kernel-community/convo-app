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
          document.body.setAttribute("data-dynamic-theme", newTheme);
          return { theme: newTheme };
        }),
      initialTheme: () => {
        if (typeof window === "undefined") return;
        let theme = get().theme;
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
          theme = "dark";
          set({ theme: "dark" });
        } else if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        document.body.setAttribute("data-dynamic-theme", theme);
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
