import React, { useEffect, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, ShieldCheck, Wallet, PiggyBank } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';

export function LedgerPage() {
  const { sessionId, gameState } = useGame();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (sessionId) {
      setIsLoading(true);
      // Fetch full report or read transactions
      api.getMonthEndReport(sessionId)
        .then((rep) => {
          if (mounted && rep?.transactions) setTransactions(rep.transactions);
        })
        .catch(() => {
          // If month not complete yet, we can display transactions count from gameState
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    }
    return () => { mounted = false; };
  }, [sessionId]);

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'SALARY':
        return <Badge variant="sage">Salary Credit</Badge>;
      case 'SIP_INVESTMENT':
        return <Badge variant="ink">SIP Asset</Badge>;
      case 'SCAM_LOSS':
        return <Badge variant="terracotta">Scam Loss</Badge>;
      case 'SCAM_PROTECTED':
        return <Badge variant="gold">Scam Blocked</Badge>;
      case 'ROUTINE_EXPENSE':
      default:
        return <Badge variant="neutral">Living Expense</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-paper-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral">Financial Ledger</Badge>
            <span className="text-xs font-mono text-ink-muted">All entries strictly simulated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            Monthly Transaction Audit
          </h1>
        </div>

        {gameState && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase text-ink-muted block">Available Cash</span>
              <span className="text-base font-numeric font-bold text-ink">{formatCurrency(gameState.balance)}</span>
            </div>
            <div className="text-right border-l border-paper-border pl-3">
              <span className="text-[11px] font-mono uppercase text-ink-muted block">Net Worth</span>
              <span className="text-base font-numeric font-bold text-sage-dark">{formatCurrency(gameState.net_worth)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table / List */}
      <Card className="p-0 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-ink-muted">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">
              {sessionId ? 'Transactions will compile as you progress through days.' : 'No active game session found. Start a run on the Simulation tab.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-paper-border">
            {transactions.map((tx) => {
              const isCredit = tx.amount > 0;
              const isProtected = tx.category === 'SCAM_PROTECTED';

              return (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-4 hover:bg-paper-warm/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-ink-faint">Day {tx.day}</span>
                      {getCategoryBadge(tx.category)}
                      <span className="font-serif font-semibold text-sm text-ink">{tx.title}</span>
                    </div>
                    <p className="text-xs text-ink-muted font-sans pl-1">{tx.description}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`font-numeric font-semibold text-sm ${
                      isProtected ? 'text-gold font-mono' : isCredit ? 'text-sage-dark' : 'text-ink'
                    }`}>
                      {isProtected ? 'Protected' : formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[11px] font-mono text-ink-faint">
                      Bal: {formatCurrency(tx.balance_after)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
