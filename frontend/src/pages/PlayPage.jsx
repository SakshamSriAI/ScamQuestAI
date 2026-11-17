import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Flame,
  Wallet,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';

// Smartphone subcomponents
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { MessageHeader } from '@/components/phone/MessageHeader';
import { MessageTimestamp } from '@/components/phone/MessageTimestamp';
import { MessageBubble } from '@/components/phone/MessageBubble';
import { TransactionDetails } from '@/components/phone/TransactionDetails';
import { NotificationPreview } from '@/components/phone/NotificationPreview';
import { ExplanationModal } from '@/components/phone/ExplanationModal';

export function PlayPage() {
  const navigate = useNavigate();
  const {
    sessionId,
    gameState,
    isLoading,
    isSubmitting,
    error,
    submitDecision,
    advanceDay,
    refreshState,
  } = useGame();

  const [decisionResult, setDecisionResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [localError, setLocalError] = useState(null);

  // If session state exists and has a last_answer_result while scenario is marked answered
  useEffect(() => {
    if (gameState?.is_current_scenario_answered && gameState?.last_answer_result && !decisionResult) {
      setDecisionResult(gameState.last_answer_result);
    }
  }, [gameState, decisionResult]);

  // Handle Decision Submit (SCAM or SAFE)
  const handleDecision = async (choice) => {
    if (isSubmitting || isAdvancing) return;
    setLocalError(null);

    try {
      const result = await submitDecision(choice);
      if (result) {
        setDecisionResult(result);
        setIsModalOpen(true);
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to submit decision. Please retry.');
    }
  };

  // Handle Advancing to Next Day
  const handleContinue = async () => {
    if (gameState?.is_completed || decisionResult?.is_month_complete) {
      setIsModalOpen(false);
      navigate('/report');
      return;
    }

    setIsAdvancing(true);
    setLocalError(null);
    try {
      await advanceDay();
      setIsModalOpen(false);
      setDecisionResult(null);
    } catch (err) {
      setLocalError(err.message || 'Failed to advance to next day. Please retry.');
    } finally {
      setIsAdvancing(false);
    }
  };

  // Keyboard Shortcuts (1/S for Scam, 2/A for Safe, Enter to continue when modal open)
  const handleKeyDown = useCallback(
    (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (isModalOpen) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleContinue();
        }
        return;
      }

      if (!gameState?.is_current_scenario_answered && !isSubmitting && !isAdvancing) {
        if (e.key === '1' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleDecision('SCAM');
        } else if (e.key === '2' || e.key.toLowerCase() === 'a' || e.key === ' ') {
          e.preventDefault();
          handleDecision('SAFE');
        }
      }
    },
    [isModalOpen, gameState, isSubmitting, isAdvancing]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // If no session active
  if (!sessionId || !gameState) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#171B18] text-[#D7B66D] mx-auto flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#171B18]">
            No Simulation in Progress
          </h2>
          <p className="text-sm text-[#777A73]">
            Start a new 30-day financial survival simulation to test your ability to spot Indian banking fraud and UPI scams.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto bg-[#171B18] text-[#F3F0E8] font-bold px-8"
          >
            <span>Begin Simulation Briefing</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto border-[#DCD6C7] text-[#171B18]"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const {
    current_day,
    total_days,
    balance,
    investments,
    net_worth,
    score,
    streak,
    max_streak,
    is_completed,
    is_current_scenario_answered,
    current_scenario,
    new_routine_expenses = [],
    persona,
  } = gameState;

  // Format persona label
  const personaDisplay = {
    COLLEGE_STUDENT: 'College Student',
    SHOPKEEPER: 'Small Shopkeeper',
    WORKING_PROFESSIONAL: 'Working Professional',
    SENIOR_CITIZEN: 'Senior Citizen',
  }[persona] || persona;

  const isUPI = current_scenario?.context_title?.toLowerCase().includes('upi') ||
    current_scenario?.message_text?.toLowerCase().includes('upi') ||
    current_scenario?.sender_id?.toLowerCase().includes('upi') ||
    Boolean(current_scenario?.claimed_amount);

  const scenarioSender = current_scenario?.sender_id || 'BANK-NOTICE';
  const scenarioText = current_scenario?.message_text || 'Waiting for incoming financial notification...';
  const contextTitle = current_scenario?.context_title || 'Incoming Message';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* =====================================================================
          TOP STATUS BAR & NAVIGATION
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCD6C7]">
        {/* Left: Back Link & Day Pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] hover:bg-[#F3F0E8] text-[#777A73] hover:text-[#171B18] transition-colors"
            title="Return to Command Center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm bg-[#171B18] text-[#F3F0E8]">
                DAY {current_day} OF {total_days}
              </span>
              <span className="text-xs font-mono text-[#777A73]">
                {personaDisplay}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#171B18] tracking-tight">
              Active Threat Inspection
            </h1>
          </div>
        </div>

        {/* Right: Live Vital Metrics */}
        <div className="flex items-center gap-3 sm:gap-5 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm px-4 py-2 shadow-sm">
          {/* Available Cash */}
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#777A73] block">
              Available Cash
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[#171B18]">
              {formatCurrency(balance)}
            </span>
          </div>

          <div className="w-px h-7 bg-[#DCD6C7]" />

          {/* Score */}
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#777A73] block">
              Score
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[#688537]">
              {score} PTS
            </span>
          </div>

          <div className="w-px h-7 bg-[#DCD6C7]" />

          {/* Streak */}
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#777A73] block">
              Streak
            </span>
            <div className="flex items-center justify-end gap-1 text-sm sm:text-base font-mono font-bold text-[#B08930]">
              <Flame className="w-4 h-4 fill-[#D7B66D] text-[#D7B66D]" />
              <span>{streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Expense Notification (if any occurred on this calendar transition) */}
      {new_routine_expenses && new_routine_expenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-sm bg-[#F3F0E8] border-l-4 border-[#171B18] border border-[#DCD6C7] flex items-center justify-between gap-4 text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#171B18] flex-shrink-0" />
            <span className="text-[#171B18] font-bold">Scheduled Expense Logged:</span>
            <span className="text-[#40443E]">
              {new_routine_expenses.map((e) => `${e.title} (${formatCurrency(e.amount)})`).join(' • ')}
            </span>
          </div>
          <span className="text-[10px] text-[#777A73] uppercase tracking-wider font-semibold">
            Auto-Debited
          </span>
        </motion.div>
      )}

      {/* Local Error Notice if any */}
      {localError && (
        <div className="p-3.5 rounded-sm bg-[#D96B59]/10 border border-[#D96B59]/40 text-[#D96B59] text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* =====================================================================
          MAIN PLAYGROUND GRID: BRIEFING (DESKTOP) + PHONE CENTERPIECE + CONTROLS
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Field Briefing & Forensic Tips (Desktop only) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#171B18]">
              <ShieldAlert className="w-4 h-4 text-[#D96B59]" />
              <span>INSPECTION CHECKLIST</span>
            </div>
            <ul className="text-xs font-sans text-[#777A73] space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-[#171B18] font-bold">•</span>
                <span><strong>UPI PIN Rule:</strong> You NEVER enter your PIN to receive money or get refunds.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-[#171B18] font-bold">•</span>
                <span><strong>TRAI Headers:</strong> Legitimate bank SMS has 2-letter prefixes (e.g., <code className="font-mono text-[#171B18]">AX-HDFCBK</code>). Personal 10-digit mobile numbers are immediate red flags.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-[#171B18] font-bold">•</span>
                <span><strong>No APKs via SMS:</strong> Banks never ask you to install <code className="font-mono text-[#171B18]">.apk</code> files via message links.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#171B18] text-[#F3F0E8] rounded-sm p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6C66A] font-bold block">
              ADAPTIVE DIFFICULTY
            </span>
            <div className="text-sm font-display font-bold text-[#F3F0E8]">
              Level: {current_scenario?.difficulty || 'EASY'}
            </div>
            <p className="text-[11px] text-[#A3A69F] leading-relaxed">
              The engine automatically scales urgency and subtlety based on your performance streak.
            </p>
          </div>
        </div>

        {/* Center: The Realistic Smartphone Simulation */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-6">
          <div className="w-full">
            <PhoneFrame time="10:42">
              {/* Top SMS Header inside phone */}
              <MessageHeader
                senderId={scenarioSender}
                isUPI={isUPI}
              />

              {/* Notification Push Preview banner */}
              <NotificationPreview
                senderId={scenarioSender}
                contextTitle={contextTitle}
                previewSnippet={scenarioText}
              />

              {/* Message Thread Container */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-end space-y-3 min-h-[340px]">
                <MessageTimestamp timestamp="Today • 10:42 AM" />

                {/* Primary Message Bubble with non-functional safety tokens */}
                <MessageBubble
                  messageText={scenarioText}
                  time="10:42 AM"
                />

                {/* Transaction details card if claimed amount / UPI collect */}
                {(current_scenario?.claimed_amount || isUPI) && (
                  <TransactionDetails
                    claimedAmount={current_scenario?.claimed_amount}
                    contextTitle={contextTitle}
                    isUPI={isUPI}
                  />
                )}
              </div>
            </PhoneFrame>
          </div>

          {/* ===================================================================
              TACTILE DECISION CONTROLS
              =================================================================== */}
          <div className="w-full max-w-[420px] space-y-3">
            {is_current_scenario_answered ? (
              <div className="p-4 rounded-xl bg-[#171B18] border border-[#313932] text-center space-y-3 shadow-xl">
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#A6C66A]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DECISION LOGGED FOR TODAY</span>
                </div>
                <p className="text-xs text-[#A3A69F]">
                  You have already answered today's scenario. Review the forensic breakdown or advance to tomorrow.
                </p>
                <div className="flex items-center gap-2">
                  {decisionResult && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setIsModalOpen(true)}
                      className="flex-1 border-[#313932] text-[#F3F0E8] hover:bg-[#252B26]"
                    >
                      <span>Review Forensic Findings</span>
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleContinue}
                    isLoading={isAdvancing}
                    className="flex-1 bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 font-bold"
                  >
                    <span>{is_completed ? 'View Final Audit' : `Go to Day ${current_day + 1}`}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* SCAM DECISION BUTTON */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || isAdvancing}
                    onClick={() => handleDecision('SCAM')}
                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-[#2A1D1C] hover:bg-[#342220] border-2 border-[#D96B59] text-[#F3F0E8] transition-all shadow-lg hover:shadow-[#D96B59]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#D96B59]/20 flex items-center justify-center text-[#D96B59] mb-2 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="font-display font-extrabold text-sm sm:text-base tracking-wide text-[#F3F0E8]">
                      THIS IS A SCAM
                    </span>
                    <span className="text-[10px] font-mono text-[#D96B59] mt-0.5 opacity-90">
                      Press [S] or [1]
                    </span>
                  </motion.button>

                  {/* SAFE DECISION BUTTON */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || isAdvancing}
                    onClick={() => handleDecision('SAFE')}
                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl bg-[#1C261E] hover:bg-[#223025] border-2 border-[#A6C66A] text-[#F3F0E8] transition-all shadow-lg hover:shadow-[#A6C66A]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#A6C66A]/20 flex items-center justify-center text-[#A6C66A] mb-2 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-display font-extrabold text-sm sm:text-base tracking-wide text-[#F3F0E8]">
                      THIS IS SAFE
                    </span>
                    <span className="text-[10px] font-mono text-[#A6C66A] mt-0.5 opacity-90">
                      Press [A] or [2]
                    </span>
                  </motion.button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-center text-[11px] font-mono text-[#777A73]">
                  <Info className="w-3.5 h-3.5 text-[#777A73]" />
                  <span>Inspect sender headers, links, and urgency before committing your decision.</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Quick Stats & Navigation Shortcuts (Desktop only) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-bold block">
              SIMULATION METRICS
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#DCD6C7]">
                <span className="text-[#777A73]">Net Worth:</span>
                <span className="font-bold text-[#171B18]">{formatCurrency(net_worth)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCD6C7]">
                <span className="text-[#777A73]">Investments (SIP):</span>
                <span className="font-bold text-[#B08930]">{formatCurrency(investments)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCD6C7]">
                <span className="text-[#777A73]">Record Streak:</span>
                <span className="font-bold text-[#171B18]">{max_streak} Rounds</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] space-y-2">
            <span className="text-xs font-mono font-bold text-[#171B18] block">
              SUSPICIOUS TEXT?
            </span>
            <p className="text-xs font-sans text-[#777A73] leading-relaxed">
              Want to run deep heuristic and AI analysis on a custom SMS?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/scan')}
              className="w-full text-xs font-mono border-[#171B18] text-[#171B18]"
            >
              Open Scan Mode
            </Button>
          </div>
        </div>

      </div>

      {/* =====================================================================
          FORENSIC FEEDBACK MODAL (Displays upon decision submission)
          ===================================================================== */}
      <ExplanationModal
        isOpen={isModalOpen}
        result={decisionResult}
        onContinue={handleContinue}
        isLoading={isAdvancing}
        isMonthComplete={is_completed || decisionResult?.is_month_complete || current_day >= total_days}
        nextDayNumber={current_day + 1}
      />
    </div>
  );
}

export default PlayPage;
