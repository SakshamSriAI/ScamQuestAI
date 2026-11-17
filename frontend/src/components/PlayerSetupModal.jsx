import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCheck, Languages, ArrowRight, Wallet, Shield } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';

const PERSONAS = [
  {
    id: 'COLLEGE_STUDENT',
    title: 'College Student',
    desc: 'Targeted by fake internships, YouTube review tasks, gaming tokens, and campus fee scams.',
    startingSalary: '₹50,000 Fictional Salary',
    difficultyContext: 'High Digital Exposure',
  },
  {
    id: 'SHOPKEEPER',
    title: 'Kirana Shopkeeper',
    desc: 'Targeted by wrong UPI collect requests, fake soundbox alerts, and wholesale supplier fraud.',
    startingSalary: '₹50,000 Fictional Cashflow',
    difficultyContext: 'High Merchant Velocity',
  },
  {
    id: 'WORKING_PROFESSIONAL',
    title: 'Working Professional',
    desc: 'Targeted by EPFO / PF phishing, income tax refund traps, credit card reward points, and headhunter scams.',
    startingSalary: '₹50,000 Fictional Salary',
    difficultyContext: 'Corporate Phishing Target',
  },
  {
    id: 'SENIOR_CITIZEN',
    title: 'Senior Citizen',
    desc: 'Targeted by digital arrest extortion, electricity disconnects, and pension block notices.',
    startingSalary: '₹50,000 Fictional Pension',
    difficultyContext: 'High Urgency Vulnerability',
  },
];

const LANGUAGES = [
  { id: 'HINGLISH', label: 'Hinglish (Recommended)', sub: 'Common Indian Romanized text' },
  { id: 'ENGLISH', label: 'Indian English', sub: 'Standard formal bank alerts' },
  { id: 'HINDI', label: 'Hindi (हिंदी)', sub: 'Regional Devanagari script' },
];

export function PlayerSetupModal({ isOpen, onClose, onStarted }) {
  const { startNewGame, isLoading } = useGame();
  const [selectedPersona, setSelectedPersona] = useState('COLLEGE_STUDENT');
  const [selectedLanguage, setSelectedLanguage] = useState('HINGLISH');
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleLaunch = async () => {
    setErrorMsg(null);
    try {
      await startNewGame({
        persona: selectedPersona,
        language: selectedLanguage,
        total_days: 30,
      });
      if (onStarted) onStarted();
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start game session.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171B18]/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-[#F3F0E8] border border-[#DCD6C7] rounded-sm p-6 sm:p-8 shadow-2xl my-8 text-[#171B18]"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-[#777A73] hover:text-[#171B18] p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title */}
          <div className="space-y-1 mb-6 border-b border-[#DCD6C7] pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#A6C66A]/20 text-[#688537] border border-[#A6C66A]/40 rounded-sm text-[11px] font-mono font-semibold">
                SIMULATION CONFIGURATION
              </span>
              <span className="text-xs font-mono text-[#777A73]">30-Day Scenario Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#171B18]">
              Configure Your Identity
            </h2>
            <p className="text-xs text-[#777A73] font-sans">
              Choose your simulated financial persona and alert dialect. Fictional starting salary is ₹50,000.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-sm bg-[#D96B59]/10 border border-[#D96B59]/30 text-[#A64130] text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Persona */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs font-mono text-[#777A73] uppercase tracking-wider">
              <span className="flex items-center gap-1.5 font-semibold text-[#171B18]">
                <UserCheck className="w-3.5 h-3.5 text-[#688537]" />
                1. Demographic Persona
              </span>
              <span>Determines fraud attack vectors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`
                      p-4 rounded-sm border cursor-pointer transition-all duration-150 flex flex-col justify-between
                      ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#171B18] shadow-md ring-1 ring-[#171B18]'
                          : 'bg-[#ECE8DD]/60 border-[#DCD6C7] hover:bg-[#FFFFFF] hover:border-[#777A73]'
                      }
                    `}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-display font-bold text-sm text-[#171B18]">{p.title}</h4>
                        <div className={`w-3 h-3 rounded-full border ${isSelected ? 'bg-[#171B18] border-[#171B18]' : 'border-[#777A73]'}`} />
                      </div>
                      <p className="text-[11px] text-[#777A73] leading-relaxed mb-3">{p.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-[#DCD6C7]/60 text-[10px] font-mono font-semibold text-[#688537]">
                      {p.startingSalary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Dialect */}
          <div className="space-y-3 mb-8">
            <span className="flex items-center gap-1.5 text-xs font-mono text-[#171B18] uppercase tracking-wider font-semibold">
              <Languages className="w-3.5 h-3.5 text-[#688537]" />
              2. Notification Dialect
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`
                      p-3 rounded-sm border text-left transition-all duration-150
                      ${
                        isSelected
                          ? 'bg-[#171B18] text-[#F3F0E8] border-[#171B18] shadow-sm'
                          : 'bg-[#FFFFFF] text-[#171B18] border-[#DCD6C7] hover:bg-[#ECE8DD]'
                      }
                    `}
                  >
                    <span className="block font-medium text-xs">{lang.label}</span>
                    <span className={`block text-[10px] font-mono ${isSelected ? 'text-[#A3A69F]' : 'text-[#777A73]'}`}>
                      {lang.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#DCD6C7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-[#777A73]">
              Day 1 begins with ₹50,000 liquid salary credit
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleLaunch}
                isLoading={isLoading}
                className="w-full sm:w-auto bg-[#171B18] text-[#F3F0E8] hover:bg-[#282F2A]"
              >
                <span>Launch Day 1</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
