"use client";

import { useEffect, useState } from "react";
import { QUOTES } from "src/utils/constants";
import { Button } from "./ui/button";
import { AnotherEmoji } from "./ui/emojis";

// Scramble animation function similar to AnimatedTextArea
const scrambleText = (text: string | undefined, progress: number): string => {
  if (!text) return "";
  return text
    .split("")
    .map((char) => {
      // Keep spaces and special characters intact
      if (
        char === " " ||
        char === "?" ||
        char === "." ||
        char === "," ||
        char === "!"
      )
        return char;
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

interface QuotesProps {
  className?: string;
}

export const Quotes = ({ className }: QuotesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrambling, setIsScrambling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState(QUOTES[0]?.quote || "");
  const [displayAuthor, setDisplayAuthor] = useState(QUOTES[0]?.by || "");

  // Handle the scramble animation
  const handleShuffle = () => {
    if (isScrambling) return; // Prevent multiple shuffles at once

    setIsScrambling(true);
    let currentProgress = 0;

    const scrambleInterval = setInterval(() => {
      currentProgress += 0.05;
      if (currentProgress >= 1) {
        clearInterval(scrambleInterval);
        // Update to next quote
        setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
        setProgress(0);
        setIsScrambling(false);
      } else {
        setProgress(currentProgress);
      }
    }, 30);
  };

  // Update display text during scrambling
  useEffect(() => {
    if (isScrambling) {
      setDisplayText(scrambleText(QUOTES[currentIndex]?.quote, progress));
      // Don't scramble author until halfway through the animation
      if (progress > 0.5) {
        setDisplayAuthor(scrambleText(QUOTES[currentIndex]?.by, progress));
      }
    } else {
      setDisplayText(QUOTES[currentIndex]?.quote || "");
      setDisplayAuthor(QUOTES[currentIndex]?.by || "");
    }
  }, [currentIndex, isScrambling, progress]);

  return (
    <div
      className={`rounded-lg border border-border bg-background p-4 shadow-sm ${className}`}
    >
      <div className="mb-4 flex flex-col space-y-2">
        <p className="font-secondary text-lg italic text-muted-foreground">
          &ldquo;{displayText}&rdquo;
        </p>
        <p className="text-right font-secondary text-sm text-muted-foreground">
          — {displayAuthor}
        </p>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShuffle}
          disabled={isScrambling}
          className="group transition-all duration-300"
        >
          <span>Shuffle</span>
          <AnotherEmoji className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Quotes;
