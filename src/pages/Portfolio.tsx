
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import PortfolioSummary from '@/components/Dashboard/PortfolioSummary';
import TopHoldings from '@/components/Dashboard/TopHoldings';
import PerformanceChart from '@/components/Dashboard/PerformanceChart';
import DividendTracking from '@/components/Dashboard/DividendTracking';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Portfolio = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();

  if (!user) {
    return (
      <DashboardLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your portfolio data.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (!selectedPortfolio) {
    return (
      <DashboardLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a portfolio to view dashboard data.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <PortfolioSummary />
          <TopHoldings />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart />
          <DividendTracking />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
