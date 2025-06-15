
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-taupe focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-charcoal text-brand-background hover:bg-brand-taupe-dark hover:shadow-brand-elevation font-brand-heading tracking-brand-wide uppercase transition-all duration-300",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-brand-subtle hover:shadow-brand-elevation",
        outline:
          "border-2 border-brand-charcoal bg-transparent text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-background hover:shadow-brand-elevation font-brand-heading tracking-brand-wide uppercase transition-all duration-300",
        secondary:
          "bg-brand-taupe text-brand-charcoal hover:bg-brand-taupe-dark hover:text-brand-background hover:shadow-brand-elevation font-brand-heading tracking-brand-wide uppercase transition-all duration-300",
        ghost: "text-brand-charcoal hover:bg-brand-taupe/20 hover:shadow-sm font-brand-heading tracking-brand-wide uppercase transition-all duration-300",
        link: "text-brand-charcoal underline-offset-4 hover:underline font-brand-body transition-all duration-300",
        brand: "bg-transparent border-2 border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-brand-background font-brand-heading tracking-brand-wide uppercase transition-all duration-300 shadow-brand-subtle hover:shadow-brand-elevation"
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 rounded-md px-6 text-xs",
        lg: "h-14 rounded-lg px-10 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
