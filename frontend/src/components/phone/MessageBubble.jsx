import React from 'react';
import { ExternalLink, FileCode, CheckCheck, AlertCircle } from 'lucide-react';

export function MessageBubble({ messageText = '', time = '10:14 AM' }) {
  // Parse message text safely for URLs and APK mentions
  // We NEVER make external URLs clickable — they are safely rendered as inspected text tokens
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:top|xyz|apk|vip|fit|work|cn|ru|online|club|com|in)\/[^\s]*)/gi;
  const isAPK = /\.apk\b/i.test(messageText);

  // Helper to render text with styled inert URL tokens
  const renderFormattedText = (text) => {
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[#D96B59]/20 text-[#D96B59] border border-[#D96B59]/40 font-mono text-[11px] underline decoration-dotted select-text cursor-default mx-0.5"
            title="Non-functional preview of untrusted URL"
          >
            <span>{part}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col items-start max-w-[92%] sm:max-w-[85%] space-y-1">
      {/* Incoming Message Bubble */}
      <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-sm bg-[#242A25] border border-[#313932] text-[#F3F0E8] shadow-md space-y-2.5 leading-relaxed font-sans text-xs sm:text-sm">
        
        {/* Text Content */}
        <div className="select-text break-words">
          {renderFormattedText(messageText)}
        </div>

        {/* Inert APK File Attachment Mockup if present */}
        {isAPK && (
          <div className="p-2.5 rounded-lg bg-[#1B201C] border border-[#384239] flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#D96B59]/20 text-[#D96B59] flex items-center justify-center flex-shrink-0">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-bold text-[#F3F0E8] block truncate text-[11px]">installer-package.apk</span>
                <span className="text-[9px] text-[#777A73]">Package • 3.2 MB • Untrusted</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-[#D96B59] uppercase px-1.5 py-0.5 rounded-sm bg-[#D96B59]/10">
              Blocked
            </span>
          </div>
        )}

        {/* Message Metadata Footer */}
        <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] font-mono text-[#777A73]">
          <span>{time}</span>
          <span>•</span>
          <span>SIM 1</span>
          <CheckCheck className="w-3 h-3 text-[#A6C66A]" />
        </div>
      </div>
    </div>
  );
}
