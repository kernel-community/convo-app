"use client";
import { useEffect, useState } from "react";
import { Sun, MoonStar } from "lucide-react";
import { useTheme, useToggleTheme, useInitialTheme } from "src/hooks/useTheme";

const ThemeSwitcher = () => {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const initialTheme = useInitialTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialTheme();
    setMounted(true);
  }, [initialTheme]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-kernel p-2"
        aria-label="Loading theme switcher"
      />
    );
  }

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
