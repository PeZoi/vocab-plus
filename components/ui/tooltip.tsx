'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cn } from '@/lib/utils';

function TooltipProvider({
  delay = 100,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  );
}

export interface TooltipProps extends TooltipPrimitive.Root.Props {
  content?: React.ReactNode;
}

function Tooltip({ content, children, ...props }: TooltipProps) {
  if (content) {
    return (
      <TooltipPrimitive.Root data-slot="tooltip" {...props}>
        {React.isValidElement(children) ? (
          <TooltipPrimitive.Trigger data-slot="tooltip-trigger" render={children} />
        ) : (
          <TooltipPrimitive.Trigger data-slot="tooltip-trigger">
            {children as React.ReactNode}
          </TooltipPrimitive.Trigger>
        )}
        <TooltipContent>{content}</TooltipContent>
      </TooltipPrimitive.Root>
    );
  }
  return <TooltipPrimitive.Root data-slot="tooltip" {...props}>{children}</TooltipPrimitive.Root>;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  side = 'top',
  sideOffset = 6,
  align = 'center',
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 pointer-events-none"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            'z-50 inline-flex w-fit max-w-xs items-center justify-center rounded-lg bg-surface/95 border border-border px-2.5 py-1 text-xs font-medium text-text-primary shadow-md backdrop-blur-sm select-none animate-in fade-in-0 zoom-in-95',
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
