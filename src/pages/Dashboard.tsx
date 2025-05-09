
import DashboardLayout from "@/components/DashboardLayout";
import PortfolioSummary from "@/components/Dashboard/PortfolioSummary";
import TopHoldings from "@/components/Dashboard/TopHoldings";
import PerformanceChart from "@/components/Dashboard/PerformanceChart";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import AssetAllocation from "@/components/Dashboard/AssetAllocation";
import MarketOverview from "@/components/Dashboard/MarketOverview";
import AIChat from "@/components/AIChat";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your portfolio and market insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PortfolioSummary />
          <TopHoldings />
          <AssetAllocation />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketOverview />
          <AIChat />  {/* Add the AI Chat component */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
