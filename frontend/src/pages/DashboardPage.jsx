import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Activity,
  ScanSearch,
  BookOpen,
  ArrowRight,
  Flame,
  Award,
  AlertOctagon,
  RotateCcw,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MonthlyTimeline } from '@/components/MonthlyTimeline';
import { GameInstructionsModal } from '@/components/GameInstructionsModal';
import { formatCurrency, formatNumber } from '@/utils/formatters';

export function DashboardPage() {
  const navigate = useNavigate();
  const { gameState, clearSession, restartGame, isLoading } = useGame();

  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // If no session exists, guide user to start a run
  if (!gameState) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-[#171B18] text-[#A6C66A] flex items-center justify-center mx-auto shadow-md">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-[#171B18]">No Active Simulation Run</h2>
          <p className="text-sm text-[#777A73]">
            Start a new 30-day run to receive your fictional ₹50,000 salary and begin defending your finances.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/onboarding')}
          className="bg-[#171B18] text-[#F3F0E8] font-bold px-8"
        >
          <span>Begin Onboarding</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
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
    money_protected,
    money_lost,
    is_completed,
    is_current_scenario_answered,
    current_scenario,
    persona,
    transactions_count,
  } = gameState;

  const currentDifficulty = current_scenario?.difficulty || 'EASY';
  const progressPercent = Math.min(100, Math.round(((current_day - 1 + (is_current_scenario_answered ? 1 : 0)) / total_days) * 100));

  // Restrained financial breakdown data for actual Recharts visualization
  const financialData = [
    { name: 'Start', amount: 50000, fill: '#171B18' },
    { name: 'Current Cash', amount: balance, fill: '#A6C66A' },
    { name: 'Investments', amount: investments, fill: '#D7B66D' },
    { name: 'Scam Losses', amount: money_lost, fill: '#D96B59' },
  ];

  return (
    <div className="space-y-10 py-2">

      {/* Field Manual Instructions Modal */}
      <GameInstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* =====================================================================
          TOP COMMAND BAR & SIMULATION PROGRESS
          ===================================================================== */}
      <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Identity & Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-[#171B18] text-[#A6C66A] text-[10px] font-mono font-bold tracking-wider uppercase">
                COMMAND CENTER
              </span>
              <Badge variant="neutral">{persona.replace(/_/g, ' ')}</Badge>
              {is_completed && (
                <span className="px-2 py-0.5 rounded-sm bg-[#A6C66A]/20 text-[#688537] text-[10px] font-mono font-bold uppercase">
                  MONTH COMPLETE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#171B18]">
              Day {current_day} <span className="text-sm font-mono text-[#777A73]">/ {total_days} Days</span>
            </h1>
          </div>

          {/* Quick Metrics (Score, Streak, Difficulty) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Score */}
            <div className="px-3.5 py-2 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777A73] block">Score</span>
              <span className="text-base font-numeric font-bold text-[#171B18]">{formatNumber(score)}</span>
            </div>

            {/* Streak */}
            <div className="px-3.5 py-2 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] text-left flex items-center gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#777A73] block">Streak</span>
                <span className="text-base font-numeric font-bold text-[#171B18]">{streak}</span>
              </div>
              <Flame className={`w-4 h-4 ${streak >= 3 ? 'text-[#D7B66D] fill-[#D7B66D]' : 'text-[#777A73]'}`} />
            </div>

            {/* Current Difficulty */}
            <div className="px-3.5 py-2 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777A73] block">Threat Tier</span>
              <span className={`text-xs font-mono font-bold block ${
                currentDifficulty === 'HARD' ? 'text-[#D96B59]' : currentDifficulty === 'MEDIUM' ? 'text-[#D7B66D]' : 'text-[#688537]'
              }`}>
                {currentDifficulty}
              </span>
            </div>

            {/* Restart Session */}
            <Button
              variant="outline"
              size="sm"
              onClick={restartGame}
              disabled={isLoading}
              className="text-xs text-[#777A73] hover:text-[#D96B59] border-[#DCD6C7] hover:border-[#D96B59]"
              title="Reset to Day 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

        </div>

        {/* Month Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-[#DCD6C7]/60">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#777A73]">
            <span>Simulation Month Progress</span>
            <span className="font-semibold text-[#171B18]">{progressPercent}% Completed</span>
          </div>
          <div className="h-2 w-full bg-[#F3F0E8] rounded-full overflow-hidden border border-[#DCD6C7]">
            <div
              className="h-full bg-[#171B18] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================================
          PRIMARY ACTION CALLOUT (PROMINENT: "CONTINUE SIMULATION")
          ===================================================================== */}
      <div className="bg-[#171B18] text-[#F3F0E8] border border-[#333C36] rounded-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A6C66A] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A6C66A]">
              {is_completed ? 'SIMULATION MONTH FINISHED' : `ACTIVE SCENARIO • DAY ${current_day}`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[#F3F0E8]">
            {is_completed
              ? 'All 30 Days Completed.'
              : is_current_scenario_answered
              ? `Day ${current_day} Answered • Ready for Day ${current_day + 1}`
              : `Incoming Alert Awaiting Verification`}
          </h2>
          <p className="text-xs sm:text-sm text-[#A3A69F] leading-relaxed">
            {is_completed
              ? 'Review your full monthly ledger breakdown, money preserved, and qualitative AI coach report.'
              : is_current_scenario_answered
              ? 'You have answered the scenario for today. Advance to the next calendar date to encounter tomorrow\'s banking traffic.'
              : 'A new SMS or payment push alert has landed on your phone screen. Review its technical giveaways and classify as SCAM or SAFE.'}
          </p>
        </div>

        <div className="flex-shrink-0 w-full md:w-auto">
          {is_completed ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/report')}
              className="w-full md:w-auto bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 font-bold text-sm tracking-wide px-8 py-4 shadow-xl"
            >
              <span>VIEW MONTH-END AUDIT REPORT</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/play')}
              className="w-full md:w-auto bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 font-bold text-sm tracking-wide px-8 py-4 shadow-xl flex items-center justify-center"
            >
              <span className="tracking-wider">CONTINUE SIMULATION</span>
              <ArrowRight className="w-4 h-4 ml-2 text-[#171B18]" />
            </Button>
          )}
        </div>
      </div>

      {/* =====================================================================
          FINANCIAL OVERVIEW: CASH, INVESTMENTS, NET WORTH & STARTING SALARY
          ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#171B18]" />
            <h3 className="font-display font-bold text-base text-[#171B18]">
              Financial Ledger Command
            </h3>
          </div>
          <span className="text-xs font-mono text-[#777A73]">Strictly Simulated Figures</span>
        </div>

        {/* 4 Core Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Available Cash */}
          <div className="p-5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#777A73] block">
              Available Cash
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#171B18]">
              {formatCurrency(balance)}
            </div>
            <p className="text-[11px] text-[#777A73] leading-tight">
              Liquid funds in checking account. Depleted by living costs and scam traps.
            </p>
          </div>

          {/* 2. Investment Portfolio (SIP) */}
          <div className="p-5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#777A73]">
                Investments (SIP)
              </span>
              <Badge variant="sage">Asset</Badge>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#688537]">
              {formatCurrency(investments)}
            </div>
            <p className="text-[11px] text-[#777A73] leading-tight">
              Simulated Nifty 50 Index Fund portfolio allocated on Day 7.
            </p>
          </div>

          {/* 3. Total Net Worth */}
          <div className="p-5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#777A73] block">
              Total Net Worth
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#171B18]">
              {formatCurrency(net_worth)}
            </div>
            <p className="text-[11px] text-[#777A73] leading-tight">
              Liquid Cash ({formatCurrency(balance)}) + Investment Assets ({formatCurrency(investments)}).
            </p>
          </div>

          {/* 4. Starting Salary Baseline */}
          <div className="p-5 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#777A73] block">
              Starting Salary
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#777A73]">
              ₹50,000
            </div>
            <p className="text-[11px] text-[#777A73] leading-tight">
              Initial deposit credited at beginning of 30-day simulation.
            </p>
          </div>

        </div>

        {/* Categorical Breakdown Bar (Routine, SIP, Loss, Protected) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm text-xs font-mono">
            <span className="text-[#777A73] text-[10px] uppercase block">Living Expenses</span>
            <span className="font-bold text-[#171B18]">Up to ₹19,000</span>
          </div>

          <div className="p-3 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm text-xs font-mono">
            <span className="text-[#777A73] text-[10px] uppercase block">SIP Allocation</span>
            <span className="font-bold text-[#688537]">₹5,000 Saved</span>
          </div>

          <div className="p-3 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm text-xs font-mono">
            <span className="text-[#777A73] text-[10px] uppercase block">Simulated Loss</span>
            <span className={`font-bold ${money_lost > 0 ? 'text-[#D96B59]' : 'text-[#777A73]'}`}>
              {formatCurrency(money_lost)}
            </span>
          </div>

          <div className="p-3 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm text-xs font-mono">
            <span className="text-[#777A73] text-[10px] uppercase block">Fraud Protected</span>
            <span className="font-bold text-[#D7B66D]">
              {formatCurrency(money_protected)}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          RESTRAINED DATA VISUALIZATION: FINANCIAL ALLOCATION
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Recharts Allocation Bar Chart */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-semibold">
                Ledger Capital Distribution
              </span>
              <h4 className="font-display font-bold text-sm text-[#171B18]">
                Real-Time Simulated Balance Breakdown
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#688537] font-semibold">Actual Data</span>
          </div>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: '#777A73' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#777A73' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Amount']}
                  contentStyle={{ backgroundColor: '#171B18', borderColor: '#333C36', color: '#F3F0E8', fontSize: '12px', fontFamily: 'IBM Plex Mono' }}
                />
                <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defense Dossier Stat Card */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-semibold">
              Cyber Defense Performance
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#DCD6C7]">
                <span className="text-[#777A73]">Transactions Logged:</span>
                <span className="font-bold text-[#171B18]">{transactions_count} Records</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCD6C7]">
                <span className="text-[#777A73]">Best Streak Record:</span>
                <span className="font-bold text-[#171B18]">{max_streak} Rounds</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCD6C7]">
                <span className="text-[#777A73]">Money Saved from Theft:</span>
                <span className="font-bold text-[#688537]">{formatCurrency(money_protected)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#777A73]">Current Fraud Penalties:</span>
                <span className="font-bold text-[#D96B59]">{formatCurrency(money_lost)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F3F0E8] border border-[#DCD6C7] rounded-sm text-[11px] font-mono text-[#777A73]">
            Every spotted scam protects wealth. Every careless tap incurs an irreversible simulated deduction.
          </div>
        </div>

      </div>

      {/* =====================================================================
          MONTHLY TIMELINE (DESKTOP HORIZONTAL / MOBILE VERTICAL)
          ===================================================================== */}
      <MonthlyTimeline currentDay={current_day} isCompleted={is_completed} />

      {/* =====================================================================
          SECONDARY ACTIONS & UTILITIES
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Action 1: Transaction Ledger */}
        <button
          type="button"
          onClick={() => navigate('/ledger')}
          className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] hover:border-[#171B18] hover:bg-[#F3F0E8] transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-semibold block">
              Audit Trail
            </span>
            <h4 className="font-display font-bold text-sm text-[#171B18]">
              View Transaction History
            </h4>
          </div>
          <Activity className="w-5 h-5 text-[#777A73] group-hover:text-[#171B18] transition-colors" />
        </button>

        {/* Action 2: Scan Mode */}
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] hover:border-[#171B18] hover:bg-[#F3F0E8] transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-semibold block">
              Forensic Lab
            </span>
            <h4 className="font-display font-bold text-sm text-[#171B18]">
              Open Scan Mode
            </h4>
          </div>
          <ScanSearch className="w-5 h-5 text-[#777A73] group-hover:text-[#171B18] transition-colors" />
        </button>

        {/* Action 3: Field Manual Instructions */}
        <button
          type="button"
          onClick={() => setIsInstructionsOpen(true)}
          className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] hover:border-[#171B18] hover:bg-[#F3F0E8] transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-semibold block">
              Field Manual
            </span>
            <h4 className="font-display font-bold text-sm text-[#171B18]">
              View Game Instructions
            </h4>
          </div>
          <BookOpen className="w-5 h-5 text-[#777A73] group-hover:text-[#171B18] transition-colors" />
        </button>
      </div>

    </div>
  );
}
