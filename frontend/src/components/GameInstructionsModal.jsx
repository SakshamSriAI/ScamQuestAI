import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, ShieldCheck, AlertTriangle, Wallet, Lock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function GameInstructionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171B18]/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-2xl bg-[#F3F0E8] border border-[#DCD6C7] rounded-sm p-6 sm:p-8 shadow-2xl my-8 text-[#171B18] max-h-[85vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#777A73] hover:text-[#171B18] p-1.5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-[#DCD6C7] pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-[#A6C66A]/20 text-[#688537] text-[10px] font-mono font-bold uppercase">
                DEFENSIVE RULEBOOK
              </span>
              <span className="text-xs font-mono text-[#777A73]">Field Manual</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-[#171B18]">
              Simulation Instructions & Rules
            </h2>
            <p className="text-xs text-[#777A73]">
              How to navigate your 30-day survival run and spot deceptive Indian scams.
            </p>
          </div>

          {/* Section 1: Financial Mechanics */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-base text-[#171B18] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#688537]" />
              1. The Fictional Salary & Living Costs
            </h3>
            <p className="text-xs text-[#777A73] leading-relaxed">
              You begin with a fictional deposit of <strong>₹50,000</strong>. Across the 30-day month, mandatory life expenses are deducted automatically on specific days:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-[#FFFFFF] rounded-sm border border-[#DCD6C7]">
                <span className="text-[#777A73] block text-[10px]">Day 3</span>
                <span className="font-bold text-[#D96B59]">-₹12,000 Rent</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] rounded-sm border border-[#DCD6C7]">
                <span className="text-[#777A73] block text-[10px]">Day 7</span>
                <span className="font-bold text-[#171B18]">-₹5,000 SIP</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] rounded-sm border border-[#DCD6C7]">
                <span className="text-[#777A73] block text-[10px]">Day 12</span>
                <span className="font-bold text-[#D96B59]">-₹3,500 Groceries</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] rounded-sm border border-[#DCD6C7]">
                <span className="text-[#777A73] block text-[10px]">Day 16</span>
                <span className="font-bold text-[#D96B59]">-₹1,200 Power</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] rounded-sm border border-[#DCD6C7]">
                <span className="text-[#777A73] block text-[10px]">Day 20</span>
                <span className="font-bold text-[#D96B59]">-₹800 Internet</span>
              </div>
              <div className="p-2.5 bg-[#FFFFFF] rounded-sm border border-[#DCD6C7]">
                <span className="text-[#777A73] block text-[10px]">Day 25</span>
                <span className="font-bold text-[#D96B59]">-₹1,500 Dining</span>
              </div>
            </div>
            <p className="text-[11px] text-[#777A73]">
              <strong>Note on SIP:</strong> The ₹5,000 SIP allocation is transferred to your investment assets, preserving your net worth. Routine living expenses are consumption.
            </p>
          </div>

          {/* Section 2: Golden Defensive Rules */}
          <div className="space-y-3 pt-3 border-t border-[#DCD6C7]">
            <h3 className="font-display font-bold text-base text-[#171B18] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A6C66A]" />
              2. Three Non-Negotiable Defense Rules
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm space-y-1">
                <span className="font-bold text-[#D96B59] font-mono">RULE 1: UPI PIN Is ONLY For Sending Money</span>
                <p className="text-[#777A73] leading-relaxed">
                  Entering your UPI PIN always debits funds from your account. You NEVER enter a PIN to receive cashback, lottery winnings, or refund a wrong payment.
                </p>
              </div>

              <div className="p-3 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm space-y-1">
                <span className="font-bold text-[#D96B59] font-mono">RULE 2: Banks Never Distribute APK Files</span>
                <p className="text-[#777A73] leading-relaxed">
                  Legitimate banks (SBI, HDFC, ICICI, Axis) operate strictly through Google Play and the Apple App Store. Any link downloading an `.apk` file is spyware.
                </p>
              </div>

              <div className="p-3 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm space-y-1">
                <span className="font-bold text-[#D96B59] font-mono">RULE 3: "Digital Arrest" Is 100% Fake</span>
                <p className="text-[#777A73] leading-relaxed">
                  Indian police, CBI, ED, and courts do NOT conduct interrogations, summons, or arrests via Skype or WhatsApp video calls.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Scoring & Adaptability */}
          <div className="space-y-2 pt-3 border-t border-[#DCD6C7] text-xs">
            <h3 className="font-display font-bold text-base text-[#171B18]">
              3. Scoring & Adaptive Difficulty
            </h3>
            <p className="text-[#777A73] leading-relaxed">
              Every correct decision awards 100 base points plus streak multipliers. Consecutive wins raise difficulty, while mistakes trigger targeted remedial scenarios so you can master your weaknesses.
            </p>
          </div>

          <div className="pt-4 border-t border-[#DCD6C7] flex justify-end">
            <Button variant="primary" onClick={onClose} className="bg-[#171B18] text-[#F3F0E8] px-6 text-xs font-bold">
              Understood • Return to Command Center
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
