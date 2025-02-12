import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "src/lib/utils";
import { Skeleton } from "./skeleton";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-md py-2 px-8 font-secondary transition-all duration-150 ease-in-out bg-primary text-primary-foreground touch-none select-none shadow-[4px_4px_0px_0px] shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px] active:shadow-foreground md:shadow-[8px_8px_0px_0px] md:shadow-foreground md:hover:translate-x-[2px] md:hover:translate-y-[4px] md:hover:shadow-[4px_4px_0px_0px] md:hover:shadow-foreground md:active:translate-x-[4px] md:active:translate-y-[4px] md:active:shadow-none",
        destructive:
          "rounded-md py-2 px-8 font-secondary border-2 border-transparent transition-all duration-300 ease-in-out bg-destructive text-destructive-foreground hover:border-primary-foreground",
        outline:
          "rounded-md py-2 px-8 font-secondary border-2 transition-all duration-300 ease-in-out bg-background text-foreground hover:bg-accent hover:border-accent-foreground",
        secondary:
          "rounded-md py-2 px-8 font-secondary border-2 border-transparent transition-all duration-300 ease-in-out bg-secondary text-secondary-foreground hover:border-secondary-foreground",
        ghost:
          "rounded-md py-2 px-8 font-secondary border-2 border-transparent transition-all duration-300 ease-in-out text-foreground hover:bg-accent hover:border-accent-foreground",
        link: "font-secondary transition-all duration-300 ease-in-out text-primary-foreground underline-offset-4 hover:underline hover:decoration-dotted",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    if (isLoading) {
      return (
        <Skeleton
          className={cn(buttonVariants({ variant, size, className }))}
        />
      );
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
