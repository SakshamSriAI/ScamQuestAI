import React from 'react';
import { ArrowDownLeft, ArrowUpRight, AlertTriangle, Shield, Check } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export function TransactionDetails({ claimedAmount = null, contextTitle = '', isUPI = false }) {
  if (!claimedAmount && !isUPI) return null;

  const isCollect = contextTitle.toLowerCase().includes('collect') || contextTitle.toLowerCase().includes('refund');

  return (
    <div className="my-2.5 p-3.5 rounded-xl bg-[#1B201C] border border-[#2F3730] text-[#F3F0E8] space-y-2.5 shadow-sm">
      <div className="flex items-center justify-between text-xs font-mono border-b border-[#2B322D] pb-2">
        <span className="text-[#A3A69F] uppercase tracking-wider text-[10px]">
          {isCollect ? 'Incoming UPI Collect Request' : 'Transaction Summary'}
        </span>
        <span className="px-1.5 py-0.5 rounded-sm bg-[#D7B66D]/15 text-[#D7B66D] border border-[#D7B66D]/30 text-[9px] font-bold">
          {isCollect ? 'ACTION REQUIRED' : 'ALERT'}
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xl sm:text-2xl font-mono font-bold text-[#F3F0E8]">
            {formatCurrency(claimedAmount || 0)}
          </span>
          <span className="text-[10px] font-mono text-[#777A73] block">
            {isCollect ? 'Requested from your account' : 'Referenced Amount'}
          </span>
        </div>

        {isCollect && (
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-sm bg-[#D96B59]/20 text-[#D96B59] border border-[#D96B59]/40 text-[10px] font-mono font-semibold">
              Debits Your Money
            </span>
          </div>
        )}
      </div>

      {isCollect && (
        <div className="pt-2 border-t border-[#2B322D] flex items-center justify-between gap-2">
          {/* Fictional non-functional buttons mirroring real UPI prompt */}
          <button
            type="button"
            disabled
            className="flex-1 py-1.5 px-3 rounded-md bg-[#242A25] border border-[#333C36] text-[11px] font-mono text-[#A3A69F] opacity-75 cursor-not-allowed"
          >
            Decline
          </button>
          <button
            type="button"
            disabled
            className="flex-1 py-1.5 px-3 rounded-md bg-[#D96B59]/30 border border-[#D96B59]/50 text-[11px] font-mono text-[#D96B59] font-bold opacity-75 cursor-not-allowed"
          >
            Pay {formatCurrency(claimedAmount || 0)}
          </button>
        </div>
      )}
    </div>
  );
}
