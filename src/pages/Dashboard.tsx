
import DashboardLayout from "@/components/DashboardLayout";
import PortfolioSummary from "@/components/Dashboard/PortfolioSummary";
import TopHoldings from "@/components/Dashboard/TopHoldings";
import PerformanceChart from "@/components/Dashboard/PerformanceChart";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import AssetAllocation from "@/components/Dashboard/AssetAllocation";
import MarketOverview from "@/components/Dashboard/MarketOverview";
import AIChat from "@/components/AIChat";
import DividendTracking from "@/components/Dashboard/DividendTracking";
import DataSourceIndicator from "@/components/Dashboard/DataSourceIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioProvider, usePortfolio } from "@/contexts/PortfolioContext";

const DashboardContent = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();

  console.log("Dashboard - Rendering for user:", user?.email);

  // Determine data source
  const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
  const isTrading212Connected = selectedPortfolio === trading212PortfolioId;
  const dataSource = isTrading212Connected ? 'Trading212' : 'Mock';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your portfolio and market insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioSummary />
          </div>
          <div>
            <DataSourceIndicator 
              isConnected={isTrading212Connected}
              dataSource={dataSource}
              lastUpdated={new Date().toISOString()}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetAllocation />
          <div className="space-y-6">
            <TopHoldings />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <DividendTracking />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIChat />
          <MarketOverview />
        </div>
      </div>
    </DashboardLayout>
  );
};

const Dashboard = () => {
  return (
    <PortfolioProvider>
      <DashboardContent />
    </PortfolioProvider>
  );
};

export default Dashboard;
