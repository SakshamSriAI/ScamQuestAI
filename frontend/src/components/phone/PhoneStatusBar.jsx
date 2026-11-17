import React from 'react';
import { Wifi, Signal, BatteryMedium } from 'lucide-react';

export function PhoneStatusBar({ time = '09:41', carrier = 'Jio 5G' }) {
  return (
    <div className="pt-2 px-5 pb-1 flex items-center justify-between text-[#A3A69F] text-[11px] font-mono tracking-wider select-none bg-[#171B18] z-20">
      {/* Time */}
      <span className="font-semibold text-[#F3F0E8]">{time}</span>

      {/* Dynamic Island / Hardware Speaker Pill */}
      <div className="w-20 h-4 bg-[#111418] rounded-full flex items-center justify-center gap-1.5 border border-[#2B322D]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#2B322D]" />
        <div className="w-2 h-2 rounded-full bg-[#1F2420] border border-[#333C36]" />
      </div>

      {/* Connectivity Status Icons */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-mono text-[#777A73] hidden sm:inline">{carrier}</span>
        <Signal className="w-3 h-3 text-[#A3A69F]" />
        <Wifi className="w-3 h-3 text-[#A3A69F]" />
        <BatteryMedium className="w-3.5 h-3.5 text-[#A6C66A]" />
      </div>
    </div>
  );
}
