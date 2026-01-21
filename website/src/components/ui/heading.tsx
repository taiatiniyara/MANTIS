/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-semibold tracking-tight", {
  variants: {
    variant: {
      h1: "text-3xl sm:text-4xl lg:text-5xl",
      h2: "text-2xl sm:text-3xl lg:text-4xl",
      h3: "text-xl sm:text-2xl lg:text-3xl",
      h4: "text-lg sm:text-xl lg:text-2xl",
      h5: "text-base sm:text-lg lg:text-xl",
      h6: "text-sm sm:text-base lg:text-lg",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "h1",
    weight: "bold",
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, weight, as, ...props }, ref) => {
    const resolvedVariant: NonNullable<HeadingProps["as"]> = (variant as HeadingProps["as"]) || as || "h1";
    const Comp = as || resolvedVariant;
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ variant: resolvedVariant, weight }), className)}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

// Convenience components for each heading level
const H1 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Heading ref={ref} variant="h1" as="h1" className={className} {...props} />
  )
);
H1.displayName = "H1";

const H2 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Heading ref={ref} variant="h2" as="h2" className={className} {...props} />
  )
);
H2.displayName = "H2";

const H3 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Heading ref={ref} variant="h3" as="h3" className={className} {...props} />
  )
);
H3.displayName = "H3";

const H4 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Heading ref={ref} variant="h4" as="h4" className={className} {...props} />
  )
);
H4.displayName = "H4";

const H5 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Heading ref={ref} variant="h5" as="h5" className={className} {...props} />
  )
);
H5.displayName = "H5";

const H6 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Heading ref={ref} variant="h6" as="h6" className={className} {...props} />
  )
);
H6.displayName = "H6";

export { Heading, H1, H2, H3, H4, H5, H6, headingVariants };
