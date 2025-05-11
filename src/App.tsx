
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
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
        path="/admin" 
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
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
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
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
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
