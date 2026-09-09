'use client';

import React from 'react';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/features/auth/use-google-auth';

export function HeaderUserActions() {
  const { signOut } = useGoogleAuth();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => signOut()}
      className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors ml-1 cursor-pointer hidden sm:block"
      title="Đăng xuất"
    >
      <LogOut className="w-4 h-4" />
    </motion.button>
  );
}
