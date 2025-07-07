
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
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrokerIntegration from './pages/BrokerIntegration';
import CryptoPayment from './pages/CryptoPayment';
import Profile from './pages/Profile';
import Support from './pages/Support';

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
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/dividends" element={<Dividends />} />
                  <Route path="/dividend-stats" element={<DividendStats />} />
                  <Route path="/brokers" element={<BrokerIntegration />} />
                  <Route path="/payment/crypto" element={<CryptoPayment />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/support" element={<Support />} />
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
