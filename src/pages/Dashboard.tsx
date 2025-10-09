
import React from "react";
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
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedPortfolio, portfolios } = usePortfolio();
  const [portfolioMetadata, setPortfolioMetadata] = React.useState<any>(null);

  console.log("Dashboard - Rendering for user:", user?.email);

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  // Fetch portfolio metadata to get broker_type and holdings_count
  React.useEffect(() => {
    const fetchPortfolioMetadata = async () => {
      if (!selectedPortfolio) return;
      
      const { data } = await supabase
        .from('portfolio_metadata')
        .select('*')
        .eq('portfolio_id', selectedPortfolio)
        .single();
      
      if (data) {
        console.log('Portfolio metadata:', data);
        setPortfolioMetadata(data);
      }
    };
    
    fetchPortfolioMetadata();
  }, [selectedPortfolio]);

  // Determine data source from portfolio metadata
  const brokerType = portfolioMetadata?.broker_type;
  let dataSource: 'Trading212' | 'CSV' | 'Mock' | 'CoinGecko' | 'Binance' = 'Mock';
  let isConnected = false;
  
  if (brokerType === 'trading212') {
    dataSource = 'Trading212';
    isConnected = true;
  } else if (brokerType === 'binance') {
    dataSource = 'Binance';
    isConnected = true;
  } else if (portfolioType === 'crypto') {
    dataSource = 'CoinGecko';
    isConnected = true;
  } else if (portfolioMetadata?.holdings_count > 0) {
    dataSource = 'CSV';
    isConnected = true;
  }

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
              isConnected={isConnected}
              dataSource={dataSource}
              lastUpdated={portfolioMetadata?.last_sync_at || portfolioMetadata?.updated_at}
              recordCount={portfolioMetadata?.holdings_count}
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
            {portfolioType === 'stock' ? (
              <DividendTracking />
            ) : (
              <MarketOverview />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIChat />
          {portfolioType === 'stock' && <MarketOverview />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
