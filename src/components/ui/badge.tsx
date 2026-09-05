import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#005A36] text-white",
        secondary:
          "border-transparent bg-neutral-100 text-neutral-900",
        destructive:
          "border-transparent bg-red-500 text-white",
        gold:
          "border-transparent bg-[#FFC72C] text-neutral-950 font-bold",
        outline: "text-neutral-950 border-neutral-300",
        hot: "border-red-400 bg-red-50 text-red-700 font-bold",
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
