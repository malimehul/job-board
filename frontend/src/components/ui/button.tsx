import * as React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

/**
 * Reusable primary/secondary Button component with variant and sizing configurations.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium leading-none transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200",
          variant === "outline" && "border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900",
          variant === "ghost" && "hover:bg-zinc-100 dark:hover:bg-zinc-900",

          size === "default" && "h-10 px-4 text-sm",
          size === "sm" && "h-8 px-3 rounded-md text-xs",
          size === "lg" && "h-11 px-8 rounded-md text-base",

          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
