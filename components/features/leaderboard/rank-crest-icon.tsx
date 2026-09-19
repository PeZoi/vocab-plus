'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { LeagueTier } from '@/constants/leagues';

export interface RankCrestIconProps {
  tier: LeagueTier;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'podium' | '2xl';
  animated?: boolean;
  showGlow?: boolean;
  className?: string;
}

const SIZE_MAP: Record<string, { container: string; px: number }> = {
  xs: { container: 'w-5 h-5', px: 20 },
  sm: { container: 'w-7 h-7', px: 28 },
  md: { container: 'w-10 h-10', px: 40 },
  lg: { container: 'w-16 h-16', px: 64 },
  xl: { container: 'w-24 h-24', px: 96 },
  podium: { container: 'w-28 h-28 sm:w-32 sm:h-32', px: 128 },
  '2xl': { container: 'w-36 h-36 sm:w-40 sm:h-40', px: 160 },
};

export function RankCrestIcon({
  tier = 'unranked',
  size = 'md',
  animated = true,
  showGlow = true,
  className,
}: RankCrestIconProps) {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none overflow-visible group',
        sizeConfig.container,
        className
      )}
      style={{ width: sizeConfig.px, height: sizeConfig.px }}
    >
      {/* Background Aura Glow */}
      {showGlow && (
        <div
          className={cn(
            'absolute inset-0 rounded-full blur-md opacity-40 pointer-events-none transition-opacity duration-300',
            animated && 'animate-pulse duration-3000',
            getTierAuraBg(tier)
          )}
        />
      )}

      {/* Main SVG Crest */}
      <svg
        viewBox="0 0 100 100"
        className={cn(
          'w-full h-full drop-shadow-md transition-transform duration-300',
          animated && 'hover:scale-105 active:scale-95'
        )}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderCrestSvg(tier)}
      </svg>
    </div>
  );
}

function getTierAuraBg(tier: LeagueTier): string {
  switch (tier) {
    case 'iron':
      return 'bg-zinc-400/30';
    case 'bronze':
      return 'bg-amber-600/35';
    case 'silver':
      return 'bg-slate-300/40';
    case 'platinum':
      return 'bg-cyan-400/40';
    case 'emerald':
      return 'bg-emerald-400/45';
    case 'diamond':
      return 'bg-blue-400/50';
    case 'master':
      return 'bg-purple-500/50';
    case 'grandmaster':
      return 'bg-rose-600/55';
    case 'challenger':
      return 'bg-amber-300/60';
    case 'unranked':
    default:
      return 'bg-slate-400/20';
  }
}

function renderCrestSvg(tier: LeagueTier) {
  switch (tier) {
    case 'unranked':
      return <UnrankedCrest />;
    case 'iron':
      return <IronCrest />;
    case 'bronze':
      return <BronzeCrest />;
    case 'silver':
      return <SilverCrest />;
    case 'platinum':
      return <PlatinumCrest />;
    case 'emerald':
      return <EmeraldCrest />;
    case 'diamond':
      return <DiamondCrest />;
    case 'master':
      return <MasterCrest />;
    case 'grandmaster':
      return <GrandmasterCrest />;
    case 'challenger':
      return <ChallengerCrest />;
    default:
      return <UnrankedCrest />;
  }
}

/* =========================================================================
   1. UNRANKED CREST (Ancient Rune Stone Shield)
   ========================================================================= */
function UnrankedCrest() {
  return (
    <>
      <defs>
        <linearGradient id="unranked-plate" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="45%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="unranked-rim" x1="50" y1="8" x2="50" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="unranked-core" x1="50" y1="32" x2="50" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Outer Rune Shield */}
      <polygon
        points="50,10 82,23 88,60 50,90 12,60 18,23"
        fill="url(#unranked-plate)"
        stroke="url(#unranked-rim)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Inset Bevel */}
      <polygon
        points="50,17 76,28 81,58 50,83 19,58 24,28"
        fill="#1E293B"
        fillOpacity="0.5"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Center Rune Circle */}
      <circle cx="50" cy="50" r="18" fill="url(#unranked-core)" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="12" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />

      {/* Dormant Energy Diamond in Center */}
      <polygon points="50,42 57,50 50,58 43,50" fill="#E2E8F0" opacity="0.9" />
      <circle cx="50" cy="50" r="2.5" fill="#38BDF8" />

      {/* Subtle Studs */}
      <circle cx="50" cy="18" r="2" fill="#CBD5E1" />
      <circle cx="80" cy="58" r="2" fill="#94A3B8" />
      <circle cx="20" cy="58" r="2" fill="#94A3B8" />
    </>
  );
}

/* =========================================================================
   2. IRON CREST (Spiked Iron Bastion Shield)
   ========================================================================= */
function IronCrest() {
  return (
    <>
      <defs>
        <linearGradient id="iron-metal-l" x1="10" y1="15" x2="90" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="25%" stopColor="#64748B" />
          <stop offset="70%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="iron-metal-r" x1="90" y1="15" x2="10" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="35%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="iron-edge" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="iron-blade" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Side Spikes / Armor Horns */}
      <path d="M12 36 L24 20 L24 45 Z" fill="#334155" stroke="url(#iron-edge)" strokeWidth="1.5" />
      <path d="M88 36 L76 20 L76 45 Z" fill="#334155" stroke="url(#iron-edge)" strokeWidth="1.5" />

      {/* Main Bastion Heavy Shield */}
      <polygon
        points="50,8 80,22 75,64 50,92 25,64 20,22"
        fill="url(#iron-metal-l)"
        stroke="url(#iron-edge)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Plate Bevel Left/Right Split */}
      <path d="M50 14 L72 26 L68 62 L50 86 Z" fill="url(#iron-metal-r)" opacity="0.8" />
      <path d="M50 14 L28 26 L32 62 L50 86 Z" fill="#1E293B" opacity="0.6" />

      {/* Center Broadsword / Spiked Cross */}
      <path d="M50 18 L55 35 L62 38 L54 44 L56 74 L50 82 L44 74 L46 44 L38 38 L45 35 Z" fill="url(#iron-blade)" stroke="#1E293B" strokeWidth="1.5" />

      {/* Center Boss Gem */}
      <polygon points="50,42 56,49 50,56 44,49" fill="#F1F5F9" />
      <circle cx="50" cy="49" r="2" fill="#475569" />

      {/* Heavy Rivets */}
      <circle cx="28" cy="28" r="2" fill="#CBD5E1" />
      <circle cx="72" cy="28" r="2" fill="#CBD5E1" />
      <circle cx="33" cy="58" r="2" fill="#94A3B8" />
      <circle cx="67" cy="58" r="2" fill="#94A3B8" />
      <circle cx="50" cy="14" r="2" fill="#F1F5F9" />
    </>
  );
}

/* =========================================================================
   3. BRONZE CREST (Centurion Antique Bronze Shield)
   ========================================================================= */
function BronzeCrest() {
  return (
    <>
      <defs>
        <linearGradient id="bronze-gold" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="25%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="bronze-rim" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id="bronze-amber-gem" x1="50" y1="36" x2="50" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* Side Roman Eagle Wing Brackets */}
      <path d="M12 28 C16 42 22 55 30 65 L22 45 L15 35 Z" fill="#92400E" stroke="url(#bronze-rim)" strokeWidth="1.5" />
      <path d="M88 28 C84 42 78 55 70 65 L78 45 L85 35 Z" fill="#92400E" stroke="url(#bronze-rim)" strokeWidth="1.5" />

      {/* Main Bronze Shield */}
      <polygon
        points="50,7 84,20 78,66 50,93 22,66 16,20"
        fill="url(#bronze-gold)"
        stroke="url(#bronze-rim)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Inset Layer */}
      <polygon
        points="50,15 76,26 71,62 50,85 29,62 24,26"
        fill="#451A03"
        fillOpacity="0.65"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Embossed Eagle Wings Centerpiece */}
      <path
        d="M50 24 L60 38 L68 34 L62 48 L50 44 L38 48 L32 34 L40 38 Z"
        fill="url(#bronze-gold)"
        stroke="#FDE68A"
        strokeWidth="1"
      />

      {/* Tiger-Eye Amber Gem Center */}
      <polygon
        points="50,38 60,50 50,62 40,50"
        fill="url(#bronze-amber-gem)"
        stroke="#FDE68A"
        strokeWidth="1.5"
      />
      <polygon points="50,42 56,50 50,58 44,50" fill="#FEF08A" opacity="0.8" />
      <circle cx="50" cy="50" r="2.5" fill="#FFFBEB" />

      {/* Shield Bottom Anchor Spike */}
      <polygon points="50,66 54,76 50,82 46,76" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />

      {/* Golden Bronze Studs */}
      <circle cx="50" cy="12" r="2.2" fill="#FEF08A" />
      <circle cx="75" cy="24" r="2.2" fill="#FEF08A" />
      <circle cx="25" cy="24" r="2.2" fill="#FEF08A" />
    </>
  );
}

/* =========================================================================
   4. SILVER CREST (Demacia Silver Paladin Crest)
   ========================================================================= */
function SilverCrest() {
  return (
    <>
      <defs>
        <linearGradient id="silver-metal" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#E2E8F0" />
          <stop offset="65%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="silver-rim" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#CBD5E1" />
          <stop offset="85%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="silver-blue-core" x1="50" y1="36" x2="50" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* Upward Soaring Knight Wings (Left) */}
      <path
        d="M24 38 C14 26 12 12 18 6 C24 16 28 26 30 38 Z"
        fill="url(#silver-metal)"
        stroke="url(#silver-rim)"
        strokeWidth="1.5"
      />
      <path
        d="M28 44 C20 36 18 24 23 18 C28 27 31 35 33 46 Z"
        fill="#CBD5E1"
        stroke="#94A3B8"
        strokeWidth="1"
      />

      {/* Upward Soaring Knight Wings (Right) */}
      <path
        d="M76 38 C86 26 88 12 82 6 C76 16 72 26 70 38 Z"
        fill="url(#silver-metal)"
        stroke="url(#silver-rim)"
        strokeWidth="1.5"
      />
      <path
        d="M72 44 C80 36 82 24 77 18 C72 27 69 35 67 46 Z"
        fill="#CBD5E1"
        stroke="#94A3B8"
        strokeWidth="1"
      />

      {/* Main Silver Shield Body */}
      <polygon
        points="50,14 78,26 72,66 50,93 28,66 22,26"
        fill="url(#silver-metal)"
        stroke="url(#silver-rim)"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />

      {/* Shield Inner Bevel */}
      <polygon
        points="50,22 70,32 66,62 50,84 34,62 30,32"
        fill="#1E293B"
        fillOpacity="0.45"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Demacia Radiant Sword */}
      <path
        d="M50 16 L53 38 L62 40 L53 44 L54 74 L50 82 L46 74 L47 44 L38 40 L47 38 Z"
        fill="url(#silver-metal)"
        stroke="#FFFFFF"
        strokeWidth="1.2"
      />

      {/* Sapphire Guard Gem */}
      <polygon points="50,42 56,48 50,54 44,48" fill="url(#silver-blue-core)" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="50" cy="48" r="1.8" fill="#F0F9FF" />

      {/* Top Cross Star */}
      <polygon points="50,8 52,14 58,16 52,18 50,24 48,18 42,16 48,14" fill="#FFFFFF" />
    </>
  );
}

/* =========================================================================
   5. PLATINUM CREST (Hextech Falcon Crest)
   ========================================================================= */
function PlatinumCrest() {
  return (
    <>
      <defs>
        <linearGradient id="plat-wing" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CFFAFE" />
          <stop offset="25%" stopColor="#67E8F9" />
          <stop offset="60%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>
        <linearGradient id="plat-metal" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="40%" stopColor="#CBD5E1" />
          <stop offset="80%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#155E75" />
        </linearGradient>
        <linearGradient id="plat-crystal" x1="50" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#A5F3FC" />
          <stop offset="70%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
      </defs>

      {/* Hextech Aerodynamic Wings (Left) */}
      <polygon points="26,42 6,24 16,14 32,32" fill="url(#plat-wing)" stroke="#67E8F9" strokeWidth="1.5" />
      <polygon points="28,52 8,36 14,28 32,44" fill="#0891B2" stroke="#22D3EE" strokeWidth="1.2" />

      {/* Hextech Aerodynamic Wings (Right) */}
      <polygon points="74,42 94,24 84,14 68,32" fill="url(#plat-wing)" stroke="#67E8F9" strokeWidth="1.5" />
      <polygon points="72,52 92,36 86,28 68,44" fill="#0891B2" stroke="#22D3EE" strokeWidth="1.2" />

      {/* Main Platinum Core Armor */}
      <polygon
        points="50,6 80,24 74,68 50,94 26,68 20,24"
        fill="url(#plat-metal)"
        stroke="#67E8F9"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Piltover Geometric Chevron Plate */}
      <polygon
        points="50,16 72,30 66,64 50,84 34,64 28,30"
        fill="#083344"
        fillOpacity="0.75"
        stroke="#22D3EE"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Hextech Energy Crystal (Diamond Octagon) */}
      <polygon
        points="50,30 64,45 64,55 50,70 36,55 36,45"
        fill="url(#plat-crystal)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      {/* Crystal Internal Facets */}
      <line x1="50" y1="30" x2="50" y2="70" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
      <line x1="36" y1="50" x2="64" y2="50" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
      <circle cx="50" cy="50" r="3" fill="#FFFFFF" />

      {/* Top Hextech Anchor */}
      <polygon points="50,10 55,18 45,18" fill="#67E8F9" stroke="#FFFFFF" strokeWidth="1" />
    </>
  );
}

/* =========================================================================
   6. EMERALD CREST (Imperial Emerald Dragon Crest)
   ========================================================================= */
function EmeraldCrest() {
  return (
    <>
      <defs>
        <linearGradient id="emerald-gem" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="25%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="emerald-gold" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="emerald-core-facet" x1="50" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>

      {/* Imperial Gold Dragon Horns / Wings */}
      <path
        d="M24 36 C12 24 10 8 18 2 C22 14 26 26 30 38 Z"
        fill="url(#emerald-gold)"
        stroke="#FDE68A"
        strokeWidth="1.5"
      />
      <path
        d="M76 36 C88 24 90 8 82 2 C78 14 74 26 70 38 Z"
        fill="url(#emerald-gold)"
        stroke="#FDE68A"
        strokeWidth="1.5"
      />

      {/* Dragon Scales Shoulder Guards */}
      <polygon points="12,42 26,38 24,56 10,50" fill="#047857" stroke="url(#emerald-gold)" strokeWidth="1.2" />
      <polygon points="88,42 74,38 76,56 90,50" fill="#047857" stroke="url(#emerald-gold)" strokeWidth="1.2" />

      {/* Main Jade Crest Frame */}
      <polygon
        points="50,8 82,24 76,68 50,94 24,68 18,24"
        fill="url(#emerald-gem)"
        stroke="url(#emerald-gold)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Gold Royal Inset Filigree */}
      <polygon
        points="50,16 74,28 68,64 50,85 32,64 26,28"
        fill="#022C22"
        fillOpacity="0.7"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Central Magnificent Cut Emerald */}
      <polygon
        points="50,26 66,44 66,56 50,74 34,56 34,44"
        fill="url(#emerald-core-facet)"
        stroke="#A7F3D0"
        strokeWidth="1.8"
      />
      {/* Brilliant Cut Facets */}
      <polygon points="50,34 60,46 50,58 40,46" fill="#A7F3D0" fillOpacity="0.6" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="50" cy="46" r="3" fill="#FFFFFF" />

      {/* Golden Crown Finial */}
      <polygon points="50,2 54,10 50,14 46,10" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
    </>
  );
}

/* =========================================================================
   7. DIAMOND CREST (Prismatic Diamond Crest)
   ========================================================================= */
function DiamondCrest() {
  return (
    <>
      <defs>
        <linearGradient id="dia-ice" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="25%" stopColor="#93C5FD" />
          <stop offset="65%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="dia-edge" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#BAE6FD" />
          <stop offset="70%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="dia-center-gem" x1="50" y1="25" x2="50" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#BFDBFE" />
          <stop offset="70%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Multi-layered Crystalline Ice Wings (Left) */}
      <polygon points="26,38 4,18 16,10 32,28" fill="url(#dia-ice)" stroke="url(#dia-edge)" strokeWidth="1.5" />
      <polygon points="28,52 6,34 14,24 34,42" fill="#2563EB" stroke="#93C5FD" strokeWidth="1.2" />
      <polygon points="24,24 10,4 20,2 30,18" fill="#EFF6FF" stroke="#FFFFFF" strokeWidth="1" />

      {/* Multi-layered Crystalline Ice Wings (Right) */}
      <polygon points="74,38 96,18 84,10 68,28" fill="url(#dia-ice)" stroke="url(#dia-edge)" strokeWidth="1.5" />
      <polygon points="72,52 94,34 86,24 66,42" fill="#2563EB" stroke="#93C5FD" strokeWidth="1.2" />
      <polygon points="76,24 90,4 80,2 70,18" fill="#EFF6FF" stroke="#FFFFFF" strokeWidth="1" />

      {/* Diamond Body Shape */}
      <polygon
        points="50,4 84,24 76,70 50,96 24,70 16,24"
        fill="url(#dia-ice)"
        stroke="url(#dia-edge)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Dark Void Contrast Inset */}
      <polygon
        points="50,14 74,28 68,66 50,87 32,66 26,28"
        fill="#0F172A"
        fillOpacity="0.7"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 3D Brilliant Diamond Core */}
      <polygon
        points="50,22 70,42 70,54 50,78 30,54 30,42"
        fill="url(#dia-center-gem)"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      {/* Precision Facet Star Lines */}
      <polygon points="50,30 62,45 50,62 38,45" fill="#DBEAFE" fillOpacity="0.65" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="50" cy="45" r="3.5" fill="#FFFFFF" />

      {/* 4-Point Prism Sparkle Star */}
      <polygon points="50,8 52,14 58,16 52,18 50,24 48,18 42,16 48,14" fill="#FFFFFF" />
    </>
  );
}

/* =========================================================================
   8. MASTER CREST (Void Sorcery Archon Crest)
   ========================================================================= */
function MasterCrest() {
  return (
    <>
      <defs>
        <linearGradient id="master-void" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5D0FE" />
          <stop offset="25%" stopColor="#C084FC" />
          <stop offset="60%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>
        <linearGradient id="master-rim" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E9D5FF" />
          <stop offset="70%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
        <linearGradient id="master-eye" x1="50" y1="30" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#F472B6" />
          <stop offset="70%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#4A044E" />
        </linearGradient>
      </defs>

      {/* Curved Shadow Arcane Horns (Left) */}
      <path
        d="M24 38 C8 24 4 6 12 0 C16 14 22 28 28 42 Z"
        fill="url(#master-void)"
        stroke="url(#master-rim)"
        strokeWidth="1.5"
      />
      {/* Curved Shadow Arcane Horns (Right) */}
      <path
        d="M76 38 C92 24 96 6 88 0 C84 14 78 28 72 42 Z"
        fill="url(#master-void)"
        stroke="url(#master-rim)"
        strokeWidth="1.5"
      />

      {/* Triple Archon Crown Spikes */}
      <polygon points="50,0 56,16 44,16" fill="#F5D0FE" stroke="#FFFFFF" strokeWidth="1" />
      <polygon points="34,6 42,18 32,20" fill="#C084FC" stroke="#E9D5FF" strokeWidth="1" />
      <polygon points="66,6 58,18 68,20" fill="#C084FC" stroke="#E9D5FF" strokeWidth="1" />

      {/* Main Archon Void Body */}
      <polygon
        points="50,8 86,26 78,72 50,96 22,72 14,26"
        fill="url(#master-void)"
        stroke="url(#master-rim)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Deep Void Inset */}
      <polygon
        points="50,18 76,32 70,66 50,88 30,66 24,32"
        fill="#1E0B2B"
        stroke="#C084FC"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Eye of the Void Pulsing Gem */}
      <polygon
        points="50,26 68,44 68,56 50,76 32,56 32,44"
        fill="url(#master-eye)"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      {/* Void Pupil Diamond */}
      <polygon points="50,36 60,50 50,64 40,50" fill="#F5D0FE" fillOpacity="0.75" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="3" fill="#FFFFFF" />

      {/* Arcane Rune Glyphs */}
      <circle cx="50" cy="18" r="2.2" fill="#FFFFFF" />
      <circle cx="34" cy="70" r="2" fill="#E9D5FF" />
      <circle cx="66" cy="70" r="2" fill="#E9D5FF" />
    </>
  );
}

/* =========================================================================
   9. GRANDMASTER CREST (Crimson Dragon Sovereign Crest)
   ========================================================================= */
function GrandmasterCrest() {
  return (
    <>
      <defs>
        <linearGradient id="gm-crimson" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="25%" stopColor="#EF4444" />
          <stop offset="60%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#450A0A" />
        </linearGradient>
        <linearGradient id="gm-gold-rim" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#450A0A" />
        </linearGradient>
        <linearGradient id="gm-ruby-heart" x1="50" y1="28" x2="50" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#F87171" />
          <stop offset="70%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>

      {/* Majestic Molten Dragon Horns (Left) */}
      <path
        d="M26 36 C8 20 2 2 12 -2 C18 10 24 24 30 38 Z"
        fill="url(#gm-crimson)"
        stroke="url(#gm-gold-rim)"
        strokeWidth="1.8"
      />
      <path
        d="M20 48 C6 38 2 26 8 20 C14 26 18 36 24 48 Z"
        fill="#991B1B"
        stroke="#F59E0B"
        strokeWidth="1.2"
      />

      {/* Majestic Molten Dragon Horns (Right) */}
      <path
        d="M74 36 C92 20 98 2 88 -2 C82 10 76 24 70 38 Z"
        fill="url(#gm-crimson)"
        stroke="url(#gm-gold-rim)"
        strokeWidth="1.8"
      />
      <path
        d="M80 48 C94 38 98 26 92 20 C86 26 82 36 76 48 Z"
        fill="#991B1B"
        stroke="#F59E0B"
        strokeWidth="1.2"
      />

      {/* Molten Noxus Shield Armor */}
      <polygon
        points="50,6 88,26 80,72 50,98 20,72 12,26"
        fill="url(#gm-crimson)"
        stroke="url(#gm-gold-rim)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Obsidian & Gold Border */}
      <polygon
        points="50,16 78,32 72,66 50,88 28,66 22,32"
        fill="#1C0505"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Blazing Ruby Dragon Eye Gem */}
      <polygon
        points="50,26 70,44 70,58 50,78 30,58 30,44"
        fill="url(#gm-ruby-heart)"
        stroke="#FEF08A"
        strokeWidth="1.8"
      />
      {/* Ruby Inner Fire Facets */}
      <polygon points="50,34 62,48 50,64 38,48" fill="#FCA5A5" fillOpacity="0.7" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="50" cy="48" r="3" fill="#FFFFFF" />

      {/* Top Dragon Crest Spike */}
      <polygon points="50,-2 55,8 50,12 45,8" fill="#FEF08A" stroke="#B91C1C" strokeWidth="1.2" />
    </>
  );
}

/* =========================================================================
   10. CHALLENGER CREST (Celestial Sovereign Crown)
   ========================================================================= */
function ChallengerCrest() {
  return (
    <>
      <defs>
        <linearGradient id="chal-gold" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="20%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="chal-rim" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id="chal-celestial-core" x1="50" y1="28" x2="50" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#BAE6FD" />
          <stop offset="65%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>
      </defs>

      {/* Celestial Multi-Tier Wings (Left) */}
      <path
        d="M24 38 C6 22 2 4 12 -2 C18 10 24 24 30 38 Z"
        fill="url(#chal-gold)"
        stroke="url(#chal-rim)"
        strokeWidth="1.8"
      />
      <path
        d="M18 50 C4 36 2 24 8 18 C14 26 18 38 24 50 Z"
        fill="#D97706"
        stroke="#FEF08A"
        strokeWidth="1.2"
      />

      {/* Celestial Multi-Tier Wings (Right) */}
      <path
        d="M76 38 C94 22 98 4 88 -2 C82 10 76 24 70 38 Z"
        fill="url(#chal-gold)"
        stroke="url(#chal-rim)"
        strokeWidth="1.8"
      />
      <path
        d="M82 50 C96 36 98 24 92 18 C86 26 82 38 76 50 Z"
        fill="#D97706"
        stroke="#FEF08A"
        strokeWidth="1.2"
      />

      {/* Supreme 5-Spike Sovereign Crown */}
      <polygon points="50,-4 57,12 43,12" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.2" />
      <polygon points="34,2 43,14 31,16" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
      <polygon points="66,2 57,14 69,16" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
      <polygon points="20,10 28,18 18,22" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
      <polygon points="80,10 72,18 82,22" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />

      {/* Main 24K Gold Sovereign Armor */}
      <polygon
        points="50,6 90,26 82,72 50,98 18,72 10,26"
        fill="url(#chal-gold)"
        stroke="url(#chal-rim)"
        strokeWidth="3.8"
        strokeLinejoin="round"
      />

      {/* Royal Deep Blue Contrast Inset */}
      <polygon
        points="50,16 80,32 74,68 50,90 26,68 20,32"
        fill="#082F49"
        stroke="#FDE047"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Divine Celestial Azure Gem at Center */}
      <polygon
        points="50,26 70,44 70,58 50,78 30,58 30,44"
        fill="url(#chal-celestial-core)"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      {/* Sacred Diamond Facets */}
      <polygon points="50,34 62,48 50,64 38,48" fill="#BAE6FD" fillOpacity="0.7" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="50" cy="48" r="3.5" fill="#FFFFFF" />

      {/* 8-Point Divine Sunburst Star */}
      <polygon points="50,6 52,12 58,14 52,16 50,22 48,16 42,14 48,12" fill="#FFFFFF" />
      <circle cx="50" cy="14" r="1.5" fill="#38BDF8" />
    </>
  );
}
