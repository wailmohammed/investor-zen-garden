
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/contexts/ThemeContext"

import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Dividends from './pages/Dividends';
import DividendStats from './pages/DividendStats';
import StockScreening from './pages/StockScreening';
import BrokerIntegration from './pages/BrokerIntegration';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Support from './pages/Support';
import Admin from './pages/Admin';
import AdminWallets from './pages/AdminWallets';
import Tasks from './pages/Tasks';
import EmailNotifications from './pages/EmailNotifications';
import CryptoPayment from './pages/CryptoPayment';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { TooltipProvider } from "@/components/ui/tooltip"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/dividends" element={<Dividends />} />
                <Route path="/dividend-stats" element={<DividendStats />} />
                <Route path="/stock-screening" element={<StockScreening />} />
                <Route path="/broker-integration" element={<BrokerIntegration />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/support" element={<Support />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/wallets" element={<AdminWallets />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/email-notifications" element={<EmailNotifications />} />
                <Route path="/crypto-payment" element={<CryptoPayment />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
