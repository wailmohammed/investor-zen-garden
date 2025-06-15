import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './contexts/AuthContext';
import Dividends from './pages/Dividends';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { DividendDataProvider } from "@/contexts/DividendDataContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryClient>
          <Toaster />
          <AuthProvider>
            <PortfolioProvider>
              <DividendDataProvider>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/dividends" element={<Dividends />} />
                </Routes>
              </DividendDataProvider>
            </PortfolioProvider>
          </AuthProvider>
        </QueryClient>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
