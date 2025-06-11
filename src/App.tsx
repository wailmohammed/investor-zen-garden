
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

// Protected route component - moved inside the AppRoutes to ensure it's used within AuthProvider
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

// AppRoutes component that contains all routes
// Now this is inside AuthProvider so useAuth is available
const AppRoutes = () => {
  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    return user ? <>{children}</> : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading, isAdmin } = useAuth();
    
    console.log("AdminRoute check - User:", user?.email, "IsAdmin:", isAdmin, "Loading:", isLoading);
    
    if (isLoading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!isAdmin) {
      console.log("Access denied: User is not an admin");
      return <Navigate to="/dashboard" />;
    }
    
    console.log("Admin access granted");
    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/portfolio" 
        element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/wallets" 
        element={
          <AdminRoute>
            <AdminWallets />
          </AdminRoute>
        } 
      />
      <Route
        path="/payment/crypto" 
        element={
          <ProtectedRoute>
            <CryptoPayment />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/email-notifications" 
        element={
          <ProtectedRoute>
            <EmailNotifications />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/tasks" 
        element={
          <AdminRoute>
            <Tasks />
          </AdminRoute>
        } 
      />
      <Route
        path="/brokers" 
        element={
          <ProtectedRoute>
            <BrokerIntegration />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/dividends" 
        element={
          <ProtectedRoute>
            <Dividends />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/dividend-stats" 
        element={
          <ProtectedRoute>
            <DividendStats />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/support" 
        element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
