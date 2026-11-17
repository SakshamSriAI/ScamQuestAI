import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Award,
  ArrowRight,
  RotateCcw,
  Home,
  Activity,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Flame,
  PiggyBank,
  Wallet,
  Sparkles,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useGame } from '@/context/GameContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';

export function ReportPage() {
  const navigate = useNavigate();
  const { sessionId, gameState, restartGame, startNewGame } = useGame();

  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getMonthEndReport(sessionId);
        if (mounted) {
          setReport(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              'Could not load the Month-End Audit Report. Complete the 30-day simulation first.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const handlePlayAgain = async () => {
    setIsRestarting(true);
    try {
      if (sessionId) {
        await restartGame();
        navigate('/play');
      } else {
        navigate('/onboarding');
      }
    } catch {
      navigate('/onboarding');
    } finally {
      setIsRestarting(false);
    }
  };

  // State A: No Session Active
  if (!sessionId) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#171B18] text-[#D7B66D] mx-auto flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#171B18]">
            No Simulation Completed
          </h2>
          <p className="text-sm text-[#777A73]">
            You have not finished a 30-day financial survival simulation yet. Begin a run to generate your comprehensive audit report.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="w-full sm:w-auto bg-[#171B18] text-[#F3F0E8] font-bold px-8"
          >
            <span>Begin Simulation</span>
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

  // State B: Simulation Incomplete (e.g. on Day 14 of 30)
  if (gameState && !gameState.is_completed && !report) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF5EB] border border-[#D7B66D] text-[#D7B66D] mx-auto flex items-center justify-center shadow-sm">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B08930] block">
            SIMULATION IN PROGRESS • DAY {gameState.current_day} OF {gameState.total_days}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#171B18]">
            Month-End Report Locked
          </h2>
          <p className="text-sm text-[#777A73]">
            The final audit dossier unlocks after completing all 30 days of financial decisions. You are currently on Day {gameState.current_day}.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/play')}
            className="w-full sm:w-auto bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 font-bold px-8"
          >
            <span>Continue to Day {gameState.current_day}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto border-[#DCD6C7] text-[#171B18]"
          >
            Command Center
          </Button>
        </div>
      </div>
    );
  }

  // State C: Loading
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#171B18] border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="font-display font-bold text-lg text-[#171B18]">
          Compiling Monthly Financial Audit...
        </h3>
        <p className="text-xs font-mono text-[#777A73]">
          Synthesizing transaction ledgers, fraud prevention records, and Gemini coach review.
        </p>
      </div>
    );
  }

  // State D: Error Loading Report
  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#D96B59]/15 text-[#D96B59] mx-auto flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl text-[#171B18]">
            Unable to Load Report
          </h3>
          <p className="text-xs font-mono text-[#777A73]">
            {error || 'The report data could not be retrieved from the backend.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/dashboard')}
            className="bg-[#171B18] text-[#F3F0E8]"
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => window.location.reload()}
            className="border-[#DCD6C7]"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Destructure verified backend report data
  const {
    persona,
    starting_balance = 50000,
    final_balance,
    investments_balance,
    net_worth,
    total_routine_expenses,
    money_protected,
    money_lost,
    total_scenarios_faced,
    correct_decisions,
    overall_accuracy_percentage,
    max_streak,
    survival_score,
    category_breakdown = [],
    achievements = [],
    ai_coach_report,
  } = report;

  const personaLabel = {
    COLLEGE_STUDENT: 'College Student',
    SHOPKEEPER: 'Small Shopkeeper',
    WORKING_PROFESSIONAL: 'Working Professional',
    SENIOR_CITIZEN: 'Senior Citizen',
  }[persona] || persona;

  // Identify Strongest & Weakest Category
  const sortedCategories = [...category_breakdown]
    .filter((c) => c.times_encountered > 0)
    .sort((a, b) => b.accuracy_percentage - a.accuracy_percentage);

  const strongestCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
  const weakestCategory =
    sortedCategories.length > 0 ? sortedCategories[sortedCategories.length - 1] : null;

  // Recharts Data: Financial Net Worth Waterfall Breakdown
  const financialWaterfallData = [
    { name: 'Start Salary', amount: starting_balance, fill: '#171B18' },
    { name: 'Liquid Cash', amount: final_balance, fill: '#688537' },
    { name: 'SIP Assets', amount: investments_balance, fill: '#D7B66D' },
    { name: 'Living Expenses', amount: total_routine_expenses, fill: '#777A73' },
    { name: 'Fraud Penalties', amount: money_lost, fill: '#D96B59' },
  ];

  // Recharts Data: Category Accuracy Performance
  const categoryChartData = category_breakdown
    .filter((c) => c.times_encountered > 0)
    .map((c) => {
      const cleanName = c.scam_type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
      return {
        name: cleanName,
        accuracy: c.accuracy_percentage,
        encountered: c.times_encountered,
        correct: c.correctly_identified,
        mistakes: c.mistakes,
        fill:
          c.accuracy_percentage >= 80
            ? '#688537'
            : c.accuracy_percentage >= 50
            ? '#D7B66D'
            : '#D96B59',
      };
    });

  // Survival Tier classification
  const survivalTier =
    survival_score >= 80
      ? { label: 'FORTRESS TIER', color: '#688537', textClass: 'text-[#688537]', bgClass: 'bg-[#688537]/15 border-[#688537]/30' }
      : survival_score >= 60
      ? { label: 'VIGILANT TIER', color: '#B08930', textClass: 'text-[#B08930]', bgClass: 'bg-[#D7B66D]/15 border-[#D7B66D]/30' }
      : { label: 'VULNERABLE TIER', color: '#D96B59', textClass: 'text-[#D96B59]', bgClass: 'bg-[#D96B59]/15 border-[#D96B59]/40' };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* =====================================================================
          1. HEADER: BRAND STATEMENT & META
          ===================================================================== */}
      <div className="border-b border-[#DCD6C7] pb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-sm bg-[#171B18] text-[#F3F0E8] font-mono text-[10px] uppercase font-bold tracking-wider">
              30-DAY SIMULATION AUDIT
            </span>
            <span className="text-xs font-mono text-[#777A73]">
              Persona: {personaLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-sm text-xs font-mono font-bold uppercase border ${survivalTier.bgClass} ${survivalTier.textClass}`}>
              {survivalTier.label}
            </span>
            {ai_coach_report?.grade && (
              <span className="px-2 py-0.5 rounded-sm bg-[#171B18] text-[#D7B66D] text-xs font-mono font-bold">
                Grade: {ai_coach_report.grade}
              </span>
            )}
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-[#171B18] tracking-tight leading-none">
          YOUR MONTH. YOUR DECISIONS. YOUR RESULTS.
        </h1>

        <p className="text-sm sm:text-base text-[#777A73] max-w-3xl font-sans leading-relaxed">
          You navigated 30 days of high-velocity Indian banking traffic, routine living expenses, and deceptive cyber threats. Here is your definitive financial survival audit.
        </p>
      </div>

      {/* =====================================================================
          2. PROMINENT SCAM SURVIVAL SCORE CARD
          ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#171B18] text-[#F3F0E8] rounded-sm p-6 sm:p-8 border border-[#313932] shadow-xl relative overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left: Prominent Score Gauge */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-[#2C342E] pb-6 md:pb-0 md:pr-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[#A6C66A] font-bold">
              SCAM SURVIVAL SCORE
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-6xl sm:text-7xl font-mono font-extrabold text-[#F3F0E8]">
                {survival_score}
              </span>
              <span className="text-xl font-mono text-[#777A73]">/ 100</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: survivalTier.color }} />
              <span className="font-display font-bold text-sm tracking-wide text-[#F3F0E8]">
                {survivalTier.label}
              </span>
            </div>

            <p className="text-[11px] font-mono text-[#A3A69F] pt-2 leading-relaxed">
              Composite engine index: 45% Detection Accuracy + 35% Net Worth Preservation + 20% Sustained Streak.
            </p>
          </div>

          {/* Right: Core Performance Breakdown */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-sm bg-[#1F2420] border border-[#2B322D] space-y-1">
              <span className="text-[10px] font-mono text-[#777A73] uppercase tracking-wider block">
                Overall Accuracy
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-[#A6C66A]">
                {overall_accuracy_percentage}%
              </span>
              <span className="text-[10px] font-mono text-[#A3A69F] block">
                {correct_decisions} of {total_scenarios_faced} Safe
              </span>
            </div>

            <div className="p-3.5 rounded-sm bg-[#1F2420] border border-[#2B322D] space-y-1">
              <span className="text-[10px] font-mono text-[#777A73] uppercase tracking-wider block">
                Max Winning Streak
              </span>
              <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-mono font-bold text-[#D7B66D]">
                <Flame className="w-5 h-5 fill-[#D7B66D]" />
                <span>{max_streak}</span>
              </div>
              <span className="text-[10px] font-mono text-[#A3A69F] block">
                Consecutive Rounds
              </span>
            </div>

            <div className="p-3.5 rounded-sm bg-[#1F2420] border border-[#2B322D] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-[#777A73] uppercase tracking-wider block">
                Money Protected
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-[#688537]">
                {formatCurrency(money_protected)}
              </span>
              <span className="text-[10px] font-mono text-[#A3A69F] block">
                Thwarted Thefts
              </span>
            </div>

            <div className="col-span-2 sm:col-span-3 pt-2 text-xs font-mono text-[#777A73] border-t border-[#2C342E] flex items-center justify-between">
              <span>Simulation Days: 30 / 30 Completed</span>
              <span className="text-[#A6C66A]">Ledger Closed</span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* =====================================================================
          3. FINANCIAL SUMMARY (WALLET, SIP, EXPENSES, FRAUD LOSSES)
          ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#171B18]" />
            <h2 className="font-display font-extrabold text-xl text-[#171B18] tracking-tight">
              Monthly Financial Ledger Summary
            </h2>
          </div>
          <span className="text-xs font-mono text-[#777A73]">
            Actual Backend Accounting Data
          </span>
        </div>

        {/* 6-Metric Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Starting Salary */}
          <div className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#777A73] tracking-wider block">
              Starting Salary
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#171B18]">
              {formatCurrency(starting_balance)}
            </div>
            <span className="text-[9px] font-mono text-[#777A73] block">Day 1 Credit</span>
          </div>

          {/* Liquid Cash */}
          <div className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#777A73] tracking-wider block">
              Final Cash
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#171B18]">
              {formatCurrency(final_balance)}
            </div>
            <span className="text-[9px] font-mono text-[#688537] block font-semibold">Liquid Balance</span>
          </div>

          {/* Investments (SIP) */}
          <div className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#777A73] tracking-wider block">
              SIP Assets
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#B08930]">
              {formatCurrency(investments_balance)}
            </div>
            <span className="text-[9px] font-mono text-[#B08930] block">Index Funds</span>
          </div>

          {/* Net Worth */}
          <div className="p-4 rounded-sm bg-[#FFFFFF] border-2 border-[#171B18] space-y-1 shadow-sm">
            <span className="text-[10px] font-mono uppercase text-[#171B18] tracking-wider font-bold block">
              Total Net Worth
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#171B18]">
              {formatCurrency(net_worth)}
            </div>
            <span className="text-[9px] font-mono text-[#777A73] block">Cash + Assets</span>
          </div>

          {/* Routine Expenses */}
          <div className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#777A73] tracking-wider block">
              Living Expenses
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#777A73]">
              {formatCurrency(total_routine_expenses)}
            </div>
            <span className="text-[9px] font-mono text-[#777A73] block">Rent, Bills, Food</span>
          </div>

          {/* Fraud Penalties */}
          <div className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#D96B59] tracking-wider font-bold block">
              Scam Losses
            </span>
            <div className="text-base sm:text-lg font-mono font-bold text-[#D96B59]">
              {formatCurrency(money_lost)}
            </div>
            <span className="text-[9px] font-mono text-[#D96B59] block">Simulated Penalties</span>
          </div>
        </div>

        {/* Protected Amount Disctinction Notice */}
        <div className="p-4 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#171B18] mt-0.5 flex-shrink-0" />
          <div className="text-xs font-sans text-[#40443E] space-y-1 leading-relaxed">
            <p>
              <strong>Protected Amount Accounting:</strong> You prevented a simulated{' '}
              <strong className="text-[#688537] font-mono">{formatCurrency(money_protected)}</strong> from being stolen by spotting fraudulent collect requests and phishing traps. As prevented loss, protected amounts are kept conceptually distinct and never credited as liquid cash.
            </p>
          </div>
        </div>

        {/* Visual Recharts Waterfall Comparison */}
        <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-5 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-bold block">
            Capital Allocation & Outflow Breakdown (INR)
          </span>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialWaterfallData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#171B18' }}
                  axisLine={{ stroke: '#DCD6C7' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#777A73' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#171B18',
                    borderColor: '#333C36',
                    color: '#F3F0E8',
                    fontSize: '12px',
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <Bar dataKey="amount" radius={[2, 2, 0, 0]}>
                  {financialWaterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* =====================================================================
          4. PERFORMANCE ANALYSIS & CATEGORY BREAKDOWN
          ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#171B18]" />
            <h2 className="font-display font-extrabold text-xl text-[#171B18] tracking-tight">
              Threat Category Performance
            </h2>
          </div>
          <span className="text-xs font-mono text-[#777A73]">
            Detection Accuracy by Attack Vector
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Category Bar Chart (Recharts) */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-5 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-bold block">
              Encounter Accuracy Rate (%)
            </span>

            {categoryChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={categoryChartData}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 10, fontFamily: 'Inter', fill: '#171B18' }}
                      width={120}
                    />
                    <Tooltip
                      formatter={(val, name, item) => [
                        `${val}% Accuracy (${item.payload.correct}/${item.payload.encountered} correct)`,
                        'Performance',
                      ]}
                      contentStyle={{
                        backgroundColor: '#171B18',
                        borderColor: '#333C36',
                        color: '#F3F0E8',
                        fontSize: '12px',
                        fontFamily: 'IBM Plex Mono',
                      }}
                    />
                    <Bar dataKey="accuracy" radius={[0, 2, 2, 0]}>
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-[#777A73]">
                No specific category encounters logged.
              </div>
            )}
          </div>

          {/* Category Intelligence Dossier */}
          <div className="lg:col-span-5 space-y-4">
            {/* Strongest Category Card */}
            {strongestCategory && (
              <div className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#688537] font-bold block">
                  Strongest Defense Category
                </span>
                <div className="font-display font-bold text-base text-[#171B18]">
                  {strongestCategory.scam_type.replace(/_/g, ' ')}
                </div>
                <div className="text-xs font-mono text-[#777A73]">
                  Accuracy: <span className="font-bold text-[#688537]">{strongestCategory.accuracy_percentage}%</span> ({strongestCategory.correctly_identified}/{strongestCategory.times_encountered} spotted)
                </div>
              </div>
            )}

            {/* Weakest Category Card */}
            {weakestCategory && (
              <div className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D96B59] font-bold block">
                  Primary Vulnerability Area
                </span>
                <div className="font-display font-bold text-base text-[#171B18]">
                  {weakestCategory.scam_type.replace(/_/g, ' ')}
                </div>
                <div className="text-xs font-mono text-[#777A73]">
                  Accuracy: <span className="font-bold text-[#D96B59]">{weakestCategory.accuracy_percentage}%</span> ({weakestCategory.mistakes} mistakes made)
                </div>
              </div>
            )}

            {/* Performance Summary Pill */}
            <div className="p-4 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#171B18] font-bold block">
                Decision Accuracy Ratio
              </span>
              <p className="text-xs font-sans text-[#40443E] leading-relaxed">
                You made <strong className="text-[#171B18]">{correct_decisions} correct choices</strong> out of {total_scenarios_faced} scenarios, suffering {total_scenarios_faced - correct_decisions} fraudulent breaches.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================================
          5. AI COACH REPORT (GEMINI FORENSIC ANALYSIS & ACTIONABLE HABITS)
          ===================================================================== */}
      {ai_coach_report && (
        <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCD6C7] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B08930]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#171B18]">
                  AI FINANCIAL COACH REPORT
                </span>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-[#171B18]">
                Personalized Cyber Defense Assessment
              </h3>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-[#777A73] uppercase tracking-wider block">
                Assigned Defense Grade
              </span>
              <span className="font-mono font-bold text-lg text-[#171B18]">
                {ai_coach_report.grade || 'Certified Survivor'}
              </span>
            </div>
          </div>

          {/* Coach Narrative Summary */}
          <div className="p-4 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] space-y-1 text-sm font-sans text-[#171B18] leading-relaxed">
            <p>{ai_coach_report.summary}</p>
          </div>

          {/* Strengths & Vulnerabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Strengths */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#688537] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#688537]" />
                <span>Demonstrated Strengths</span>
              </span>
              <ul className="space-y-1.5">
                {ai_coach_report.strengths?.map((str, idx) => (
                  <li key={idx} className="p-2.5 rounded-sm bg-[#F3F0E8] text-xs font-sans text-[#171B18] flex items-start gap-2">
                    <span className="text-[#688537] font-bold mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vulnerabilities / Common Mistakes */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#D96B59] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D96B59]" />
                <span>Common Vulnerabilities</span>
              </span>
              <ul className="space-y-1.5">
                {ai_coach_report.top_vulnerabilities?.map((vuln, idx) => (
                  <li key={idx} className="p-2.5 rounded-sm bg-[#F3F0E8] text-xs font-sans text-[#171B18] flex items-start gap-2">
                    <span className="text-[#D96B59] font-bold mt-0.5">•</span>
                    <span>{vuln}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Actionable Defense Tips */}
          {ai_coach_report.actionable_tips && ai_coach_report.actionable_tips.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#DCD6C7]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#171B18] font-bold block">
                Recommended Real-World Improvements:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ai_coach_report.actionable_tips.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-sm bg-[#FAF5EB] border border-[#D7B66D]/40 text-xs font-sans text-[#171B18] flex items-start gap-2.5">
                    <ArrowRight className="w-3.5 h-3.5 text-[#B08930] mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Golden Habit Pull-quote */}
          <div className="p-4 rounded-sm bg-[#171B18] text-[#F3F0E8] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A6C66A] font-bold block">
              MEMORABLE SAFETY HABIT
            </span>
            <p className="text-xs sm:text-sm font-display font-medium text-[#F3F0E8] leading-relaxed">
              "Entering your UPI PIN always debits money from your account. You NEVER enter a PIN to receive, claim rewards, or accept refunds. When in doubt, dial 1930."
            </p>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. ACHIEVEMENTS UNLOCKED
          ===================================================================== */}
      {achievements && achievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#B08930]" />
            <h2 className="font-display font-extrabold text-xl text-[#171B18] tracking-tight">
              Simulation Achievements Unlocked
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className="p-4 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] shadow-sm flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#171B18] text-[#D7B66D] flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-display font-bold text-xs text-[#171B18] block leading-tight">
                    {ach.split(':')[0]}
                  </span>
                  <p className="text-[11px] font-sans text-[#777A73] leading-snug">
                    {ach.split(':')[1] || ach}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          7. ACTION CONTROLS (BOTTOM BAR)
          ===================================================================== */}
      <div className="p-6 rounded-sm bg-[#171B18] text-[#F3F0E8] border border-[#313932] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display font-bold text-base text-[#F3F0E8]">
            What would you like to do next?
          </h4>
          <p className="text-xs text-[#A3A69F]">
            Review your granular 30-day transaction ledger, or start a new simulation with a different persona.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
          {/* Action 1: Transaction Ledger */}
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/ledger')}
            className="border-[#313932] text-[#F3F0E8] hover:bg-[#252B26]"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            <span>Review Ledger</span>
          </Button>

          {/* Action 2: Return to Home */}
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/')}
            className="border-[#313932] text-[#F3F0E8] hover:bg-[#252B26]"
          >
            <Home className="w-4 h-4 mr-1.5" />
            <span>Return to Home</span>
          </Button>

          {/* Action 3: Play Again */}
          <Button
            variant="primary"
            size="md"
            onClick={handlePlayAgain}
            isLoading={isRestarting}
            className="bg-[#A6C66A] text-[#171B18] hover:bg-[#A6C66A]/90 font-bold px-6 shadow-md"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span>Play Again</span>
          </Button>
        </div>
      </div>

    </div>
  );
}

export default ReportPage;
