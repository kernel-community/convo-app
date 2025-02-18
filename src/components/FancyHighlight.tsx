import type { ReactNode } from "react";
import { cn } from "src/lib/utils";

export const FancyHighlight = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "relative inline-block cursor-pointer before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-highlight",
        className
      )}
    >
      <span className="relative text-highlight-foreground">{children}</span>
    </span>
  );
};
