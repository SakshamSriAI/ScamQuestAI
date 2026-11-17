import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from '@/context/GameContext';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlayPage } from '@/pages/PlayPage';
import { ScanPage } from '@/pages/ScanPage';
import { LedgerPage } from '@/pages/LedgerPage';
import { ReportPage } from '@/pages/ReportPage';

export function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="play" element={<PlayPage />} />
            <Route path="scan" element={<ScanPage />} />
            <Route path="ledger" element={<LedgerPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;
