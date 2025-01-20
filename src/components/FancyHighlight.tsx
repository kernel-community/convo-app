import type { ReactNode } from "react";

export const FancyHighlight = ({ children }: { children: ReactNode }) => {
  return (
    <span className="relative inline-block cursor-pointer before:absolute before:-inset-1 before:block before:-skew-y-3 before:bg-highlight">
      <span className="relative text-primary">{children}</span>
    </span>
  );
};
