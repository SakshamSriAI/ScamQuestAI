import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Signal,
  Wifi,
  BatteryMedium,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';

export function ActiveGameModal({ isOpen, onClose, onCompleted }) {
  const { gameState, submitDecision, advanceDay, isSubmitting, isLoading } = useGame();
  const [answerResult, setAnswerResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen || !gameState) return null;

  const currentScenario = gameState.current_scenario;
  const isAnswered = gameState.is_current_scenario_answered || answerResult !== null;
  const activeResult = answerResult || gameState.last_answer_result;

  const handleChoice = async (choice) => {
    setErrorMessage(null);
    try {
      const result = await submitDecision(choice);
      setAnswerResult(result);
      if (result?.is_month_complete && onCompleted) {
        onCompleted();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit decision.');
    }
  };

  const handleNextDay = async () => {
    setErrorMessage(null);
    try {
      setAnswerResult(null);
      await advanceDay();
      if (gameState.is_completed) {
        if (onClose) onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to advance to next scenario.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#171B18]/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-xl bg-[#171B18] border-[3px] border-[#2B322D] rounded-[28px] p-4 sm:p-6 shadow-2xl text-[#F3F0E8] my-6"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777A73] hover:text-[#F3F0E8] p-1.5 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Smartphone Screen Enclosure */}
        <div className="space-y-4">
          
          {/* Top Status Bar & Notch */}
          <div className="flex items-center justify-between text-[#777A73] text-[11px] font-mono border-b border-[#2B322D] pb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#A6C66A]">DAY {gameState.current_day} / {gameState.total_days}</span>
              <span>•</span>
              <span className="uppercase text-[#A3A69F]">{gameState.persona.replace(/_/g, ' ')}</span>
            </div>

            <div className="flex items-center gap-2 text-right">
              <span>{formatCurrency(gameState.balance)}</span>
              <Wifi className="w-3 h-3 text-[#A3A69F]" />
              <BatteryMedium className="w-3.5 h-3.5 text-[#A6C66A]" />
            </div>
          </div>

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="p-3 rounded-sm bg-[#D96B59]/20 border border-[#D96B59] text-[#F3F0E8] text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {/* Active Scenario Card (Phone Notification View) */}
          {currentScenario ? (
            <div className="space-y-4">
              
              {/* Notification Banner Container */}
              <div className="bg-[#242A25] border border-[#313932] rounded-xl p-4 sm:p-5 space-y-3 shadow-md">
                
                {/* Notification Header */}
                <div className="flex items-center justify-between border-b border-[#2F3730] pb-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D7B66D] animate-ping" />
                    <span className="font-bold text-[#F3F0E8]">{currentScenario.sender_id}</span>
                  </div>
                  <span className="text-[10px] text-[#777A73] uppercase tracking-wider">
                    {currentScenario.language} • {currentScenario.difficulty}
                  </span>
                </div>

                {/* Notification Context Title */}
                <div className="text-xs font-display font-semibold text-[#D7B66D]">
                  {currentScenario.context_title}
                </div>

                {/* Full SMS / UPI Push Notification Text */}
                <div className="p-3.5 rounded-lg bg-[#1B201C] border border-[#2B322D] text-sm sm:text-base font-sans text-[#F3F0E8] leading-relaxed select-text">
                  "{currentScenario.message_text}"
                </div>

                {/* Claimed Amount Tag if present */}
                {currentScenario.claimed_amount && (
                  <div className="flex items-center justify-between text-xs font-mono text-[#A3A69F] pt-1">
                    <span>Monetary Reference:</span>
                    <span className="font-bold text-[#F3F0E8]">{formatCurrency(currentScenario.claimed_amount)}</span>
                  </div>
                )}
              </div>

              {/* Decision Section (Before Answering) */}
              {!isAnswered && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] text-center block">
                    Inspect the sender, links, and wording. Make your call:
                  </span>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* SCAM Button (Terracotta Alert) */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleChoice('SCAM')}
                      className="py-4 px-4 rounded-xl bg-[#D96B59] hover:bg-[#A64130] active:scale-[0.98] transition-all text-[#F3F0E8] font-display font-bold text-base sm:text-lg flex flex-col items-center justify-center gap-1 shadow-lg border border-[#EEC1B9]/30 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        <span>SCAM</span>
                      </div>
                      <span className="text-[10px] font-mono tracking-wider text-[#F3F0E8]/80 font-normal uppercase">
                        Fraudulent / Phishing
                      </span>
                    </button>

                    {/* SAFE Button (Moss Guard) */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleChoice('SAFE')}
                      className="py-4 px-4 rounded-xl bg-[#A6C66A] hover:bg-[#688537] active:scale-[0.98] transition-all text-[#171B18] font-display font-bold text-base sm:text-lg flex flex-col items-center justify-center gap-1 shadow-lg border border-[#D0E3AF]/40 disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#171B18]" />
                        <span>SAFE</span>
                      </div>
                      <span className="text-[10px] font-mono tracking-wider text-[#171B18]/80 font-normal uppercase">
                        Authentic Alert
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Forensic Feedback Card (After Answering) */}
              {isAnswered && activeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-2"
                >
                  {/* Verdict Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                      activeResult.is_correct
                        ? 'bg-[#1E261F] border-[#A6C66A] text-[#F3F0E8]'
                        : 'bg-[#291F1D] border-[#D96B59] text-[#F3F0E8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activeResult.is_correct ? 'bg-[#A6C66A] text-[#171B18]' : 'bg-[#D96B59] text-[#F3F0E8]'
                        }`}
                      >
                        {activeResult.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base">
                          {activeResult.explanation?.verdict_title || (activeResult.is_correct ? 'Correct Decision!' : 'Fell for the Scam!')}
                        </h4>
                        <span className="text-xs font-mono text-[#A3A69F]">
                          Actual Nature: {activeResult.was_scam ? `Scam (${activeResult.scam_type})` : 'Legitimate Notification'}
                        </span>
                      </div>
                    </div>

                    {/* Financial & Score Impact */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono text-[#A6C66A] block font-bold">
                        +{activeResult.score_change} Pts
                      </span>
                      {activeResult.financial_impact !== 0 ? (
                        <span className="text-xs font-mono text-[#D96B59] font-bold block">
                          {formatCurrency(activeResult.financial_impact)}
                        </span>
                      ) : activeResult.money_protected > 0 ? (
                        <span className="text-[11px] font-mono text-[#D7B66D] block">
                          Protected {formatCurrency(activeResult.money_protected)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Forensic Explanation */}
                  <div className="p-4 rounded-xl bg-[#1B201C] border border-[#2B322D] space-y-2 text-xs">
                    <span className="text-[#A6C66A] font-mono uppercase text-[10px] tracking-wider block font-semibold">
                      Forensic Dissection:
                    </span>
                    <p className="text-[#DCD6C7] font-sans leading-relaxed">
                      {activeResult.explanation?.explanation}
                    </p>

                    {/* Technical Clues */}
                    {activeResult.explanation?.technical_clues?.length > 0 && (
                      <div className="pt-2 border-t border-[#2B322D] space-y-1">
                        <span className="text-[10px] font-mono text-[#777A73] uppercase block font-semibold">
                          Giveaway Signals:
                        </span>
                        <ul className="space-y-0.5 text-[#F3F0E8] font-mono text-[11px]">
                          {activeResult.explanation.technical_clues.map((clue, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-[#D7B66D]">•</span>
                              <span>{clue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Real-World Pro Tip */}
                    {activeResult.explanation?.pro_tip && (
                      <div className="pt-2 border-t border-[#2B322D] text-[11px] font-mono text-[#D7B66D]">
                        <strong>Real-World Defense:</strong> {activeResult.explanation.pro_tip}
                      </div>
                    )}
                  </div>

                  {/* Advance to Next Day Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleNextDay}
                    isLoading={isLoading}
                    className="w-full bg-[#F3F0E8] text-[#171B18] hover:bg-[#FFFFFF] font-bold text-sm tracking-wide py-3.5 shadow-xl"
                  >
                    <span>{activeResult.is_month_complete ? 'FINALIZE 30-DAY MONTH' : `CONTINUE TO DAY ${gameState.current_day + 1}`}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

            </div>
          ) : (
            // No scenario (Month Completed)
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#A6C66A]/20 text-[#A6C66A] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-2xl text-[#F3F0E8]">30 Days Complete!</h3>
              <p className="text-sm text-[#A3A69F] max-w-sm mx-auto">
                You have reached the end of the simulation month. Check your final balance and coach audit on the dashboard.
              </p>
              <Button
                variant="primary"
                onClick={onClose}
                className="bg-[#A6C66A] text-[#171B18] font-bold px-6"
              >
                Return to Command Center
              </Button>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
