import React from 'react';
import { ArrowLeft, Phone, MoreVertical, ShieldCheck, AlertCircle, Building2, User } from 'lucide-react';

export function MessageHeader({ senderId = 'SMS Notification', isUPI = false }) {
  // Check if sender looks like official TRAI alphanumeric header (e.g. AX-HDFCBK, VK-SBIINB)
  const isAlphanumericHeader = /^[A-Z]{2}-[A-Z0-9]+$/i.test(senderId.trim());
  const isPersonalNumber = /^\+?91?[6-9]\d{9}$/.test(senderId.replace(/\s+/g, ''));

  return (
    <div className="px-4 py-3 bg-[#1F2420] border-b border-[#2B322D] flex items-center justify-between text-[#F3F0E8] select-none">
      <div className="flex items-center gap-3">
        <ArrowLeft className="w-4 h-4 text-[#777A73]" />
        
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
          isAlphanumericHeader
            ? 'bg-[#A6C66A]/20 text-[#A6C66A] border border-[#A6C66A]/40'
            : isUPI
            ? 'bg-[#D7B66D]/20 text-[#D7B66D] border border-[#D7B66D]/40'
            : 'bg-[#282F2A] text-[#A3A69F] border border-[#333C36]'
        }`}>
          {isAlphanumericHeader ? (
            <Building2 className="w-4 h-4" />
          ) : isUPI ? (
            <span>₹</span>
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>

        {/* Sender details */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-sm tracking-tight text-[#F3F0E8]">
              {senderId}
            </span>
            {isAlphanumericHeader && (
              <span className="text-[10px] font-mono px-1 py-0.2 bg-[#A6C66A]/10 text-[#A6C66A] rounded-sm border border-[#A6C66A]/30">
                TRAI
              </span>
            )}
            {isPersonalNumber && (
              <span className="text-[10px] font-mono px-1 py-0.2 bg-[#D96B59]/15 text-[#D96B59] rounded-sm border border-[#D96B59]/30">
                Personal #
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-[#777A73] block">
            {isUPI ? 'UPI Payment Network' : isAlphanumericHeader ? 'Official Banking Channel' : 'Unknown Sender • SMS'}
          </span>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3 text-[#777A73]">
        <Phone className="w-4 h-4 hover:text-[#F3F0E8] transition-colors cursor-not-allowed" />
        <MoreVertical className="w-4 h-4 hover:text-[#F3F0E8] transition-colors" />
      </div>
    </div>
  );
}
