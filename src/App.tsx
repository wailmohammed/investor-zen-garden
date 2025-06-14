
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import CryptoPayment from "./pages/CryptoPayment";
import EmailNotifications from "./pages/EmailNotifications";
import Tasks from "./pages/Tasks";
import BrokerIntegration from "./pages/BrokerIntegration";
import Dividends from "./pages/Dividends";
import DividendStats from "./pages/DividendStats";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import AdminWallets from "./pages/AdminWallets";
import Pricing from "./pages/Pricing";
import Portfolio from "./pages/Portfolio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="investorzen-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

const AppRoutes = () => {
  const { user, isLoading, isAdmin } = useAuth();
  
  console.log("AppRoutes - User:", user?.email, "Loading:", isLoading, "Admin:", isAdmin);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/pricing" element={<Pricing />} />
      
      {/* Auth routes - redirect to dashboard if already logged in */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />
      
      {/* Protected routes - redirect to login if not authenticated */}
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/portfolio" 
        element={user ? <Portfolio /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/payment/crypto" 
        element={user ? <CryptoPayment /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/email-notifications" 
        element={user ? <EmailNotifications /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/brokers" 
        element={user ? <BrokerIntegration /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/dividends" 
        element={user ? <Dividends /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/dividend-stats" 
        element={user ? <DividendStats /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/profile" 
        element={user ? <Profile /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/settings" 
        element={user ? <Settings /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/support" 
        element={user ? <Support /> : <Navigate to="/login" replace />} 
      />
      
      {/* Admin routes - require authentication and admin privileges */}
      <Route 
        path="/admin" 
        element={
          !user ? <Navigate to="/login" replace /> :
          !isAdmin ? <Navigate to="/dashboard" replace /> :
          <Admin />
        } 
      />
      <Route 
        path="/admin/wallets" 
        element={
          !user ? <Navigate to="/login" replace /> :
          !isAdmin ? <Navigate to="/dashboard" replace /> :
          <AdminWallets />
        } 
      />
      <Route
        path="/tasks" 
        element={
          !user ? <Navigate to="/login" replace /> :
          !isAdmin ? <Navigate to="/dashboard" replace /> :
          <Tasks />
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
