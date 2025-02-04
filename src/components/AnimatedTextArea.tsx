"use client";

import { useEffect, useState } from "react";
import { useScramble } from "src/context/ScrambleContext";

const scrambleText = (text: string | undefined, progress: number): string => {
  if (!text) return "";
  return text
    .split("")
    .map((char) => {
      // Keep spaces and special characters intact
      if (char === " " || char === "?" || char === ".") return char;
      // Use a smoother easing function
      const easeInOutCubic =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const scrambleChance = Math.sin(easeInOutCubic * Math.PI);
      return Math.random() > scrambleChance
        ? char
        : String.fromCharCode(97 + Math.floor(Math.random() * 26));
    })
    .join("");
};

export const AnimatedTextArea = ({
  className,
  value,
  onChange,
  onClick,
  isCollapsed = false,
}: {
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  isCollapsed?: boolean;
}) => {
  const { currentPair, isScrambling, progress } = useScramble();
  const [displayText, setDisplayText] = useState(currentPair.placeholder);

  useEffect(() => {
    if (isScrambling) {
      setDisplayText(scrambleText(currentPair.placeholder, progress));
    } else {
      setDisplayText(currentPair.placeholder);
    }
  }, [currentPair, isScrambling, progress]);
  return (
    <textarea
      placeholder={displayText}
      className={`transition-all duration-300 ease-in-out placeholder:text-muted-foreground/50 ${className} ${
        isCollapsed
          ? "h-[60px] cursor-pointer overflow-scroll border-0 border-2 border-gray-300 bg-skin p-[18px]"
          : "h-[180px]"
      } `}
      value={value}
      onChange={onChange}
      onClick={(e) => {
        // if (isCollapsed) {
        //   setIsManuallyExpanded(true);
        // }
        onClick?.(e);
      }}
      onBlur={() => {
        // if (isCollapsed) {
        //   setIsManuallyExpanded(false);
        // }
      }}
    />
  );
};
