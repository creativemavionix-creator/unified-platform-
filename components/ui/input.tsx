import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-border/60 bg-void/50 px-4 py-2 text-sm text-foreground transition-all duration-200 outline-none",
        "placeholder:text-muted-foreground/60",
        "focus-visible:border-signal/60 focus-visible:ring-2 focus-visible:ring-signal/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-void/40 dark:border-border/40",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
