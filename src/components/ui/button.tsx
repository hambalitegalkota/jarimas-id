import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm sm:text-base font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:brightness-90 active:scale-[0.98] shadow-sm",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-95 active:scale-[0.98] shadow-sm font-bold",
        action:
          "bg-secondary text-secondary-foreground hover:brightness-95 active:scale-[0.98] shadow-sm font-bold",
        accent:
          "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 active:scale-[0.98]",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-red-700 active:scale-[0.98] shadow-sm",
        link: "text-primary underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default:
          "min-h-[48px] h-12 gap-2.5 px-5 py-3 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "min-h-[32px] h-8 gap-1.5 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "min-h-[40px] h-10 gap-2 rounded-lg px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "min-h-[56px] h-14 gap-3 rounded-2xl px-6 text-lg",
        icon: "size-12 rounded-xl",
        "icon-xs": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-10 rounded-lg [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-14 rounded-2xl",
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
