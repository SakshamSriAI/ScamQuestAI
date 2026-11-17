import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Gauge,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Store,
  GraduationCap,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';

const PERSONAS = [
  {
    id: 'COLLEGE_STUDENT',
    title: 'College Student',
    roleTag: 'Student Demographic',
    icon: GraduationCap,
    desc: 'Targeted by fake work-from-home tasks, crypto airdrops, exam fee cutoffs, and hostel rent traps.',
    startingSalary: '₹50,000 Fictional Salary',
    focusVectors: ['Task Scams (Telegram)', 'Crypto Airdrops', 'Fake Job Offers'],
  },
  {
    id: 'SHOPKEEPER',
    title: 'Small Shopkeeper',
    roleTag: 'Merchant / Kirana',
    icon: Store,
    desc: 'Targeted by "wrong transfer" collect requests, fake soundbox alerts, and wholesale supplier payment traps.',
    startingSalary: '₹50,000 Fictional Turnover',
    focusVectors: ['UPI Collect Traps', 'QR Code Spoofs', 'Fake Soundbox Notifications'],
  },
  {
    id: 'WORKING_PROFESSIONAL',
    title: 'Working Professional',
    roleTag: 'Corporate Employee',
    icon: Briefcase,
    desc: 'Targeted by EPFO / PF phishing, income tax refund traps, credit card reward points, and headhunter scams.',
    startingSalary: '₹50,000 Fictional Salary',
    focusVectors: ['EPFO / Tax Phishing', 'Credit Card Reward Spoofs', 'Travel Refund Traps'],
  },
  {
    id: 'SENIOR_CITIZEN',
    title: 'Senior Citizen',
    roleTag: 'Pensioner Demographic',
    icon: HeartHandshake,
    desc: 'Targeted by digital arrest extortion, electricity disconnect threats, and pension deactivation notices.',
    startingSalary: '₹50,000 Fictional Pension',
    focusVectors: ['Digital Arrest (Police Extortion)', 'Electricity Cutoffs', 'Pension KYC Deactivation'],
  },
];

const DIFFICULTIES = [
  {
    id: 'EASY',
    levelTitle: 'Beginner',
    badge: 'Gentle Learning Curve',
    tagline: 'Clear telltales & visible grammar red flags',
    desc: 'Scam messages contain obvious giveaways like private 10-digit sender numbers, blatant spelling errors, and raw unencrypted links. Ideal for first-time scam spotters.',
    riskModifier: 'Standard Penalties (₹2,500 / error)',
  },
  {
    id: 'MEDIUM',
    levelTitle: 'Intermediate',
    badge: 'Realistic Daily Traffic',
    tagline: 'Authentic bank templates & subtle urgency',
    desc: 'Uses believable Indian corporate bank layouts, plausible urgency, and deceptive lookalike domains. Requires close inspection of sender shortcodes and URLs.',
    riskModifier: 'Elevated Penalties (₹4,500 / error)',
  },
  {
    id: 'HARD',
    levelTitle: 'Advanced',
    badge: 'High Threat Level',
    tagline: 'Deceptive social engineering & spoofed shortcodes',
    desc: 'Simulates cutting-edge fraud patterns: multi-step UPI collect traps, highly manipulative emotional pleas, and spoofed headers. Tests sharp instinct.',
    riskModifier: 'Severe Penalties (₹7,500 / error)',
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { startNewGame, isLoading, error } = useGame();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState('COLLEGE_STUDENT');
  const [selectedDifficulty, setSelectedDifficulty] = useState('EASY');
  const [selectedLanguage, setSelectedLanguage] = useState('HINGLISH');
  const [apiError, setApiError] = useState(null);

  const activePersonaObj = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];
  const activeDifficultyObj = DIFFICULTIES.find((d) => d.id === selectedDifficulty) || DIFFICULTIES[0];

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate('/');
    }
  };

  const handleStartSimulation = async () => {
    setApiError(null);
    try {
      await startNewGame({
        persona: selectedPersona,
        language: selectedLanguage,
        initial_difficulty: selectedDifficulty,
        total_days: 30,
      });
      // Navigate to main simulator dashboard
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Failed to initialize simulation session with backend.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8 select-none">
      
      {/* Top Progress & Header Bar */}
      <div className="space-y-3 border-b border-[#DCD6C7] pb-5">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A6C66A]" />
            <span className="text-[#171B18] font-bold tracking-wider uppercase">
              STEP 0{currentStep} OF 04
            </span>
            <span className="text-[#777A73] hidden sm:inline">•</span>
            <span className="text-[#777A73] hidden sm:inline uppercase tracking-tight">
              {currentStep === 1 && 'Player Briefing'}
              {currentStep === 2 && 'Persona Selection'}
              {currentStep === 3 && 'Starting Difficulty'}
              {currentStep === 4 && 'Pre-Flight Confirmation'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[#777A73] hover:text-[#171B18] transition-colors"
          >
            Exit Setup
          </button>
        </div>

        {/* Segmented Progress Indicator */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step <= currentStep ? 'bg-[#171B18]' : 'bg-[#DCD6C7]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* API Error Notification */}
      {(apiError || error) && (
        <div className="p-4 rounded-sm bg-[#D96B59]/10 border border-[#D96B59]/40 text-[#A64130] text-xs font-mono flex items-center justify-between">
          <span>{apiError || error}</span>
          <button type="button" onClick={() => setApiError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Step Views with Animated Transition */}
      <AnimatePresence mode="wait">
        
        {/* ===================================================================
            SCREEN 1: PLAYER INTRODUCTION
            =================================================================== */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-[#A6C66A]/20 text-[#688537] border border-[#A6C66A]/40 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ARTHATHON BRIEFING</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#171B18] tracking-tight leading-tight">
                Welcome to ScamQuest.
              </h1>
              <p className="text-base sm:text-lg text-[#777A73] leading-relaxed">
                ScamQuest is a gamified financial literacy simulator where you experience a full 30-day month on a simulated salary, balancing living expenses while fending off hyper-realistic Indian financial scams.
              </p>
            </div>

            {/* Key Simulation Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-2">
                <div className="flex items-center gap-2 text-[#688537]">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">Starting Capital</span>
                </div>
                <div className="text-2xl font-display font-bold text-[#171B18]">₹50,000</div>
                <p className="text-xs text-[#777A73] leading-relaxed">
                  Fictional liquid salary credited to your account on Day 1.
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-2">
                <div className="flex items-center gap-2 text-[#D7B66D]">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">Time Horizon</span>
                </div>
                <div className="text-2xl font-display font-bold text-[#171B18]">30 Days</div>
                <p className="text-xs text-[#777A73] leading-relaxed">
                  Fast-paced run: ~5 to 8 minutes of real decision-making time.
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-2">
                <div className="flex items-center gap-2 text-[#D96B59]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">Strict Rule</span>
                </div>
                <div className="text-2xl font-display font-bold text-[#171B18]">₹0 Real Money</div>
                <p className="text-xs text-[#777A73] leading-relaxed">
                  All transactions, deductions, and banking alerts are 100% simulated.
                </p>
              </div>
            </div>

            {/* Bottom Nav Action */}
            <div className="pt-6 border-t border-[#DCD6C7] flex items-center justify-between">
              <span className="text-xs font-mono text-[#777A73]">Step 1 of 4: Introduction</span>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                className="bg-[#171B18] text-[#F3F0E8] hover:bg-[#282F2A] px-8"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4 ml-2 text-[#A6C66A]" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 2: PLAYER PERSONA
            =================================================================== */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-semibold">
                DEMOGRAPHIC CONFIGURATION
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#171B18] tracking-tight">
                Select Your Financial Persona.
              </h2>
              <p className="text-sm text-[#777A73]">
                Your persona directly influences the attack patterns generated by the simulation engine. Scammers adapt their psychological hooks to your demographic.
              </p>
            </div>

            {/* 4 Persona Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PERSONAS.map((persona) => {
                const Icon = persona.icon;
                const isSelected = selectedPersona === persona.id;

                return (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`
                      p-5 rounded-sm border cursor-pointer transition-all duration-150 flex flex-col justify-between
                      ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#171B18] shadow-md ring-2 ring-[#171B18]'
                          : 'bg-[#FFFFFF]/70 border-[#DCD6C7] hover:bg-[#FFFFFF] hover:border-[#777A73]'
                      }
                    `}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-sm ${isSelected ? 'bg-[#171B18] text-[#F3F0E8]' : 'bg-[#ECE8DD] text-[#171B18]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-base text-[#171B18]">{persona.title}</h3>
                            <span className="text-[10px] font-mono text-[#777A73] uppercase">{persona.roleTag}</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#171B18] bg-[#171B18]' : 'border-[#777A73]'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#A6C66A]" />}
                        </div>
                      </div>

                      <p className="text-xs text-[#777A73] leading-relaxed">{persona.desc}</p>

                      {/* Vector Tags */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-mono text-[#777A73] uppercase block font-semibold">Typical Attacks:</span>
                        <div className="flex flex-wrap gap-1">
                          {persona.focusVectors.map((v) => (
                            <span key={v} className="px-1.5 py-0.5 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] text-[10px] font-mono text-[#171B18]">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#DCD6C7] text-[11px] font-mono text-[#688537] font-semibold">
                      {persona.startingSalary}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Nav Action */}
            <div className="pt-6 border-t border-[#DCD6C7] flex items-center justify-between">
              <Button variant="ghost" onClick={handlePrevStep} className="text-xs text-[#777A73]">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                className="bg-[#171B18] text-[#F3F0E8] hover:bg-[#282F2A] px-8"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4 ml-2 text-[#A6C66A]" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 3: DIFFICULTY
            =================================================================== */}
        {currentStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-semibold">
                CHALLENGE THRESHOLD
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#171B18] tracking-tight">
                Choose Starting Difficulty.
              </h2>
              <p className="text-sm text-[#777A73]">
                Set your initial comfort level. <strong>Note:</strong> The backend's adaptive difficulty engine remains authoritative during gameplay, automatically tuning difficulty up or down as your streak compounds.
              </p>
            </div>

            {/* 3 Difficulty Cards */}
            <div className="space-y-4">
              {DIFFICULTIES.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;

                return (
                  <div
                    key={diff.id}
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`
                      p-5 rounded-sm border cursor-pointer transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                      ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#171B18] shadow-md ring-2 ring-[#171B18]'
                          : 'bg-[#FFFFFF]/70 border-[#DCD6C7] hover:bg-[#FFFFFF] hover:border-[#777A73]'
                      }
                    `}
                  >
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-display font-bold text-lg text-[#171B18]">{diff.levelTitle}</h3>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold ${
                          diff.id === 'EASY' ? 'bg-[#A6C66A]/20 text-[#688537]' : diff.id === 'MEDIUM' ? 'bg-[#D7B66D]/20 text-[#9E7E36]' : 'bg-[#D96B59]/20 text-[#A64130]'
                        }`}>
                          {diff.badge}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#171B18]">{diff.tagline}</p>
                      <p className="text-xs text-[#777A73] leading-relaxed">{diff.desc}</p>
                    </div>

                    <div className="sm:text-right flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DCD6C7]">
                      <span className="text-[11px] font-mono text-[#D96B59] font-semibold block">{diff.riskModifier}</span>
                      <div className={`mt-2 w-4 h-4 rounded-full border sm:ml-auto flex items-center justify-center ${isSelected ? 'border-[#171B18] bg-[#171B18]' : 'border-[#777A73]'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#A6C66A]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dialect Selector */}
            <div className="p-4 bg-[#FFFFFF] rounded-sm border border-[#DCD6C7] space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#171B18] font-semibold block">
                Preferred Notification Dialect
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'HINGLISH', label: 'Hinglish (Recommended)' },
                  { id: 'ENGLISH', label: 'Indian English' },
                  { id: 'HINDI', label: 'Hindi (हिंदी)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLanguage(l.id)}
                    className={`
                      py-2 px-3 rounded-sm text-xs font-medium border text-center transition-colors
                      ${
                        selectedLanguage === l.id
                          ? 'bg-[#171B18] text-[#F3F0E8] border-[#171B18]'
                          : 'bg-[#F3F0E8] text-[#171B18] border-[#DCD6C7] hover:bg-[#ECE8DD]'
                      }
                    `}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Nav Action */}
            <div className="pt-6 border-t border-[#DCD6C7] flex items-center justify-between">
              <Button variant="ghost" onClick={handlePrevStep} className="text-xs text-[#777A73]">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                className="bg-[#171B18] text-[#F3F0E8] hover:bg-[#282F2A] px-8"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4 ml-2 text-[#A6C66A]" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 4: CONFIRMATION
            =================================================================== */}
        {currentStep === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-semibold">
                PRE-FLIGHT BRIEFING
              </span>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#171B18] tracking-tight">
                Review Your Simulation Dossier.
              </h2>
              <p className="text-sm text-[#777A73]">
                Verify your parameters. Once you click start, Day 1 begins immediately with your initial salary deposit.
              </p>
            </div>

            {/* Confirmation Dossier Card */}
            <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Header Dossier Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCD6C7]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#777A73] block mb-1">Assigned Identity</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-display font-bold text-[#171B18]">{activePersonaObj.title}</span>
                    <Badge variant="sage">{activePersonaObj.roleTag}</Badge>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#777A73] block mb-1">Starting Salary</span>
                  <span className="text-2xl font-display font-bold text-[#688537]">₹50,000.00</span>
                </div>
              </div>

              {/* Simulation Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] space-y-1">
                  <span className="text-[#777A73] uppercase text-[10px] block">Initial Difficulty</span>
                  <span className="font-bold text-[#171B18] text-sm">{activeDifficultyObj.levelTitle}</span>
                  <span className="text-[10px] text-[#688537] block">Adaptive active</span>
                </div>

                <div className="p-3.5 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] space-y-1">
                  <span className="text-[#777A73] uppercase text-[10px] block">Dialect Language</span>
                  <span className="font-bold text-[#171B18] text-sm">{selectedLanguage}</span>
                  <span className="text-[10px] text-[#777A73] block">Indian localized</span>
                </div>

                <div className="p-3.5 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] space-y-1">
                  <span className="text-[#777A73] uppercase text-[10px] block">Simulation Horizon</span>
                  <span className="font-bold text-[#171B18] text-sm">30 Calendar Days</span>
                  <span className="text-[10px] text-[#777A73] block">Rent, SIP & Bills included</span>
                </div>
              </div>

              {/* Pre-Scheduled Expenses Briefing */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono font-semibold text-[#171B18] uppercase tracking-wider block">
                  Mandatory Expenses Ahead:
                </span>
                <p className="text-xs text-[#777A73] leading-relaxed">
                  You must survive deductions for Day 3 Rent (₹12,000), Day 7 Nifty Index SIP (₹5,000), Day 12 Groceries (₹3,500), and Day 16 Utilities (₹1,200). Falling for scams will deplete your remaining buffer.
                </p>
              </div>

              {/* Legal / Fair Play Sandbox Notice */}
              <div className="p-3 rounded-sm bg-[#ECE8DD]/60 border border-[#DCD6C7] flex items-center gap-3 text-[11px] font-mono text-[#777A73]">
                <CheckCircle2 className="w-4 h-4 text-[#688537] flex-shrink-0" />
                <span>Zero Real Money Guarantee: Fictional educational simulation for Arthathon.</span>
              </div>
            </div>

            {/* Bottom Final Launch Action */}
            <div className="pt-6 border-t border-[#DCD6C7] flex items-center justify-between">
              <Button variant="ghost" onClick={handlePrevStep} disabled={isLoading} className="text-xs text-[#777A73]">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Adjust Settings</span>
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartSimulation}
                isLoading={isLoading}
                className="bg-[#171B18] text-[#F3F0E8] hover:bg-[#282F2A] px-10 py-4 font-bold text-sm tracking-wide shadow-xl"
              >
                <span>START MY SIMULATION</span>
                <ArrowRight className="w-4 h-4 ml-2 text-[#A6C66A]" />
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
