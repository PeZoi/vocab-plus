'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export function UserAvatar({
  src,
  name,
  size = 'md',
  className,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-brand/20 via-purple-500/20 to-brand/10 border border-brand/30 text-brand font-bold flex items-center justify-center select-none flex-shrink-0 shadow-xs',
          sizeClasses[size],
          className
        )}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-base border border-border/80 overflow-hidden relative flex-shrink-0 shadow-xs',
        sizeClasses[size],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name || 'Avatar'}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
