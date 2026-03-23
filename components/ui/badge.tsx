import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/15 dark:text-red-400 dark:border-red-900/40",
        outline:
          "text-foreground border-border",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400 dark:border dark:border-green-900/40",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 dark:border dark:border-amber-900/40",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 dark:border dark:border-blue-900/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
