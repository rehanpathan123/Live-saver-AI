import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("h-10 w-full rounded-lg border border-border bg-white/5 px-3 text-sm outline-none focus:border-accent", className)}
      {...props}
    />
  );
}
