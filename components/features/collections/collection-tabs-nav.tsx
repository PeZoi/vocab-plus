'use client';

import { Globe, User } from 'lucide-react';
import React from 'react';

interface CollectionTabsNavProps {
  activeTab: 'my' | 'community';
  onTabChange: (tab: 'my' | 'community') => void;
}

export function CollectionTabsNav({ activeTab, onTabChange }: CollectionTabsNavProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border/70 pb-3">
      <button
        type="button"
        onClick={() => onTabChange('my')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
          activeTab === 'my'
            ? 'bg-brand text-white shadow-xs shadow-brand/30'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface'
        }`}
      >
        <User className="w-4 h-4" />
        <span>Bộ từ của tôi</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('community')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
          activeTab === 'community'
            ? 'bg-brand text-white shadow-xs shadow-brand/30'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>Thư viện cộng đồng</span>
      </button>
    </div>
  );
}
