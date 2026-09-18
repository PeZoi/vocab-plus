import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-brand/15 dark:text-brand dark:border-brand/30',
        secondary:
          'bg-slate-100/90 text-slate-700 border-slate-200 dark:bg-surface dark:text-text-secondary dark:border-border',
        success:
          'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-success/15 dark:text-success dark:border-success/30',
        warning:
          'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-warning/15 dark:text-warning dark:border-warning/30',
        danger:
          'bg-red-50 text-red-700 border-red-200/80 dark:bg-danger/15 dark:text-danger dark:border-danger/30',
        outline: 'text-text-primary border-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
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
