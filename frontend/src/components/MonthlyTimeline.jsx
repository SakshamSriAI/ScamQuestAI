import React from 'react';
import { Calendar, CheckCircle2, Clock, Wallet, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const MONTH_EVENTS = [
  { day: 1, title: 'Salary Credit', amount: 50000, type: 'salary', category: 'SALARY', desc: 'Starting liquid deposit credited' },
  { day: 3, title: 'Apartment Rent', amount: -12000, type: 'expense', category: 'ROUTINE_EXPENSE', desc: 'Monthly housing auto-debit' },
  { day: 7, title: 'Index SIP', amount: -5000, type: 'investment', category: 'SIP_INVESTMENT', desc: 'Simulated wealth allocation' },
  { day: 12, title: 'Groceries', amount: -3500, type: 'expense', category: 'ROUTINE_EXPENSE', desc: 'Pantry provisions & essentials' },
  { day: 16, title: 'Electricity Bill', amount: -1200, type: 'expense', category: 'ROUTINE_EXPENSE', desc: 'Official power discom utility' },
  { day: 20, title: 'Broadband', amount: -800, type: 'expense', category: 'ROUTINE_EXPENSE', desc: 'Fiber internet renewal' },
  { day: 25, title: 'Dining & Leisure', amount: -1500, type: 'expense', category: 'ROUTINE_EXPENSE', desc: 'Weekend recreation' },
  { day: 30, title: 'Month Audit', amount: 0, type: 'audit', category: 'AUDIT', desc: 'Final financial survival review' },
];

export function MonthlyTimeline({ currentDay = 1, isCompleted = false }) {
  const getEventStatus = (eventDay) => {
    if (isCompleted || currentDay > eventDay) return 'completed';
    if (currentDay === eventDay) return 'active';
    return 'upcoming';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#A6C66A]" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#171B18]">
            Monthly Financial Trajectory
          </span>
        </div>
        <span className="text-xs font-mono text-[#777A73]">
          Day {currentDay} of 30 {isCompleted && '• Completed'}
        </span>
      </div>

      {/* Desktop Horizontal Timeline */}
      <div className="hidden lg:block bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-5 shadow-sm overflow-x-auto">
        <div className="relative flex items-start justify-between min-w-[720px] pt-2 pb-4">
          
          {/* Horizontal Track Line */}
          <div className="absolute top-6 left-6 right-6 h-[2px] bg-[#DCD6C7] z-0" />
          
          {MONTH_EVENTS.map((event) => {
            const status = getEventStatus(event.day);
            const isSalary = event.type === 'salary';
            const isSIP = event.type === 'investment';
            const isAudit = event.type === 'audit';

            return (
              <div key={event.day} className="relative z-10 flex flex-col items-center text-center w-24">
                
                {/* Node Dot / Marker */}
                <div
                  className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-all duration-200
                    ${
                      status === 'completed'
                        ? 'bg-[#171B18] border-[#171B18] text-[#A6C66A]'
                        : status === 'active'
                        ? 'bg-[#A6C66A] border-[#171B18] text-[#171B18] shadow-md ring-4 ring-[#A6C66A]/20 scale-110'
                        : 'bg-[#F3F0E8] border-[#DCD6C7] text-[#777A73]'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span>D{event.day}</span>
                  )}
                </div>

                {/* Event Details */}
                <div className="mt-2.5 space-y-0.5">
                  <span className={`text-[11px] font-display font-semibold block leading-tight ${
                    status === 'active' ? 'text-[#171B18] font-bold' : 'text-[#777A73]'
                  }`}>
                    {event.title}
                  </span>
                  
                  <span
                    className={`text-[10px] font-mono font-medium block ${
                      isSalary
                        ? 'text-[#688537]'
                        : isSIP
                        ? 'text-[#171B18]'
                        : isAudit
                        ? 'text-[#D7B66D]'
                        : 'text-[#D96B59]'
                    }`}
                  >
                    {isAudit ? 'Review' : formatCurrency(event.amount)}
                  </span>
                </div>

                {/* Status Pill for Active Today */}
                {status === 'active' && (
                  <span className="mt-1 px-1.5 py-0.5 rounded-sm bg-[#171B18] text-[#A6C66A] text-[9px] font-mono uppercase tracking-wider font-bold">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Vertical Timeline */}
      <div className="lg:hidden bg-[#FFFFFF] border border-[#DCD6C7] rounded-sm p-4 space-y-3">
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#DCD6C7]">
          {MONTH_EVENTS.map((event) => {
            const status = getEventStatus(event.day);
            const isSalary = event.type === 'salary';
            const isSIP = event.type === 'investment';
            const isAudit = event.type === 'audit';

            return (
              <div key={event.day} className="relative flex items-start justify-between gap-3 text-left">
                {/* Status indicator pip */}
                <div
                  className={`
                    absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold
                    ${
                      status === 'completed'
                        ? 'bg-[#171B18] border-[#171B18] text-[#A6C66A]'
                        : status === 'active'
                        ? 'bg-[#A6C66A] border-[#171B18] text-[#171B18] ring-2 ring-[#A6C66A]/30'
                        : 'bg-[#F3F0E8] border-[#DCD6C7] text-[#777A73]'
                    }
                  `}
                >
                  {status === 'completed' ? '✓' : event.day}
                </div>

                <div className="space-y-0.5 pl-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-xs text-[#171B18]">
                      Day {event.day}: {event.title}
                    </span>
                    {status === 'active' && (
                      <span className="px-1.5 py-0.2 rounded-sm bg-[#171B18] text-[#A6C66A] text-[9px] font-mono font-bold">
                        TODAY
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#777A73] block">{event.desc}</span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSalary
                        ? 'text-[#688537]'
                        : isSIP
                        ? 'text-[#171B18]'
                        : isAudit
                        ? 'text-[#D7B66D]'
                        : 'text-[#D96B59]'
                    }`}
                  >
                    {isAudit ? 'Audit' : formatCurrency(event.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
