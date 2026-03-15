"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarButtonProps {
  starred: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function StarButton({ starred, onToggle, size = "sm", className }: StarButtonProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "rounded-lg flex items-center justify-center transition-all shrink-0",
        btnSize,
        starred
          ? "text-amber-500 hover:text-amber-600"
          : "text-muted-foreground/30 hover:text-muted-foreground/60",
        className
      )}
      title={starred ? "Odepnout" : "Připnout"}
    >
      <Star className={cn(iconSize, starred && "fill-current")} />
    </button>
  );
}
