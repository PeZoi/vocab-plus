'use client';

import React, { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import type { LeagueTier } from '@/constants/leagues';
import { LEAGUE_TIERS_CONFIG } from '@/constants/leagues';

import unrankedAnim from '@/public/animations/ranks/unranked.json';
import ironAnim from '@/public/animations/ranks/iron.json';
import bronzeAnim from '@/public/animations/ranks/bronze.json';
import silverAnim from '@/public/animations/ranks/silver.json';
import platinumAnim from '@/public/animations/ranks/platinum.json';
import emeraldAnim from '@/public/animations/ranks/emerald.json';
import diamondAnim from '@/public/animations/ranks/diamond.json';
import masterAnim from '@/public/animations/ranks/master.json';
import grandmasterAnim from '@/public/animations/ranks/grandmaster.json';
import challengerAnim from '@/public/animations/ranks/challenger.json';

const RANK_ANIMATION_MAP: Record<LeagueTier, object> = {
  unranked: unrankedAnim,
  iron: ironAnim,
  bronze: bronzeAnim,
  silver: silverAnim,
  platinum: platinumAnim,
  emerald: emeraldAnim,
  diamond: diamondAnim,
  master: masterAnim,
  grandmaster: grandmasterAnim,
  challenger: challengerAnim,
};

// Dynamic import named export Lottie for Next.js SSR safety
const Lottie = dynamic(
  () => import('lottie-react').then((mod) => ({ default: mod.Lottie })),
  { ssr: false }
);

interface RankLottieIconProps {
  tier: LeagueTier;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'podium';
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const SIZE_MAP: Record<string, { container: string; px: number }> = {
  xs: { container: 'w-5 h-5', px: 20 },
  sm: { container: 'w-7 h-7', px: 28 },
  md: { container: 'w-10 h-10', px: 40 },
  lg: { container: 'w-16 h-16', px: 64 },
  xl: { container: 'w-24 h-24', px: 96 },
  podium: { container: 'w-28 h-28 sm:w-32 sm:h-32', px: 128 },
};

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function RankLottieIcon({
  tier = 'unranked',
  size = 'md',
  loop = true,
  autoplay = true,
  className,
}: RankLottieIconProps) {
  const isMounted = useIsMounted();
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;
  const config = LEAGUE_TIERS_CONFIG[tier] || LEAGUE_TIERS_CONFIG.unranked;
  const animData = RANK_ANIMATION_MAP[tier] || RANK_ANIMATION_MAP.unranked;

  if (!isMounted) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center shrink-0 rounded-full font-bold select-none',
          sizeConfig.container,
          config.badgeBg,
          config.badgeBorder,
          className
        )}
        style={{ width: sizeConfig.px, height: sizeConfig.px }}
      >
        <span className="text-sm">{config.icon}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none overflow-visible',
        sizeConfig.container,
        className
      )}
      style={{ width: sizeConfig.px, height: sizeConfig.px }}
    >
      <Lottie
        src={animData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
