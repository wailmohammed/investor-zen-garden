
import DashboardLayout from "@/components/DashboardLayout";
import AssetAllocation from "@/components/Dashboard/AssetAllocation";
import PerformanceChart from "@/components/Dashboard/PerformanceChart";
import PortfolioSummary from "@/components/Dashboard/PortfolioSummary";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import TopHoldings from "@/components/Dashboard/TopHoldings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import MarketOverview from "@/components/Dashboard/MarketOverview";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Portfolio
        </Button>
      </div>
      
      <div className="space-y-6">
        <PortfolioSummary />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PerformanceChart />
          <AssetAllocation />
        </div>
        
        <MarketOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopHoldings />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
