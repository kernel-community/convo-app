"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "sunset" | null;

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initialTheme: () => void;
}

export const useThemeStore = create(
  persist<ThemeState>(
    (set, get) => ({
      theme: null,
      setTheme: (newTheme: Theme) =>
        set((state) => {
          if (typeof window === "undefined") return { theme: state.theme };

          // Remove all theme classes first
          document.documentElement.classList.remove("light", "dark", "sunset");

          // Add the new theme class if it's not light
          if (newTheme && newTheme !== "light") {
            document.documentElement.classList.add(newTheme);
          }

          document.body.setAttribute("data-dynamic-theme", newTheme || "light");
          return { theme: newTheme };
        }),
      initialTheme: () => {
        if (typeof window === "undefined") return;
        let theme = get().theme;
        const preferedTheme = "light" as Theme;

        if (!theme) {
          theme = preferedTheme;
          set({ theme: preferedTheme });
        }

        // Remove all theme classes first
        document.documentElement.classList.remove("light", "dark", "sunset");

        // Add the appropriate theme class and set attribute only if theme is not null
        if (theme) {
          if (theme !== "light") {
            document.documentElement.classList.add(theme);
          }
          document.body.setAttribute("data-dynamic-theme", theme);
        }
      },
    }),
    {
      name: "theme-storage",
    }
  )
);

const selectors = {
  theme: (state: ThemeState) => state.theme,
  setTheme: (state: ThemeState) => state.setTheme,
  initialTheme: (state: ThemeState) => state.initialTheme,
};

export const useTheme = () => useThemeStore(selectors.theme);
export const useSetTheme = () => useThemeStore(selectors.setTheme);
export const useInitialTheme = () => useThemeStore(selectors.initialTheme);
