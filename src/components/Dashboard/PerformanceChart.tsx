import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";

const PerformanceChart = () => {
  const { selectedPortfolio, portfolios } = usePortfolio();
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  useEffect(() => {
    if (!selectedPortfolio) {
      setPerformanceData([]);
      return;
    }

    const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
    const binancePortfolioId = localStorage.getItem('binance_portfolio_id');

    if (selectedPortfolio === trading212PortfolioId) {
      // Trading212 performance - keep existing logic
      setPerformanceData([]);
    } else if (selectedPortfolio === binancePortfolioId) {
      // Binance crypto performance
      setPerformanceData([
        { month: 'Jan', portfolio: 15000, benchmark: 14500 },
        { month: 'Feb', portfolio: 18000, benchmark: 16000 },
        { month: 'Mar', portfolio: 22000, benchmark: 18500 },
        { month: 'Apr', portfolio: 26000, benchmark: 21000 },
        { month: 'May', portfolio: 29000, benchmark: 23500 },
        { month: 'Jun', portfolio: 29000, benchmark: 24000 }
      ]);
    } else if (portfolioType === 'crypto') {
      // Crypto portfolio performance (simulated based on portfolio value)
      const baseValue = 36900; // Net deposits
      setPerformanceData([
        { month: 'Jan', portfolio: baseValue, benchmark: baseValue * 0.95 },
        { month: 'Feb', portfolio: baseValue * 1.15, benchmark: baseValue * 1.05 },
        { month: 'Mar', portfolio: baseValue * 1.35, benchmark: baseValue * 1.20 },
        { month: 'Apr', portfolio: baseValue * 1.55, benchmark: baseValue * 1.35 },
        { month: 'May', portfolio: baseValue * 1.65, benchmark: baseValue * 1.45 },
        { month: 'Jun', portfolio: 62226.87, benchmark: baseValue * 1.50 } // Current value
      ]);
    } else {
      // Stock portfolio performance
      setPerformanceData([
        { month: 'Jan', portfolio: 209241, benchmark: 210000 },
        { month: 'Feb', portfolio: 215000, benchmark: 215500 },
        { month: 'Mar', portfolio: 225000, benchmark: 220000 },
        { month: 'Apr', portfolio: 235000, benchmark: 225000 },
        { month: 'May', portfolio: 245000, benchmark: 235000 },
        { month: 'Jun', portfolio: 254872, benchmark: 245000 }
      ]);
    }
  }, [selectedPortfolio, portfolioType]);

  if (!selectedPortfolio) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Select a portfolio to view performance
          </p>
        </CardContent>
      </Card>
    );
  }

  const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
  const isTrading212 = selectedPortfolio === trading212PortfolioId;

  if (isTrading212 && performanceData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              No performance data available.
            </p>
            <Button asChild>
              <a href="/broker-integration" className="inline-flex items-center gap-2">
                Go to Broker Integration to connect your Trading212 account.
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {performanceData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No performance data available
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="#8884d8" 
                  name={portfolioType === 'crypto' ? 'Crypto Portfolio' : 'Portfolio Value'}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#82ca9d" 
                  name={portfolioType === 'crypto' ? 'Crypto Market' : 'S&P 500'}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
