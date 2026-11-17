import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';

export function ExplanationModal({
  isOpen,
  result,
  onContinue,
  isLoading = false,
  isMonthComplete = false,
  nextDayNumber = 2,
}) {
  if (!isOpen || !result) return null;

  const {
    is_correct,
    was_scam,
    scam_type,
    score_change,
    financial_impact,
    money_protected,
    current_balance,
    current_score,
    current_streak,
    explanation,
    red_flags,
    safe_action,
  } = result;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171B18]/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#1F2420] border-[2px] border-[#313932] rounded-2xl p-6 sm:p-7 shadow-2xl text-[#F3F0E8] my-8 space-y-6"
        >
          {/* Header Result Pill & Title */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-sm text-xs font-mono font-bold uppercase tracking-wider border ${
                    is_correct
                      ? 'bg-[#A6C66A]/20 text-[#A6C66A] border-[#A6C66A]/40'
                      : 'bg-[#D96B59]/20 text-[#D96B59] border-[#D96B59]/40'
                  }`}
                >
                  {is_correct ? 'DECISION: VERIFIED SAFE' : 'DECISION: TRAPPED'}
                </span>
                <span className="text-xs font-mono text-[#777A73]">
                  {was_scam ? `Scam (${scam_type})` : 'Legitimate Notification'}
                </span>
              </div>

              {/* Score / Streak Capsule */}
              <div className="flex items-center gap-2 text-xs font-mono">
                {current_streak > 0 && (
                  <div className="flex items-center gap-1 text-[#D7B66D]">
                    <Flame className="w-3.5 h-3.5 fill-[#D7B66D]" />
                    <span className="font-bold">{current_streak}x Streak</span>
                  </div>
                )}
                <span className="font-bold text-[#A6C66A]">+{score_change} Pts</span>
              </div>
            </div>

            <h3 className="font-display font-bold text-2xl text-[#F3F0E8] leading-tight">
              {explanation?.verdict_title || (is_correct ? 'Correct! Defense Held.' : 'Oops! You Fell for the Scam.')}
            </h3>
          </div>

          {/* Financial Consequence Card */}
          <div className="p-4 rounded-xl bg-[#171B18] border border-[#2B322D] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777A73]">
                {financial_impact !== 0
                  ? 'Simulated Financial Penalty'
                  : money_protected > 0
                  ? 'Money Protected from Fraud'
                  : 'Financial Impact'}
              </span>
              <div className="text-xl font-mono font-bold">
                {financial_impact !== 0 ? (
                  <span className="text-[#D96B59]">{formatCurrency(financial_impact)}</span>
                ) : money_protected > 0 ? (
                  <span className="text-[#A6C66A]">Saved {formatCurrency(money_protected)}</span>
                ) : (
                  <span className="text-[#A3A69F]">₹0 (Balance Safe)</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777A73]">Updated Cash</span>
              <div className="text-base font-mono font-bold text-[#F3F0E8]">
                {formatCurrency(current_balance)}
              </div>
            </div>
          </div>

          {/* Forensic Explanation Narrative */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6C66A] font-semibold block">
              Forensic Dissection:
            </span>
            <p className="text-[#DCD6C7] font-sans leading-relaxed text-sm">
              {explanation?.explanation}
            </p>
          </div>

          {/* Technical Clues List */}
          {explanation?.technical_clues?.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[#1B201C] border border-[#2B322D] space-y-1.5 text-xs font-mono">
              <span className="text-[10px] uppercase text-[#777A73] font-bold block">
                Technical Red Flags:
              </span>
              <ul className="space-y-1 text-[#F3F0E8]">
                {explanation.technical_clues.map((clue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#D7B66D] mt-0.5">•</span>
                    <span>{clue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Real-World Pro Tip */}
          {explanation?.pro_tip && (
            <div className="p-3.5 rounded-lg bg-[#282F2A] border border-[#3B453E] text-xs font-mono text-[#D7B66D] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#A3A69F] block">
                Golden Real-World Defense Rule:
              </span>
              <p className="text-[#F3F0E8] font-sans leading-relaxed">
                "{explanation.pro_tip}"
              </p>
            </div>
          )}

          {/* Advance Action Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onContinue}
              isLoading={isLoading}
              className="w-full bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 font-bold text-sm tracking-wide py-4 shadow-xl"
            >
              <span>{isMonthComplete ? 'FINALIZE MONTH & VIEW REPORT' : `ADVANCE TO DAY ${nextDayNumber}`}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
