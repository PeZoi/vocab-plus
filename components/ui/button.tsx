'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none tracking-tight',
  {
    variants: {
      variant: {
        primary:
          'bg-brand hover:bg-brand-hover text-white font-medium border border-brand/40 shadow-xs hover:shadow-sm',
        brand:
          'bg-brand hover:bg-brand-hover text-white shadow-xs',
        surface:
          'bg-surface/90 hover:bg-surface-hover text-text-primary border border-border/80 shadow-xs hover:border-border',
        outline:
          'border border-border/70 bg-transparent hover:bg-surface/80 text-text-primary hover:border-border',
        ghost:
          'hover:bg-surface-hover/70 hover:text-text-primary text-text-secondary',
        success:
          'bg-success/90 hover:bg-success text-white font-medium border border-success/30 shadow-xs',
        danger:
          'bg-danger/90 hover:bg-danger text-white font-medium border border-danger/30 shadow-xs',
        warning:
          'bg-warning/90 hover:bg-warning text-[#0B0F17] font-medium shadow-xs',
      },
      size: {
        default: 'h-9 px-3.5 py-1.5',
        sm: 'h-8 px-2.5 text-xs rounded-md',
        lg: 'h-10.5 px-5 text-sm rounded-lg',
        icon: 'h-8.5 w-8.5 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, whileTap, whileHover, asChild: _asChild, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        whileTap={whileTap ?? { scale: 0.98 }}
        whileHover={whileHover ?? { scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
