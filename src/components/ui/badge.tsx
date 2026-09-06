import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#FF3823] text-white",
        primary:
          "border-transparent bg-[#FF3823] text-white",
        secondary:
          "border-transparent bg-[#FFB703] text-[#1C1917] font-black",
        gold:
          "border-transparent bg-[#FFB703] text-[#1C1917] font-black",
        accent:
          "border-transparent bg-[#588157] text-white font-bold",
        destructive:
          "border-transparent bg-red-600 text-white",
        outline: "text-[#1C1917] border-[#1C1917]/20 bg-white",
        hot: "border-red-400 bg-red-50 text-[#FF3823] font-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
