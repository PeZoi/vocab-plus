'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import type { LottieHandle } from 'lottie-react';
import { cn } from '@/lib/utils';
import { CircleDot, Sprout, Leaf, Trees, Flower2, Crown, Sparkles } from 'lucide-react';

// Dynamic import named export Lottie with ssr: false to prevent hydration errors on SSR
const Lottie = dynamic(
  () => import('lottie-react').then((mod) => mod.Lottie),
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

const SIZE_MAP: Record<string, { container: string; px: number }> = {
  xs: { container: 'w-4 h-4', px: 16 },
  sm: { container: 'w-5 h-5', px: 20 },
  md: { container: 'w-7 h-7', px: 28 },
  lg: { container: 'w-10 h-10', px: 40 },
  xl: { container: 'w-16 h-16', px: 64 },
};

// Global in-memory cache for downloaded animation JSONs to prevent refetching
const animationCache: Record<string, object> = {};

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
  const [animationData, setAnimationData] = useState<object | null>(
    () => animationCache[animationKey] || null
  );
  const [hasError, setHasError] = useState(false);
  const lottieRef = useRef<LottieHandle>(null);

  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  useEffect(() => {
    let active = true;

    if (animationCache[animationKey]) {
      return;
    }

    const jsonPath = `/animations/levels/${animationKey}.json`;
    fetch(jsonPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
        return res.json();
      })
      .then((data) => {
        animationCache[animationKey] = data;
        if (active) {
          setAnimationData(data);
        }
      })
      .catch((err) => {
        console.warn(`Lottie load failed for ${animationKey}, using fallback:`, err);
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, [animationKey]);

  // Handle trigger on hover
  const handleMouseEnter = () => {
    if (triggerOnHover && lottieRef.current) {
      lottieRef.current.seek(0);
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (triggerOnHover && lottieRef.current) {
      lottieRef.current.pause();
    }
  };

  // Fallback vector icon when loading, error, or on low-power devices
  const renderFallback = () => {
    if (fallbackIcon) return fallbackIcon;

    switch (animationKey) {
      case 'seed':
        return <CircleDot className={cn(sizeConfig.container, 'text-slate-400')} />;
      case 'sprout':
        return <Sprout className={cn(sizeConfig.container, 'text-lime-400')} />;
      case 'sapling':
        return <Leaf className={cn(sizeConfig.container, 'text-emerald-400')} />;
      case 'tree':
        return <Trees className={cn(sizeConfig.container, 'text-teal-400')} />;
      case 'blossom':
        return <Flower2 className={cn(sizeConfig.container, 'text-rose-400')} />;
      case 'ancient-tree':
        return <Crown className={cn(sizeConfig.container, 'text-amber-300')} />;
      case 'level-up-burst':
        return <Sparkles className={cn(sizeConfig.container, 'text-amber-400')} />;
      default:
        return <Sprout className={cn(sizeConfig.container, 'text-lime-400')} />;
    }
  };

  if (!isMounted || hasError || !animationData) {
    return (
      <div className={cn('inline-flex items-center justify-center', sizeConfig.container, className)}>
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
      className={cn(
        'inline-flex items-center justify-center shrink-0 select-none pointer-events-auto',
        sizeConfig.container,
        className
      )}
    >
      <Lottie
        lottieRef={lottieRef}
        src={animationData}
        loop={shouldLoop}
        autoplay={shouldAutoplay}
        className="w-full h-full"
      />
    </div>
  );
}
