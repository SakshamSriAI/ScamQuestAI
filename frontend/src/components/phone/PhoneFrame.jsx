import React from 'react';
import { PhoneStatusBar } from './PhoneStatusBar';

export function PhoneFrame({ children, time = '09:41' }) {
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      
      {/* Physical Hardware Ridges (Volume and Power buttons on sides) */}
      <div className="hidden sm:block absolute -left-1 top-24 w-1 h-12 bg-[#2B322D] rounded-l-sm" />
      <div className="hidden sm:block absolute -left-1 top-40 w-1 h-12 bg-[#2B322D] rounded-l-sm" />
      <div className="hidden sm:block absolute -right-1 top-32 w-1 h-16 bg-[#2B322D] rounded-r-sm" />

      {/* Main Smartphone Bezel */}
      <div className="rounded-[36px] sm:rounded-[44px] bg-[#171B18] p-3 sm:p-3.5 shadow-2xl border-[3px] border-[#2B322D]">
        
        {/* Inner Screen Display */}
        <div className="rounded-[28px] sm:rounded-[36px] bg-[#1F2420] overflow-hidden border border-[#2F3731] min-h-[560px] sm:min-h-[620px] flex flex-col justify-between relative shadow-inner">
          
          {/* Top Status Bar */}
          <PhoneStatusBar time={time} />

          {/* Main Content Viewport */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden">
            {children}
          </div>

          {/* Bottom Swipe Indicator */}
          <div className="py-2.5 flex items-center justify-center bg-[#1F2420] border-t border-[#252B26]">
            <div className="w-32 h-1 bg-[#475249] rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
}
