import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF3823] text-white hover:bg-[#E02D1A] shadow-md focus-visible:ring-[#FF3823] active:scale-[0.97]",
        primary:
          "bg-[#FF3823] text-white hover:bg-[#E02D1A] shadow-md focus-visible:ring-[#FF3823] active:scale-[0.97]",
        secondary:
          "bg-[#FFB703] text-[#1C1917] font-black hover:bg-[#E5A400] shadow-md focus-visible:ring-[#FFB703] active:scale-[0.97]",
        gold:
          "bg-[#FFB703] text-[#1C1917] font-black hover:bg-[#E5A400] shadow-md focus-visible:ring-[#FFB703] active:scale-[0.97]",
        accent:
          "bg-[#588157] text-white hover:bg-[#476A46] shadow-md focus-visible:ring-[#588157] active:scale-[0.97]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-600",
        outline:
          "border-2 border-[#1C1917]/20 bg-white text-[#1C1917] hover:bg-[#FAF7F2] hover:border-[#1C1917] focus-visible:ring-[#1C1917]",
        ghost:
          "text-[#1C1917] hover:bg-[#FFB703]/20 hover:text-[#1C1917]",
        link:
          "text-[#FF3823] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-13 rounded-2xl px-7 text-base font-black",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
