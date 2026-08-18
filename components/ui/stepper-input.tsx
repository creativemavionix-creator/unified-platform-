"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StepperInputProps<T extends number> {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  className?: string;
  "aria-label"?: string;
}

export function StepperInput<T extends number>({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
}: StepperInputProps<T>) {
  const index = options.indexOf(value);

  const step = (direction: -1 | 1) => {
    const next = options[index + direction];
    if (next !== undefined) onChange(next);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border/40 bg-void/50 overflow-hidden",
        className
      )}
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={index <= 0}
        className="px-2.5 h-9 text-muted-foreground hover:text-bone hover:bg-surface/80 disabled:opacity-40"
        aria-label="Decrease variations"
      >
        −
      </button>
      <span className="min-w-[2.5rem] text-center text-scale-xs font-mono text-bone tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={index >= options.length - 1}
        className="px-2.5 h-9 text-muted-foreground hover:text-bone hover:bg-surface/80 disabled:opacity-40"
        aria-label="Increase variations"
      >
        +
      </button>
    </div>
  );
}
