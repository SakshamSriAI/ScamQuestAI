import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ScanSearch, Compass, Activity, RotateCcw, Smartphone, Award, Home } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function RootLayout() {
  const location = useLocation();
  const { gameState, serverHealth, clearSession } = useGame();

  const isServerHealthy = serverHealth?.status === 'healthy';

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    ...(gameState ? [{ label: 'Command Center', path: '/dashboard', icon: Compass }] : []),
    ...(gameState && !gameState.is_completed ? [{ label: 'Live Simulation', path: '/play', icon: Smartphone }] : []),
    ...(gameState?.is_completed ? [{ label: 'Audit Report', path: '/report', icon: Award }] : []),
    { label: 'Scan Mode', path: '/scan', icon: ScanSearch },
    { label: 'Ledger', path: '/ledger', icon: Activity },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-sage-light selection:text-sage-dark font-sans">
      {/* Top Editorial Nav Header */}
      <header className="border-b border-paper-border bg-paper-surface/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand & Theme Header */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-sm bg-ink flex items-center justify-center text-paper group-hover:bg-sage transition-colors duration-150">
              <ShieldAlert className="w-4 h-4 text-paper" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-ink block leading-none">
                ScamQuest
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">
                Financial Literacy Simulator
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 border border-paper-border rounded-sm p-1 bg-paper-warm/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium tracking-tight transition-all duration-150
                    ${
                      isActive
                        ? 'bg-paper-surface text-ink shadow-paper-sm font-semibold'
                        : 'text-ink-muted hover:text-ink hover:bg-paper-surface/50'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Group */}
          <div className="flex items-center gap-3">
            {/* Backend connectivity indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isServerHealthy ? 'bg-sage animate-pulse' : 'bg-terracotta'
                }`}
              />
              <span className="text-[11px] font-mono text-ink-muted">
                {isServerHealthy ? 'API Active' : 'API Offline'}
              </span>
            </div>

            {/* Quick Session Indicator / Reset button */}
            {gameState && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSession}
                className="text-xs text-ink-muted hover:text-terracotta"
                title="Exit Current Session"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">New Run</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex border-t border-paper-border px-4 py-2 gap-1 bg-paper-warm/30 justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors
                  ${isActive ? 'bg-ink text-paper' : 'text-ink-muted'}
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        <Outlet />
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-paper-border bg-paper-warm/40 py-6 text-xs text-ink-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-ink">ScamQuest</span>
            <span>—</span>
            <span>Built for Arthathon (AI for Finance)</span>
          </div>
          <div className="font-mono text-[11px] text-ink-faint">
            Strictly fictional simulation. No real money or banking transactions.
          </div>
        </div>
      </footer>
    </div>
  );
}
