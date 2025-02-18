"use client";

import { useEffect, useState } from "react";
import { useScramble } from "src/context/ScrambleContext";

const scrambleText = (text: string | undefined, progress: number): string => {
  if (!text) return "";
  const maxLength = 8;
  return text
    .split("")
    .slice(0, maxLength)
    .map((char) => {
      // Keep spaces intact
      if (char === " ") return char;
      // Use a smoother easing function
      const easeInOutCubic =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const scrambleChance = Math.sin(easeInOutCubic * Math.PI);
      return Math.random() > scrambleChance
        ? char
        : String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Using uppercase letters
    })
    .join("");
};

export const ScrambleText = ({ className }: { className?: string }) => {
  const { currentPair, isScrambling, progress } = useScramble();
  const [displayText, setDisplayText] = useState(currentPair.title);

  useEffect(() => {
    if (isScrambling) {
      setDisplayText(scrambleText(currentPair.title, progress));
    } else {
      setDisplayText(currentPair.title);
    }
  }, [currentPair, isScrambling, progress]);

  return <span className={className}>{displayText}</span>;
};
