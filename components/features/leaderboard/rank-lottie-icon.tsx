'use client';

import React from 'react';
import type { LeagueTier } from '@/constants/leagues';
import { RankCrestIcon, type RankCrestIconProps } from './rank-crest-icon';

export interface RankLottieIconProps extends Omit<RankCrestIconProps, 'tier'> {
  tier: LeagueTier;
  loop?: boolean;
  autoplay?: boolean;
}

export function RankLottieIcon({
  tier = 'unranked',
  size = 'md',
  animated = true,
  showGlow = true,
  className,
}: RankLottieIconProps) {
  return (
    <RankCrestIcon
      tier={tier}
      size={size}
      animated={animated}
      showGlow={showGlow}
      className={className}
    />
  );
}

export { RankCrestIcon };

