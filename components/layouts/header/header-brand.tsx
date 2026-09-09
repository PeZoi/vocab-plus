'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, Menu } from 'lucide-react';
import { useUIStore } from '@/stores/use-ui-store';

export function HeaderBrand() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface md:hidden cursor-pointer"
        title="Mở menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link href="/" className="flex items-center gap-2 group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white shadow-2xs"
        >
          <BookOpen className="w-4 h-4" />
        </motion.div>
        <span className="font-semibold text-base tracking-tight text-text-primary group-hover:text-brand transition-colors">
          Vocab<span className="text-brand">App</span>
        </span>
      </Link>
    </div>
  );
}
