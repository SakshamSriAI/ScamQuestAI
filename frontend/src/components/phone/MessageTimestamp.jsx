import React from 'react';

export function MessageTimestamp({ time = 'Today, 10:14 AM', day = null }) {
  return (
    <div className="py-2.5 flex items-center justify-center">
      <span className="px-3 py-0.5 rounded-full bg-[#1B201C] text-[#777A73] border border-[#2B322D] text-[10px] font-mono tracking-wider uppercase">
        {day ? `DAY ${day} • ${time}` : time}
      </span>
    </div>
  );
}
