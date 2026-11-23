import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
const variants = cva("btn", {
  variants: { variant: { default: "primary", outline: "secondary" } },
  defaultVariants: { variant: "default" },
});
interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  asChild?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ asChild, variant, className, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(variants({ variant }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
