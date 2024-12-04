"use client";
import { useEffect } from "react";
import { Sun, MoonStar } from "lucide-react";
import { useTheme, useToggleTheme, useInitialTheme } from "src/hooks/useTheme";

const ThemeSwitcher = () => {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const initialTheme = useInitialTheme();

  useEffect(() => {
    initialTheme();
  }, [initialTheme]);

  return (
    <button
      className="flex items-center justify-center rounded-full bg-kernel p-2"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <MoonStar size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeSwitcher;
