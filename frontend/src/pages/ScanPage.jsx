import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ScanSearch,
  CheckCircle2,
  ArrowRight,
  X,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  Info,
  Lock,
  Terminal,
  Activity,
  FileSearch,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getScamTypeMeta } from '@/utils/formatters';

const MAX_CHAR_LIMIT = 1000;
const MIN_CHAR_LIMIT = 5;

const PRESET_EXAMPLES = [
  {
    label: 'UPI Collect Trap',
    category: 'UPI Fraud',
    text: 'Bhaiya galti se aapke UPI par ₹2,000 transfer ho gaye hain. Please meri behen ki dawai ke liye refund kar do. Maine Google Pay par collect request bheji hai, bas accept kar lo.',
  },
  {
    label: 'Fake Electricity Cutoff',
    category: 'Urgent Threat',
    text: 'Priye upbhokta, aapka bijli bill pending hai. Aaj raat 9:30 baje bijli disconnect kar di jayegi. Turant bijli adhikari Sharma ji se 9823412345 par sampark karein.',
  },
  {
    label: 'SBI KYC APK Phishing',
    category: 'Malicious File',
    text: 'Dear customer, your SBI YONO account will be blocked today due to pending KYC update. Click here to update pan immediately: http://sbi-kyc-update.apk',
  },
  {
    label: 'Work From Home Trap',
    category: 'Task Scam',
    text: 'Earn Rs 3000 to 8000 daily by simply liking YouTube videos and rating Google hotels! Work 30 mins from home. Contact HR Sneha on Telegram: @parttime_india_jobs',
  },
  {
    label: 'Standard Bank Transaction',
    category: 'Legitimate Notice',
    text: 'Paid Rs 320 to Fresh Groceries Store via UPI Ref 430129482910 on 05-Nov-24 18:22:10. Updated ICICI A/c Bal is Rs 18,400. - ICICI Bank',
  },
];

export function ScanPage() {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const resultsRef = useRef(null);
  const textareaRef = useRef(null);

  // Cycle loading analysis steps for a high-tech forensic experience
  useEffect(() => {
    let interval;
    if (isScanning) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleClear = () => {
    setInputText('');
    setScanResult(null);
    setScanError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectPreset = (text) => {
    setInputText(text);
    setScanError(null);
    setScanResult(null);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();

    // Client-side validations
    if (!trimmed) {
      setScanError('Please enter a message to begin the security investigation.');
      return;
    }

    if (trimmed.length < MIN_CHAR_LIMIT) {
      setScanError(`Message is too short. Please provide at least ${MIN_CHAR_LIMIT} characters to analyze.`);
      return;
    }

    if (trimmed.length > MAX_CHAR_LIMIT) {
      setScanError(`Message exceeds the maximum limit of ${MAX_CHAR_LIMIT} characters (currently ${trimmed.length}).`);
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const result = await api.scanMessage(trimmed);
      if (!result || typeof result.risk_score !== 'number') {
        throw new Error('Received an unparseable response from forensic scanner.');
      }
      setScanResult(result);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setScanError(
        err.message ||
          'Forensic analysis service is currently unavailable. Please verify the backend server is active.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Determine styling, badge, and copy based on risk score & verdict
  const getVerdictMetadata = (verdict, score) => {
    if (verdict === 'DANGER_HIGH_CONFIDENCE' || score >= 65) {
      return {
        level: 'HIGH_RISK',
        headline: 'Critical Fraud Indicators Detected',
        subtext: 'High probability of financial theft, phishing, or credential harvesting.',
        themeColor: '#D96B59',
        badgeBg: 'bg-[#D96B59]/15 text-[#D96B59] border-[#D96B59]/40',
        cardBg: 'bg-[#2A1D1C] border-[#D96B59]',
        icon: ShieldAlert,
        progressColor: 'bg-[#D96B59]',
        tag: 'DANGER',
      };
    }

    if (verdict === 'SUSPICIOUS_PROCEED_WITH_CAUTION' || score >= 30) {
      return {
        level: 'SUSPICIOUS',
        headline: 'Suspicious Patterns — Proceed With Caution',
        subtext: 'Contains urgency cues, unverified routing, or unusual financial requests.',
        themeColor: '#D7B66D',
        badgeBg: 'bg-[#D7B66D]/15 text-[#D7B66D] border-[#D7B66D]/40',
        cardBg: 'bg-[#282319] border-[#D7B66D]',
        icon: AlertTriangle,
        progressColor: 'bg-[#D7B66D]',
        tag: 'CAUTION',
      };
    }

    return {
      level: 'LOW_RISK',
      headline: 'Low Risk — Unverified Content',
      subtext: 'No overt high-risk flags detected. Genuine senders never demand PINs, OTPs, or passwords.',
      themeColor: '#A6C66A',
      badgeBg: 'bg-[#A6C66A]/15 text-[#A6C66A] border-[#A6C66A]/40',
      cardBg: 'bg-[#1F2620] border-[#A6C66A]',
      icon: ShieldCheck,
      progressColor: 'bg-[#A6C66A]',
      tag: 'UNVERIFIED',
    };
  };

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;
  const isValidLength = charCount >= MIN_CHAR_LIMIT && !isOverLimit;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* =====================================================================
          HEADER SECTION (TRUSTWORTHY, EDITORIAL SECURITY INTERFACE)
          ===================================================================== */}
      <div className="border-b border-[#DCD6C7] pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-sm bg-[#171B18] text-[#F3F0E8] font-mono text-[10px] uppercase font-bold tracking-wider">
            FORENSIC LAB • SCAN MODE
          </span>
          <span className="text-xs font-mono text-[#777A73]">
            Rule Engine + Gemini Threat Analysis
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#171B18] tracking-tight">
          Not sure if it's a scam? Let's investigate.
        </h1>

        <p className="text-sm sm:text-base text-[#777A73] leading-relaxed max-w-2xl font-sans">
          Paste a suspicious message. We'll help you understand the warning signs.
        </p>
      </div>

      {/* =====================================================================
          INPUT AREA: TEXTAREA, COUNTER, CLEAR & ANALYZE ACTIONS
          ===================================================================== */}
      <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-5 sm:p-6 shadow-sm space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="scan-input"
                className="text-xs font-mono font-bold uppercase tracking-wider text-[#171B18] flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-[#777A73]" />
                <span>Message Content to Inspect</span>
              </label>

              {/* Character Counter */}
              <span
                className={`text-xs font-mono ${
                  isOverLimit
                    ? 'text-[#D96B59] font-bold'
                    : charCount > 800
                    ? 'text-[#D7B66D]'
                    : 'text-[#777A73]'
                }`}
              >
                {charCount} / {MAX_CHAR_LIMIT} characters
              </span>
            </div>

            <div className="relative">
              <textarea
                id="scan-input"
                ref={textareaRef}
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste raw SMS, WhatsApp notice, or payment alert here... (e.g. 'Your SBI YONO account will be blocked today due to pending KYC update...')"
                className={`w-full p-4 bg-[#F3F0E8] border rounded-sm text-sm text-[#171B18] font-mono placeholder:font-sans placeholder:text-[#A3A69F] focus:outline-none transition-colors resize-y leading-relaxed ${
                  isOverLimit
                    ? 'border-[#D96B59] focus:border-[#D96B59]'
                    : 'border-[#DCD6C7] focus:border-[#171B18]'
                }`}
              />

              {/* Floating Clear Button if text present */}
              {inputText.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute top-3 right-3 p-1.5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] hover:bg-[#F3F0E8] text-[#777A73] hover:text-[#171B18] transition-colors"
                  title="Clear Input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Preset Example Quick Fillers */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-mono text-[#777A73] uppercase tracking-wider block">
              Sample Encounters (Click to load):
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => handleSelectPreset(ex.text)}
                  className="text-xs font-mono px-2.5 py-1 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] hover:border-[#171B18] text-[#40443E] hover:text-[#171B18] transition-all text-left flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#171B18]" />
                  <span>{ex.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Note & Primary Analyze CTA */}
          <div className="pt-3 border-t border-[#DCD6C7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#777A73]">
              <Lock className="w-3.5 h-3.5 text-[#777A73] flex-shrink-0" />
              <span>Zero-Storage Guarantee: Pasted text is processed in memory and never saved.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {inputText.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleClear}
                  className="border-[#DCD6C7] text-[#777A73] hover:text-[#171B18]"
                >
                  Clear
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isScanning}
                disabled={!isValidLength || isScanning}
                className="w-full sm:w-auto bg-[#171B18] text-[#F3F0E8] hover:bg-[#2A312B] font-bold px-6 shadow-sm"
              >
                <ScanSearch className="w-4 h-4 mr-2" />
                <span>Analyze Message</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* =====================================================================
          ERROR DISPLAY
          ===================================================================== */}
      {scanError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-sm bg-[#D96B59]/10 border border-[#D96B59]/40 text-[#D96B59] text-xs font-mono flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <span className="font-bold block uppercase tracking-wider">Analysis Blocked</span>
            <span>{scanError}</span>
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          POLISHED LOADING STATE
          ===================================================================== */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#171B18] text-[#F3F0E8] border border-[#313932] rounded-sm p-8 text-center space-y-6 shadow-xl"
        >
          <div className="relative w-16 h-16 mx-auto">
            {/* Pulsing Scanner Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-[#A6C66A] animate-ping opacity-40" />
            <div className="absolute inset-0 rounded-full border border-[#D7B66D] animate-spin opacity-70" />
            <div className="w-16 h-16 rounded-full bg-[#1F2420] border border-[#313932] flex items-center justify-center text-[#A6C66A]">
              <ScanSearch className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-display font-bold text-lg text-[#F3F0E8]">
              Conducting Forensic Inspection
            </h3>
            <p className="text-xs font-mono text-[#A3A69F]">
              {loadingStep === 0 && 'Executing deterministic rule engine and extracting URL signatures...'}
              {loadingStep === 1 && 'Scanning psychological urgency cues and UPI collect mechanics...'}
              {loadingStep === 2 && 'Synthesizing Gemini financial safety assessment & red flags...'}
            </p>
          </div>

          <div className="w-48 h-1 bg-[#282F2A] rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-[#A6C66A]"
              initial={{ width: '15%' }}
              animate={{ width: loadingStep === 0 ? '40%' : loadingStep === 1 ? '75%' : '95%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* =====================================================================
          ANALYSIS RESULTS (RESTRAINED, PROFESSIONAL SECURITY DOSSIER)
          ===================================================================== */}
      {scanResult && !isScanning && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {(() => {
            const meta = getVerdictMetadata(scanResult.verdict, scanResult.risk_score);
            const Icon = meta.icon;
            const categoryMeta = getScamTypeMeta(scanResult.scam_category);

            return (
              <div className="bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm overflow-hidden shadow-sm space-y-6 p-6 sm:p-8">
                
                {/* 1. TOP RESULT BANNER */}
                <div className={`p-5 rounded-sm border ${meta.cardBg} text-[#F3F0E8] flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#171B18]/60 border border-white/10 flex items-center justify-center flex-shrink-0" style={{ color: meta.themeColor }}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border ${meta.badgeBg}`}>
                          {meta.tag}
                        </span>
                        <span className="text-xs font-mono text-[#A3A69F]">
                          Category: {categoryMeta.label}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#F3F0E8]">
                        {meta.headline}
                      </h2>

                      <p className="text-xs font-sans text-[#DCD6C7] leading-relaxed">
                        {meta.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Risk Score Meter */}
                  <div className="flex-shrink-0 bg-[#171B18] border border-white/10 rounded-sm p-4 text-center min-w-[140px]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#A3A69F] block mb-1">
                      Fraud Risk Score
                    </span>
                    <div className="text-3xl font-mono font-bold" style={{ color: meta.themeColor }}>
                      {scanResult.risk_score}
                      <span className="text-xs font-normal text-[#777A73]">/100</span>
                    </div>

                    {/* Miniature score bar */}
                    <div className="w-full h-1.5 bg-[#252B26] rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${meta.progressColor}`}
                        style={{ width: `${Math.max(5, scanResult.risk_score)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. FORENSIC EXPLANATION */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-bold block">
                    Forensic Explanation
                  </span>
                  <p className="text-sm sm:text-base text-[#171B18] font-sans leading-relaxed p-4 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7]">
                    {scanResult.explanation}
                  </p>
                </div>

                {/* 3. DETECTED RED FLAGS & TACTICS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Heuristic Rule Flags */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-bold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#171B18]" />
                      <span>Heuristic Indicators Triggered ({scanResult.rule_flags?.length || 0})</span>
                    </span>

                    {scanResult.rule_flags && scanResult.rule_flags.length > 0 ? (
                      <ul className="space-y-2">
                        {scanResult.rule_flags.map((flag, idx) => (
                          <li
                            key={idx}
                            className="p-2.5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] text-xs font-mono text-[#171B18] flex items-start gap-2"
                          >
                            <span className="text-[#D96B59] font-bold mt-0.5">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] text-xs font-mono text-[#777A73]">
                        No blacklisted APKs, fake shortcodes, or raw IP redirects identified in deterministic heuristics.
                      </div>
                    )}
                  </div>

                  {/* Social Engineering Tactics */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#777A73] font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#171B18]" />
                      <span>Detected Psychological Tactics</span>
                    </span>

                    {scanResult.detected_tactics && scanResult.detected_tactics.length > 0 ? (
                      <ul className="space-y-2">
                        {scanResult.detected_tactics.map((tactic, idx) => (
                          <li
                            key={idx}
                            className="p-2.5 rounded-sm bg-[#FFFFFF] border border-[#DCD6C7] text-xs font-mono text-[#171B18] flex items-start gap-2"
                          >
                            <span className="text-[#D7B66D] font-bold mt-0.5">•</span>
                            <span>{tactic}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-3 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] text-xs font-mono text-[#777A73]">
                        No overt social engineering pressure patterns identified.
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. RECOMMENDED SAFE ACTIONS */}
                {scanResult.actionable_steps && scanResult.actionable_steps.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#DCD6C7]">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#171B18] font-bold block">
                      Recommended Real-Life Actions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {scanResult.actionable_steps.map((action, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-sm bg-[#F3F0E8] border border-[#DCD6C7] flex items-start gap-2.5 text-xs font-sans text-[#171B18]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#688537] mt-0.5 flex-shrink-0" />
                          <span className="font-medium leading-relaxed">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. MANDATORY STATUTORY DISCLAIMER (EXACT REQUIREMENT) */}
                <div className="p-4 rounded-sm bg-[#F3F0E8] border-l-4 border-[#171B18] border border-[#DCD6C7] space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171B18] block">
                    Important Advisory Disclaimer
                  </span>
                  <p className="text-xs font-sans text-[#5A5E57] leading-relaxed">
                    ScamQuest provides educational risk assessments, not official verification of financial messages. When in doubt, independently contact the organization using its official contact details.
                  </p>
                </div>

                {/* Action Buttons to restart / scan another */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] font-mono text-[#777A73]">
                    Inspection Complete • Result Generated
                  </span>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleClear}
                    className="w-full sm:w-auto border-[#171B18] text-[#171B18] hover:bg-[#F3F0E8]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    <span>Scan Another Message</span>
                  </Button>
                </div>

              </div>
            );
          })()}
        </motion.div>
      )}

      {/* =====================================================================
          EDUCATIONAL SAFETY FIELD GUIDE (FOOTER CARD)
          ===================================================================== */}
      <div className="p-6 rounded-sm bg-[#171B18] text-[#F3F0E8] border border-[#313932] space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#A6C66A]" />
          <h3 className="font-display font-bold text-base text-[#F3F0E8]">
            Standard Verification Rules for Indian Financial Traffic
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-[#A3A69F]">
          <div className="space-y-1.5 p-3 rounded-sm bg-[#1F2420] border border-[#2B322D]">
            <span className="font-mono font-bold text-[#F3F0E8] block text-[11px]">
              1. Senders & Shortcodes
            </span>
            <p className="leading-relaxed">
              Legitimate bank alerts originate from 2-letter TRAI alphanumeric sender IDs (e.g. <code className="font-mono text-[#A6C66A]">AX-HDFCBK</code>). Messages from 10-digit mobile numbers are unauthorized.
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-sm bg-[#1F2420] border border-[#2B322D]">
            <span className="font-mono font-bold text-[#F3F0E8] block text-[11px]">
              2. UPI Collect Requests
            </span>
            <p className="leading-relaxed">
              Entering your UPI PIN always debits money from your account. You NEVER enter a PIN to receive money, win cashback, or accept refunds.
            </p>
          </div>

          <div className="space-y-1.5 p-3 rounded-sm bg-[#1F2420] border border-[#2B322D]">
            <span className="font-mono font-bold text-[#F3F0E8] block text-[11px]">
              3. Official Helpline 1930
            </span>
            <p className="leading-relaxed">
              If you have fallen for financial fraud or sent funds to a scammer, report it immediately to the National Cybercrime Reporting Portal or call 1930 within the golden hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
