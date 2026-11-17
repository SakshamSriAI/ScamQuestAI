import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Bell, ShieldAlert } from 'lucide-react';

export function NotificationPreview({ senderId = '', contextTitle = '', previewSnippet = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="mx-3 mt-2 p-3 rounded-xl bg-[#282F2A]/90 backdrop-blur-md border border-[#3B453E] shadow-xl text-[#F3F0E8] select-none"
    >
      <div className="flex items-center justify-between text-[10px] font-mono text-[#A3A69F] mb-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#171B18] flex items-center justify-center text-[#A6C66A]">
            <Bell className="w-2.5 h-2.5" />
          </div>
          <span className="font-semibold text-[#F3F0E8]">{senderId || 'MESSAGES'}</span>
        </div>
        <span>JUST NOW</span>
      </div>

      <div className="space-y-0.5">
        <span className="font-display font-bold text-xs text-[#F3F0E8] block truncate">
          {contextTitle || 'New Financial Alert'}
        </span>
        <p className="text-[11px] font-sans text-[#DCD6C7] line-clamp-1">
          {previewSnippet}
        </p>
      </div>
    </motion.div>
  );
}
