
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortfolioSummary from './PortfolioSummary';
import TopHoldings from './TopHoldings';
import AssetAllocation from './AssetAllocation';
import MarketOverview from './MarketOverview';
import DividendTracking from './DividendTracking';
import { TrendingUp, DollarSign, Calendar, Target, Bell, Settings } from 'lucide-react';
import StatCard from '../StatCard';

const EnhancedDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Portfolio Value" 
          value="$254,872.65"
          change={{ 
            value: "+$1,243.32", 
            percentage: "+0.49%", 
            isPositive: true 
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard 
          label="Monthly Dividends" 
          value="$1,284.50"
          change={{ 
            value: "+$124.30", 
            percentage: "+10.7%", 
            isPositive: true 
          }}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard 
          label="Dividend Yield" 
          value="4.2%"
          change={{ 
            value: "+0.1%", 
            percentage: "+2.4%", 
            isPositive: true 
          }}
          icon={<Target className="h-5 w-5" />}
        />
        <StatCard 
          label="Total Return" 
          value="+21.8%"
          change={{ 
            value: "+1.2%", 
            percentage: "+5.8%", 
            isPositive: true 
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="dividends">Dividends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioSummary />
            </div>
            <div>
              <DividendTracking />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AssetAllocation />
            <TopHoldings />
          </div>

          <MarketOverview />
        </TabsContent>

        <TabsContent value="holdings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TopHoldings />
            </div>
            <div>
              <AssetAllocation />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dividends" className="space-y-6">
          <DividendTracking />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced performance analytics will be displayed here including risk metrics, 
                Sharpe ratio, beta, and benchmark comparisons.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboard;
