"use client";

import React from "react";
import { cn } from "src/lib/utils";
import { Sparkles } from "lucide-react";

interface BetaBadgeProps {
  className?: string;
}

export const BetaBadge: React.FC<BetaBadgeProps> = ({ className }) => {
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center justify-center rounded-full text-xs font-medium",
        "bg-gradient-to-r from-fuchsia-600 via-pink-500 to-violet-600 p-[1.5px]",
        "transition-all duration-300 hover:from-fuchsia-500 hover:via-pink-400 hover:to-violet-500",
        "shadow-sm hover:shadow-md",
        "bg-size-200 animate-gradient-rotate",
        className
      )}
    >
      <span className="flex items-center gap-1 rounded-full bg-background px-2 py-0.5 font-semibold">
        beta{" "}
        <Sparkles
          className="h-3.5 w-3.5 animate-pulse text-amber-400"
          strokeWidth={2.5}
        />
      </span>
    </span>
  );
};

export default BetaBadge;
