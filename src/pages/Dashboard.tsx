
import DashboardLayout from "@/components/DashboardLayout";
import EnhancedDashboard from "@/components/Dashboard/EnhancedDashboard";
import AIChat from "@/components/AIChat";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";

const Dashboard = () => {
  const { user } = useAuth();

  console.log("Dashboard - Rendering for user:", user?.email);

  return (
    <PortfolioProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your portfolio and market insights</p>
          </div>

          <EnhancedDashboard />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIChat />
          </div>
        </div>
      </DashboardLayout>
    </PortfolioProvider>
  );
};

export default Dashboard;
