import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ShieldCheck, AlertCircle, ArrowUpRight, Check, X, PhoneCall, Wifi, BatteryMedium, Signal } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 'notif-1',
    sender: 'AX-HDFCBK',
    app: 'MESSAGES • JUST NOW',
    type: 'SAFE',
    badge: 'LEGITIMATE',
    badgeVariant: 'moss',
    title: 'Salary Credited',
    message: 'A/c *1204 Credited with INR 50,000.00 on 01-Nov-24 by NEFT salary from TECH CORP PVT LTD. Avl Bal: INR 50,000.00.',
    meta: 'Verified Bank Header (AX-HDFCBK) • Masked A/c digits',
    amount: '+₹50,000',
    isScam: false,
  },
  {
    id: 'notif-2',
    sender: '+91 98765 43210',
    app: 'MESSAGES • 2M AGO',
    type: 'SCAM',
    badge: 'FAKE KYC APK',
    badgeVariant: 'coral',
    title: 'Urgent Account Suspension Notice',
    message: 'Dear customer, your SBI YONO account will be blocked today due to pending KYC. Download pan-verify.apk now: http://sbi-kyc.top',
    meta: 'Unverified 10-digit mobile number • Risky .top domain • .apk malware download',
    amount: 'Threat: Freeze',
    isScam: true,
  },
  {
    id: 'notif-3',
    sender: 'Google Pay (Collect)',
    app: 'UPI NOTIFICATION • 14M AGO',
    type: 'SCAM',
    badge: 'UPI COLLECT TRAP',
    badgeVariant: 'coral',
    title: 'Collect Request: ₹2,000.00',
    message: 'Bhaiya galti se aapke UPI pe transfer ho gaya. Please refund kar do behen ki dawai ke liye. Click PAY to refund.',
    meta: 'Entering UPI PIN always DEBITS money • Emotional medical manipulation',
    amount: '-₹2,000 Trap',
    isScam: true,
  },
  {
    id: 'notif-4',
    sender: 'QP-JOBSMS',
    app: 'WHATSAPP ALERT • 1H AGO',
    type: 'SCAM',
    badge: 'TASK SCAM',
    badgeVariant: 'coral',
    title: 'Part-Time Work from Home',
    message: 'Earn ₹3,000 to ₹8,000 daily by simply rating Google hotels and liking YouTube videos! Contact HR Sneha on Telegram.',
    meta: 'Unrealistic micro-task payout • Telegram funnel • Advance deposit fee trap',
    amount: 'Fake ₹8,000/day',
    isScam: true,
  },
];

export function PhoneNotificationComposition() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedNotif, setSelectedNotif] = useState(null);

  const filtered = NOTIFICATIONS.filter((n) => {
    if (activeTab === 'SCAMS') return n.isScam;
    if (activeTab === 'SAFE') return !n.isScam;
    return true;
  });

  return (
    <div className="w-full max-w-[420px] mx-auto select-none">
      {/* Phone Hardware Chassis Mockup */}
      <div className="relative rounded-[32px] bg-[#171B18] p-3 shadow-2xl border-[3px] border-[#2B322D]">
        {/* Subtle Outer Glow & Antenna Lines */}
        <div className="absolute -top-1 left-16 w-8 h-[2px] bg-[#3B453E]" />
        <div className="absolute -bottom-1 right-16 w-8 h-[2px] bg-[#3B453E]" />

        {/* Screen Surface */}
        <div className="relative rounded-[24px] bg-[#1F2420] overflow-hidden border border-[#2F3731] min-h-[520px] flex flex-col justify-between">
          
          {/* Top Status Bar & Camera Island */}
          <div className="pt-3 px-5 pb-2 flex items-center justify-between text-[#777A73] text-[11px] font-mono tracking-wider">
            <span className="font-semibold text-[#A3A69F]">09:41</span>
            
            {/* Dynamic Island / Speaker Pill */}
            <div className="w-20 h-4 bg-[#171B18] rounded-full mx-auto flex items-center justify-center gap-1.5 border border-[#2B322D]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2B322D]" />
              <div className="w-2 h-2 rounded-full bg-[#1F2420] border border-[#333C36]" />
            </div>

            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Interactive Filter Pills */}
          <div className="px-4 py-2 flex items-center gap-1.5 border-b border-[#2A312B] bg-[#1B201C]/80 backdrop-blur-sm">
            {['ALL', 'SCAMS', 'SAFE'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`
                  px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-medium tracking-wider transition-all duration-150
                  ${
                    activeTab === tab
                      ? 'bg-[#A6C66A] text-[#171B18] font-bold shadow-sm'
                      : 'text-[#777A73] hover:text-[#F3F0E8] hover:bg-[#282F2A]'
                  }
                `}
              >
                {tab === 'ALL' ? 'INCOMING (4)' : tab === 'SCAMS' ? 'SCAMS (3)' : 'SAFE (1)'}
              </button>
            ))}
          </div>

          {/* Stack of Realistic Notifications */}
          <div className="p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[410px]">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, index) => {
                const isSelected = selectedNotif?.id === item.id;
                const isThreat = item.isScam;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => setSelectedNotif(isSelected ? null : item)}
                    className={`
                      p-3 rounded-lg border transition-all duration-150 cursor-pointer text-left
                      ${
                        isSelected
                          ? isThreat
                            ? 'bg-[#291F1D] border-[#D96B59] shadow-lg ring-1 ring-[#D96B59]/40'
                            : 'bg-[#1E261F] border-[#A6C66A] shadow-lg ring-1 ring-[#A6C66A]/40'
                          : 'bg-[#242A25] border-[#313932] hover:border-[#424D44] hover:bg-[#282F2A]'
                      }
                    `}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                            isThreat ? 'bg-[#D96B59]/20 text-[#D96B59]' : 'bg-[#A6C66A]/20 text-[#A6C66A]'
                          }`}
                        >
                          {isThreat ? '!' : '✓'}
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-[#F3F0E8] truncate">
                          {item.sender}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono tracking-tight text-[#777A73] uppercase">
                        {item.app}
                      </span>
                    </div>

                    {/* Content Message */}
                    <p className="text-[12px] text-[#DCD6C7] line-clamp-2 leading-relaxed mb-2 font-sans">
                      {item.message}
                    </p>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#2F3730] text-[10px] font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded-sm font-semibold tracking-wider uppercase text-[9px] ${
                          isThreat
                            ? 'bg-[#D96B59]/20 text-[#D96B59] border border-[#D96B59]/40'
                            : 'bg-[#A6C66A]/20 text-[#A6C66A] border border-[#A6C66A]/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span className="text-[#A3A69F] font-numeric">{item.amount}</span>
                    </div>

                    {/* Expanded Forensic Clues (when tapped) */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 pt-2 border-t border-[#384239] text-[11px] font-mono space-y-1"
                      >
                        <span className="text-[#A3A69F] block text-[10px] uppercase tracking-wider font-semibold">
                          Forensic Analysis:
                        </span>
                        <p className={isThreat ? 'text-[#D96B59]' : 'text-[#A6C66A]'}>
                          {item.meta}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="py-2 flex items-center justify-center">
            <div className="w-28 h-1 bg-[#475249] rounded-full" />
          </div>
        </div>
      </div>

      {/* Caption Under Phone */}
      <div className="mt-3 text-center">
        <span className="text-[11px] font-mono text-[#777A73]">
          Interactive phone preview • Tap any alert to reveal forensic markers
        </span>
      </div>
    </div>
  );
}
