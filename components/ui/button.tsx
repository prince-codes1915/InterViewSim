import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "glass" | "cyan";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 border border-cyan-300/40",
      cyan:
        "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 border border-cyan-300/50",
      secondary:
        "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-md",
      outline:
        "border border-slate-700 bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 hover:border-cyan-500/50",
      danger:
        "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/25 border border-rose-500/30",
      ghost:
        "hover:bg-slate-800/60 text-slate-300 hover:text-white",
      glass:
        "bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-cyan-500/40 text-slate-100 hover:bg-slate-800/80 shadow-xl",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-bold",
      icon: "p-2.5 h-10 w-10 text-slate-300",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
