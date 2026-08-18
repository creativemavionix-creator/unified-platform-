import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-signal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary: solid purple pill, dominant CTA
        default:
          "bg-signal text-white hover:bg-signal-hover rounded-pill shadow-lg shadow-signal/20 hover:shadow-signal/30 font-semibold",
        // Secondary/Ghost: outlined pill, no fill
        outline:
          "border-signal/30 text-signal hover:bg-signal/10 hover:border-signal/50 rounded-pill dark:border-signal/40 dark:hover:bg-signal/15",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-pill",
        ghost:
          "hover:bg-muted hover:text-foreground rounded-lg",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-pill",
        link: "text-signal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-6 text-sm",
        xs: "h-7 gap-1 px-3 text-xs",
        sm: "h-8 gap-1.5 px-4 text-sm",
        lg: "h-12 gap-2 px-8 text-base",
        icon: "size-9 rounded-lg",
        "icon-xs": "size-7 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
