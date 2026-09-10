'use client';

import React, { useRef, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import type { LottieHandle } from 'lottie-react';
import { cn } from '@/lib/utils';
import { CircleDot, Sprout, Leaf, Trees, Flower2, Crown, Sparkles } from 'lucide-react';

// Static import animation JSONs to eliminate network fetch errors, CORS, and latency
import seedAnimation from '@/public/animations/levels/seed.json';
import sproutAnimation from '@/public/animations/levels/sprout.json';
import saplingAnimation from '@/public/animations/levels/sapling.json';
import treeAnimation from '@/public/animations/levels/tree.json';
import blossomAnimation from '@/public/animations/levels/blossom.json';
import ancientTreeAnimation from '@/public/animations/levels/ancient-tree.json';
import levelUpBurstAnimation from '@/public/animations/levels/level-up-burst.json';

// Map of static animation data
const STATIC_ANIMATION_MAP: Record<string, object> = {
  seed: seedAnimation,
  sprout: sproutAnimation,
  sapling: saplingAnimation,
  tree: treeAnimation,
  blossom: blossomAnimation,
  'ancient-tree': ancientTreeAnimation,
  'level-up-burst': levelUpBurstAnimation,
};

// Dynamic import named export Lottie with { default: mod.Lottie } to support Next.js SSR-safe loading
const Lottie = dynamic(
  () => import('lottie-react').then((mod) => ({ default: mod.Lottie })),
  { ssr: false }
);

export type LottieAnimationKey =
  | 'seed'
  | 'sprout'
  | 'sapling'
  | 'tree'
  | 'blossom'
  | 'ancient-tree'
  | 'level-up-burst';

interface LottieIconProps {
  animationKey: LottieAnimationKey | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loop?: boolean;
  autoplay?: boolean;
  triggerOnHover?: boolean;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const SIZE_MAP: Record<string, { container: string; iconSize: number; px: number }> = {
  xs: { container: 'w-4 h-4', iconSize: 14, px: 16 },
  sm: { container: 'w-6 h-6', iconSize: 18, px: 24 },
  md: { container: 'w-8 h-8', iconSize: 22, px: 32 },
  lg: { container: 'w-11 h-11', iconSize: 28, px: 44 },
  xl: { container: 'w-16 h-16', iconSize: 48, px: 64 },
};

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function LottieIcon({
  animationKey,
  size = 'md',
  loop = true,
  autoplay = true,
  triggerOnHover = false,
  className,
  fallbackIcon,
}: LottieIconProps) {
  const isMounted = useIsMounted();
  const lottieRef = useRef<LottieHandle>(null);

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // Retrieve static animation data directly (no network fetch needed)
  const animationData = STATIC_ANIMATION_MAP[animationKey] || null;

  // Handle trigger on hover
  const handleMouseEnter = () => {
    if (triggerOnHover && lottieRef.current) {
      try {
        lottieRef.current.seek(0);
        lottieRef.current.play();
      } catch {
        // Safe catch for lottie player instance
      }
    }
  };

  const handleMouseLeave = () => {
    if (triggerOnHover && lottieRef.current) {
      try {
        lottieRef.current.pause();
      } catch {
        // Safe catch for lottie player instance
      }
    }
  };

  // Fallback vector icon when loading, error, or on low-power devices
  const renderFallback = () => {
    if (fallbackIcon) return fallbackIcon;

    const iconProps = {
      size: sizeConfig.iconSize,
      className: 'transition-transform shrink-0',
    };

    switch (animationKey) {
      case 'seed':
        return <CircleDot {...iconProps} className="text-amber-400" />;
      case 'sprout':
        return <Sprout {...iconProps} className="text-lime-400" />;
      case 'sapling':
        return <Leaf {...iconProps} className="text-emerald-400" />;
      case 'tree':
        return <Trees {...iconProps} className="text-teal-400" />;
      case 'blossom':
        return <Flower2 {...iconProps} className="text-rose-400" />;
      case 'ancient-tree':
        return <Crown {...iconProps} className="text-amber-300" />;
      case 'level-up-burst':
        return <Sparkles {...iconProps} className="text-amber-400" />;
      default:
        return <Sprout {...iconProps} className="text-lime-400" />;
    }
  };

  if (!isMounted || !animationData) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center shrink-0 select-none',
          sizeConfig.container,
          className
        )}
      >
        {renderFallback()}
      </div>
    );
  }

  const shouldAutoplay = triggerOnHover ? false : autoplay;
  const shouldLoop = triggerOnHover ? true : loop;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: sizeConfig.px, height: sizeConfig.px }}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden',
        sizeConfig.container,
        className
      )}
    >
      <Lottie
        lottieRef={lottieRef}
        src={animationData}
        loop={shouldLoop}
        autoplay={shouldAutoplay}
        style={{ width: sizeConfig.px, height: sizeConfig.px }}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
