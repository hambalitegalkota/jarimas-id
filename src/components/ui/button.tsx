import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]",
        outline:
          "border-border bg-card text-foreground hover:bg-muted active:scale-[0.99]",
        secondary:
          "border border-border/80 bg-secondary text-secondary-foreground hover:bg-muted active:scale-[0.99]",
        accent:
          "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.99]",
        cyan:
          "border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 active:scale-[0.99]",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.99]",
        destructive:
          "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 active:scale-[0.99]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 rounded-md px-6 text-base",
        icon: "size-10 rounded-md",
        "icon-xs": "size-7 rounded [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-md",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
