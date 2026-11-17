import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  ScanSearch,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Calendar,
  Lock,
  Zap,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PhoneNotificationComposition } from '@/components/PhoneNotificationComposition';
import { formatCurrency } from '@/utils/formatters';

const SCAM_ENCOUNTERS = [
  {
    category: 'UPI COLLECT TRAP',
    badge: 'Social Engineering',
    color: '#D96B59',
    headline: 'Wrong Transfer Refund Request',
    description: 'Fraudster sends a UPI collect request claiming they mistakenly sent money to your account for their sick sister.',
    reality: 'Entering your UPI PIN always debits money from your account. You never enter a PIN to receive or refund.',
  },
  {
    category: 'MALICIOUS APK',
    badge: 'Device Compromise',
    color: '#D96B59',
    headline: 'Urgent Bank KYC Expiry',
    description: 'SMS threatening immediate account suspension today unless you click an external link downloading an .apk file.',
    reality: 'Banks never distribute APK application files via SMS. Official banking happens exclusively on app stores.',
  },
  {
    category: 'TASK FRAUD',
    badge: 'Advance Fee',
    color: '#D96B59',
    headline: 'YouTube Review Work-from-Home',
    description: 'Offers ₹3,000–₹8,000 daily for trivial tasks like liking YouTube videos or leaving 5-star hotel reviews.',
    reality: 'Victims are paid small initial sums then pressured to deposit thousands into "prepaid merchant accounts".',
  },
  {
    category: 'DIGITAL ARREST',
    badge: 'Coercion & Extortion',
    color: '#D96B59',
    headline: 'CBI & Cyber Police Skype Summons',
    description: 'Threatens an immediate arrest warrant for money laundering packages tied to your Aadhaar card.',
    reality: 'Digital Arrest does not exist under Indian law. Law enforcement never conducts video call interrogations.',
  },
  {
    category: 'LEGITIMATE SALARY',
    badge: 'Authentic Banking',
    color: '#A6C66A',
    headline: 'Monthly NEFT Corporate Credit',
    description: 'Standard transactional credit notice from verified bank shortcode (AX-HDFCBK) masking account digits (*1204).',
    reality: 'Contains no external redirect links, no emotional urgency, and no credential harvesting forms.',
  },
  {
    category: 'LEGITIMATE UTILITY',
    badge: 'Authentic Receipt',
    color: '#A6C66A',
    headline: 'Official Electricity Bill Receipt',
    description: 'Standard receipt confirming payment of ₹1,200 for state electricity board via official portal.',
    reality: 'Confirms routine settlement without threatening immediate cutoff or demanding phone calls.',
  },
];

const SCHEDULED_EXPENSES_PREVIEW = [
  { day: 1, title: 'Monthly Salary Credit', amount: '+₹50,000', type: 'salary', note: 'Starting balance' },
  { day: 3, title: 'Apartment Rent', amount: '-₹12,000', type: 'expense', note: 'Essential living cost' },
  { day: 7, title: 'Nifty 50 Index SIP', amount: '-₹5,000', type: 'investment', note: 'Simulated wealth building' },
  { day: 12, title: 'Grocery Provisions', amount: '-₹3,500', type: 'expense', note: 'Pantry restocking' },
  { day: 16, title: 'Electricity Utility', amount: '-₹1,200', type: 'expense', note: 'State discom bill' },
  { day: 20, title: 'Broadband Renewal', amount: '-₹800', type: 'expense', note: 'Fiber internet' },
  { day: 25, title: 'Weekend Dining', amount: '-₹1,500', type: 'expense', note: 'Living & leisure' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { gameState, clearSession } = useGame();

  const handleEnterSimulation = () => {
    if (gameState) {
      navigate(gameState.is_completed ? '/report' : '/play');
    } else {
      navigate('/onboarding');
    }
  };

  const handleScanClick = () => {
    navigate('/scan');
  };

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Active Session Sticky Notice (if user has a game in progress) */}
      {gameState && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-sm bg-[#171B18] text-[#F3F0E8] border border-[#333C36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#A6C66A] animate-pulse flex-shrink-0" />
            <div>
              <span className="text-xs font-mono text-[#A3A69F] block">SESSION IN PROGRESS</span>
              <span className="font-display font-bold text-sm">
                Day {gameState.current_day} of {gameState.total_days} • Available Cash: {formatCurrency(gameState.balance)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSession}
              className="text-xs text-[#A3A69F] hover:text-[#D96B59] border-[#333C36] hover:border-[#D96B59]"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>Reset</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-[#F3F0E8] border-[#333C36] hover:bg-[#252B26]"
            >
              <span>Command Center</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(gameState.is_completed ? '/report' : '/play')}
              className="bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 text-xs font-bold"
            >
              <span>{gameState.is_completed ? 'View Audit Report' : `Resume Day ${gameState.current_day}`}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          1. HERO SECTION
          ===================================================================== */}
      <section className="pt-2 md:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Dominant Editorial Headline & CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171B18] text-[#A6C66A] rounded-sm text-xs font-mono font-semibold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A6C66A] animate-ping" />
                <span>ARTHATHON • AI FOR FINANCIAL DEFENSE</span>
              </div>

              {/* Exact Required Main Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-[#171B18] tracking-tight leading-[1.02]">
                ONE MONTH.<br />
                ZERO TRUST.<br />
                <span className="text-[#D96B59]">SURVIVE THE SCAMS.</span>
              </h1>
            </div>

            {/* Exact Required Supporting Text */}
            <p className="text-base sm:text-xl text-[#777A73] font-sans leading-relaxed max-w-xl">
              Your salary just arrived. Your bills are waiting. And scammers are already hunting. Can you survive the month?
            </p>

            {/* Exact Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 max-w-md">
              <Button
                variant="primary"
                size="lg"
                onClick={handleEnterSimulation}
                className="bg-[#171B18] text-[#F3F0E8] hover:bg-[#282F2A] font-bold text-sm tracking-wide py-4 shadow-xl flex-1 justify-center"
              >
                <span>ENTER THE SIMULATION</span>
                <ArrowRight className="w-4 h-4 ml-2 text-[#A6C66A]" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleScanClick}
                className="bg-[#FFFFFF] text-[#171B18] border-[#DCD6C7] hover:bg-[#ECE8DD] text-sm tracking-wide py-4 flex-1 justify-center"
              >
                <ScanSearch className="w-4 h-4 mr-1 text-[#777A73]" />
                <span>SCAN A MESSAGE</span>
              </Button>
            </div>

            {/* Trust Markers / Financial Micro-Specs */}
            <div className="pt-6 border-t border-[#DCD6C7] grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-xl sm:text-2xl font-display font-bold text-[#171B18] block">₹50,000</span>
                <span className="text-[11px] font-mono text-[#777A73] uppercase tracking-wider">Simulated Salary</span>
              </div>
              <div className="border-l border-[#DCD6C7] pl-4">
                <span className="text-xl sm:text-2xl font-display font-bold text-[#D96B59] block">12 Vectors</span>
                <span className="text-[11px] font-mono text-[#777A73] uppercase tracking-wider">Indian Scam Types</span>
              </div>
              <div className="border-l border-[#DCD6C7] pl-4">
                <span className="text-xl sm:text-2xl font-display font-bold text-[#688537] block">₹0 Real Risk</span>
                <span className="text-[11px] font-mono text-[#777A73] uppercase tracking-wider">Fictional Ledger</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Smartphone Notification Composition */}
          <div className="lg:col-span-5 flex justify-center">
            <PhoneNotificationComposition />
          </div>

        </div>
      </section>

      {/* =====================================================================
          2. THE SIMULATION: THE MONTHLY SURVIVAL ECONOMY
          ===================================================================== */}
      <section className="space-y-10 border-t border-[#DCD6C7] pt-16">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-semibold">
            01 / Financial Mechanics
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#171B18]">
            Living on Fictional Rupees.<br />
            Defending Real Human Instincts.
          </h2>
          <p className="text-sm sm:text-base text-[#777A73] leading-relaxed">
            In ScamQuest, fraud does not happen in a vacuum. It strikes while you are balancing routine obligations. When your rent is due on Day 3 and an urgent electricity cutoff notice arrives on Day 16, panic is the fraudster's strongest weapon.
          </p>
        </div>

        {/* Visual Monthly Balance Ledger Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-6 sm:p-8 shadow-sm">
          
          {/* Left Summary Card */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DCD6C7] pb-6 lg:pb-0 lg:pr-8">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#777A73]">Monthly Budget Ledger</span>
              <div className="space-y-1">
                <span className="text-3xl font-display font-bold text-[#171B18]">₹50,000.00</span>
                <span className="text-xs font-mono text-[#688537] block">Starting Liquid Deposit • Day 1</span>
              </div>
              <p className="text-xs text-[#777A73] leading-relaxed">
                Ordinary living expenses deduct ₹24,000 across the month. Every scam you fall for steals between ₹2,500 and ₹10,000. If your cash reaches ₹0, your run ends in financial collapse.
              </p>
            </div>

            <div className="p-4 bg-[#F3F0E8] rounded-sm border border-[#DCD6C7] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#171B18]">
                <span>Routine Living:</span>
                <span className="font-semibold">-₹19,000</span>
              </div>
              <div className="flex justify-between text-[#171B18]">
                <span>Nifty Index SIP:</span>
                <span className="font-semibold">-₹5,000</span>
              </div>
              <div className="flex justify-between text-[#D96B59] font-bold pt-1 border-t border-[#DCD6C7]">
                <span>Scam Penalty Risk:</span>
                <span>Up to ₹25,000+</span>
              </div>
            </div>
          </div>

          {/* Right: Scheduled Life Events Visual Timeline */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCD6C7]">
              <span className="text-xs font-mono font-semibold text-[#171B18] uppercase tracking-wider">
                Simulated 30-Day Financial Calendar
              </span>
              <span className="text-xs font-mono text-[#777A73]">Predictable Expenses vs. Random Attacks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCHEDULED_EXPENSES_PREVIEW.map((item) => {
                const isSalary = item.type === 'salary';
                const isSIP = item.type === 'investment';

                return (
                  <div
                    key={item.day}
                    className="p-3.5 rounded-sm border border-[#DCD6C7] bg-[#F3F0E8]/50 flex items-center justify-between hover:bg-[#F3F0E8] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-sm bg-[#171B18] text-[#F3F0E8] text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">
                        D{item.day}
                      </span>
                      <div>
                        <span className="font-display font-semibold text-xs text-[#171B18] block">{item.title}</span>
                        <span className="text-[10px] font-mono text-[#777A73]">{item.note}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold ${
                        isSalary ? 'text-[#688537]' : isSIP ? 'text-[#171B18]' : 'text-[#D96B59]'
                      }`}
                    >
                      {item.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          3. HOW IT WORKS: 3 STAGES
          ===================================================================== */}
      <section className="space-y-12 border-t border-[#DCD6C7] pt-16">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-semibold">
            02 / Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#171B18]">
            Three Stages of Financial Reflex.
          </h2>
          <p className="text-sm sm:text-base text-[#777A73] leading-relaxed">
            Gamified learning works because it replaces boring classroom lectures with visceral decision-making under realistic psychological conditions.
          </p>
        </div>

        {/* Asymmetric 3-Stage Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stage 1 */}
          <div className="p-6 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm space-y-4 hover:border-[#171B18] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#D7B66D]">01</span>
              <h3 className="font-display font-bold text-lg text-[#171B18]">
                Receive Authentic Alerts
              </h3>
              <p className="text-xs text-[#777A73] leading-relaxed">
                Hyper-realistic push alerts land on your phone screen. Senders use spoofed TRAI alphanumeric shortcodes, urgent electricity deadlines, or emotional "wrong payment" pleas.
              </p>
            </div>
            <div className="pt-4 border-t border-[#DCD6C7] text-[11px] font-mono text-[#688537]">
              ✓ Hindi, Hinglish & English
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-6 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm space-y-4 hover:border-[#171B18] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#D96B59]">02</span>
              <h3 className="font-display font-bold text-lg text-[#171B18]">
                Decide: SCAM or SAFE
              </h3>
              <p className="text-xs text-[#777A73] leading-relaxed">
                Make your call with one tap. A correct spot saves your balance and compounds your streak. A careless tap on an APK link or collect request triggers immediate simulated deduction.
              </p>
            </div>
            <div className="pt-4 border-t border-[#DCD6C7] text-[11px] font-mono text-[#D96B59]">
              ✕ Wrong tap = Instant financial penalty
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-6 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm space-y-4 hover:border-[#171B18] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#688537]">03</span>
              <h3 className="font-display font-bold text-lg text-[#171B18]">
                Forensic Feedback & AI Coach
              </h3>
              <p className="text-xs text-[#777A73] leading-relaxed">
                Instant jargon-free dissection reveals the exact social engineering trick. At month end, an AI Coach audits your run, scoring your resilience and flagging your exact psychological vulnerabilities.
              </p>
            </div>
            <div className="pt-4 border-t border-[#DCD6C7] text-[11px] font-mono text-[#171B18]">
              ★ Personalized Month-End Audit
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          4. WHAT YOU WILL ENCOUNTER
          ===================================================================== */}
      <section className="space-y-10 border-t border-[#DCD6C7] pt-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-semibold">
              03 / Attack Vector Coverage
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#171B18]">
              The Indian Fraud Matrix.
            </h2>
          </div>
          <span className="text-xs font-mono text-[#777A73]">
            12 Scam Typologies + 4 Legitimate Daily Notifications
          </span>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCAM_ENCOUNTERS.map((enc) => (
            <div
              key={enc.category}
              className="p-5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] hover:border-[#171B18] transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${enc.color}15`, color: enc.color, border: `1px solid ${enc.color}40` }}
                  >
                    {enc.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#777A73]">{enc.badge}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-[#171B18]">{enc.headline}</h3>
                <p className="text-xs text-[#777A73] leading-relaxed">{enc.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCD6C7]/60 text-[11px] font-mono text-[#171B18] bg-[#F3F0E8]/40 p-2 rounded-sm">
                <span className="text-[#688537] font-bold block mb-0.5">Defensive Rule:</span>
                {enc.reality}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          5. SCAN MODE SHOWCASE
          ===================================================================== */}
      <section className="border-t border-[#DCD6C7] pt-16">
        <div className="bg-[#171B18] text-[#F3F0E8] rounded-sm p-8 sm:p-12 border border-[#333C36] relative overflow-hidden">
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#282F2A] text-[#A6C66A] rounded-sm text-xs font-mono font-semibold border border-[#3B453E]">
              <ScanSearch className="w-3.5 h-3.5" />
              <span>INDEPENDENT FORENSIC UTILITY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#F3F0E8] leading-tight">
              Got a Suspicious SMS Right Now?<br />
              <span className="text-[#A6C66A]">Audit It in Scan Mode.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A3A69F] leading-relaxed">
              Scan Mode lets you paste any suspicious message you or your family received in real life. Our hybrid engine runs deterministic regex checks for malicious APKs, lookalike banking domains, and collect traps, paired with contextual AI threat scoring.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleScanClick}
                className="bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 font-bold text-sm"
              >
                <ScanSearch className="w-4 h-4 mr-2" />
                <span>Launch Message Scanner</span>
              </Button>
              <span className="text-xs font-mono text-[#777A73]">
                Zero storage • Messages never logged to disk
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          6. CLOSING CTA
          ===================================================================== */}
      <section className="text-center py-16 space-y-8 border-t border-[#DCD6C7]">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-semibold">
            04 / Readiness Challenge
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#171B18] tracking-tight">
            Can Your Wallet Survive 30 Days?
          </h2>
          <p className="text-sm sm:text-base text-[#777A73] leading-relaxed">
            Test your reflexes in a sandbox before fraudsters test them in your actual bank account. Fictional salary, genuine defensive training.
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleEnterSimulation}
            className="bg-[#171B18] text-[#F3F0E8] hover:bg-[#282F2A] font-bold text-sm tracking-wide px-8 py-4 shadow-xl"
          >
            <span>ENTER THE SIMULATION</span>
            <ArrowRight className="w-4 h-4 ml-2 text-[#A6C66A]" />
          </Button>
        </div>
      </section>

    </div>
  );
}
