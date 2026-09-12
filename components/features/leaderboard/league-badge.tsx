'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { LeagueTier } from '@/constants/leagues';
import { LEAGUE_TIERS_CONFIG } from '@/constants/leagues';
import { RankLottieIcon } from './rank-lottie-icon';

interface LeagueBadgeProps {
  tier: LeagueTier;
  showLottie?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LeagueBadge({
  tier = 'unranked',
  showLottie = true,
  size = 'md',
  className,
}: LeagueBadgeProps) {
  const config = LEAGUE_TIERS_CONFIG[tier] || LEAGUE_TIERS_CONFIG.unranked;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
    lg: 'px-3.5 py-1.5 text-sm gap-2.5 font-bold',
  };

  const lottieSizes: Record<'sm' | 'md' | 'lg', 'xs' | 'sm' | 'md'> = {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold border transition-all duration-300 shadow-2xs',
        config.badgeBg,
        config.badgeBorder,
        config.badgeText,
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: `0 0 14px ${config.glowColor}`,
      }}
    >
      {showLottie ? (
        <RankLottieIcon tier={tier} size={lottieSizes[size]} />
      ) : (
        <span className="text-sm">{config.icon}</span>
      )}
      <span className="font-heading tracking-wide uppercase">{config.nameVi}</span>
    </div>
  );
}
