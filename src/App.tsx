
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/contexts/ThemeContext"
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './contexts/AuthContext';
import Dividends from './pages/Dividends';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { DividendDataProvider } from "@/contexts/DividendDataContext";
import DividendStats from './pages/DividendStats';
import Index from './pages/Index';
import BrokerIntegration from './pages/BrokerIntegration';

// Create QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <AuthProvider>
            <PortfolioProvider>
              <DividendDataProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/dividends" element={<Dividends />} />
                  <Route path="/dividend-stats" element={<DividendStats />} />
                  <Route path="/brokers" element={<BrokerIntegration />} />
                </Routes>
              </DividendDataProvider>
            </PortfolioProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
