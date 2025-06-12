
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
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading your portfolio...</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading dashboard...</div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
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
