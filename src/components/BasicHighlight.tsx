import type { ReactNode } from "react";
import { cn } from "src/lib/utils";

export const BasicHighlight = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "relative my-1 inline-block cursor-pointer px-1 before:absolute before:-inset-1 before:block before:bg-highlight",
        className
      )}
    >
      <span className="relative text-primary">{children}</span>
    </span>
  );
};
