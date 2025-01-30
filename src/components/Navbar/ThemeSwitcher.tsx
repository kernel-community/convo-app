"use client";
import { useEffect, useState } from "react";
import { Sun, MoonStar, Sunset } from "lucide-react";
import { useTheme, useSetTheme, useInitialTheme } from "src/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { cn } from "src/lib/utils";

const ThemeSwitcher = () => {
  const theme = useTheme();
  const setTheme = useSetTheme();
  const initialTheme = useInitialTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialTheme();
    setMounted(true);
  }, [initialTheme]);

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <MoonStar size={20} />;
      case "sunset":
        return <Sunset size={20} />;
      default:
        return <Sun size={20} />;
    }
  };

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center rounded-full bg-kernel p-2 outline-none"
          aria-label="Theme options"
        >
          {getThemeIcon()}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuItem
          className={cn(theme === "light" && "bg-accent")}
          onClick={() => setTheme("light")}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(theme === "dark" && "bg-accent")}
          onClick={() => setTheme("dark")}
        >
          <MoonStar className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(theme === "sunset" && "bg-accent")}
          onClick={() => setTheme("sunset")}
        >
          <Sunset className="mr-2 h-4 w-4" />
          <span>Sunset</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
