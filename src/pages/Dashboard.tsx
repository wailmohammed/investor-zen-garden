
import DashboardLayout from "@/components/DashboardLayout";
import PortfolioSummary from "@/components/Dashboard/PortfolioSummary";
import TopHoldings from "@/components/Dashboard/TopHoldings";
import PerformanceChart from "@/components/Dashboard/PerformanceChart";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import AssetAllocation from "@/components/Dashboard/AssetAllocation";
import MarketOverview from "@/components/Dashboard/MarketOverview";
import AIChat from "@/components/AIChat";
import DividendTracking from "@/components/Dashboard/DividendTracking";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  console.log("Dashboard - User:", user?.id, "Loading:", isLoading);

  if (isLoading) {
    console.log("Dashboard showing loading state");
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    console.log("Dashboard - No user found");
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Please log in to view your dashboard</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  console.log("Dashboard - Rendering main content for user:", user.email);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your portfolio and market insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioSummary />
          <AssetAllocation />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TopHoldings />
          </div>
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DividendTracking />
          <AIChat />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <MarketOverview />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
