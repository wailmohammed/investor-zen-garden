
import AssetAllocation from "@/components/Dashboard/AssetAllocation";
import PerformanceChart from "@/components/Dashboard/PerformanceChart";
import PortfolioSummary from "@/components/Dashboard/PortfolioSummary";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import TopHoldings from "@/components/Dashboard/TopHoldings";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="space-y-6">
          <PortfolioSummary />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PerformanceChart />
            <AssetAllocation />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TopHoldings />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* This space can be used for additional widgets */}
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <p>Future Widget Space</p>
                    <p className="text-sm">(Customizable dashboard widgets coming soon)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

import { Card, CardContent } from "@/components/ui/card";
export default Dashboard;
