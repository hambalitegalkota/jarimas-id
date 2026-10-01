import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "min-h-[48px] h-12 w-full min-w-0 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-900 transition-all outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-base file:font-semibold file:text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
