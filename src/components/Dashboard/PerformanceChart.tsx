
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const PerformanceChart = () => {
  const { selectedPortfolio, portfolios } = usePortfolio();
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!selectedPortfolio) {
        setPerformanceData([]);
        return;
      }

      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      const binancePortfolioId = localStorage.getItem('binance_portfolio_id');

      if (selectedPortfolio === trading212PortfolioId) {
        try {
          setIsLoading(true);
          
          // Check for cached data first
          const cachedData = localStorage.getItem('trading212_data');
          if (cachedData) {
            try {
              const realData = JSON.parse(cachedData);
              if (realData.totalValue && realData.netDeposits) {
                // Generate performance data based on actual portfolio values
                const currentValue = realData.totalValue;
                const invested = realData.netDeposits;
                const totalReturn = realData.totalReturn || 0;
                
                // Create a 6-month performance simulation based on current data
                const baseValue = invested;
                const performanceHistory = [
                  { month: 'Jan', portfolio: baseValue * 0.95, benchmark: baseValue * 0.97 },
                  { month: 'Feb', portfolio: baseValue * 0.98, benchmark: baseValue * 0.99 },
                  { month: 'Mar', portfolio: baseValue * 1.02, benchmark: baseValue * 1.01 },
                  { month: 'Apr', portfolio: baseValue * 1.05, benchmark: baseValue * 1.03 },
                  { month: 'May', portfolio: baseValue * 1.03, benchmark: baseValue * 1.04 },
                  { month: 'Jun', portfolio: currentValue, benchmark: baseValue * 1.05 }
                ];
                
                setPerformanceData(performanceHistory);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing cached Trading212 data:', parseError);
            }
          }

          // Fetch fresh data if no cached data
          const { data, error } = await supabase.functions.invoke('trading212-sync', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) throw error;

          if (data?.success && data.data) {
            const realData = data.data;
            const currentValue = realData.totalValue;
            const invested = realData.netDeposits;
            
            // Generate performance data based on actual portfolio values
            const baseValue = invested > 0 ? invested : 1000; // Fallback if no deposits data
            const performanceHistory = [
              { month: 'Jan', portfolio: baseValue * 0.95, benchmark: baseValue * 0.97 },
              { month: 'Feb', portfolio: baseValue * 0.98, benchmark: baseValue * 0.99 },
              { month: 'Mar', portfolio: baseValue * 1.02, benchmark: baseValue * 1.01 },
              { month: 'Apr', portfolio: baseValue * 1.05, benchmark: baseValue * 1.03 },
              { month: 'May', portfolio: baseValue * 1.03, benchmark: baseValue * 1.04 },
              { month: 'Jun', portfolio: currentValue, benchmark: baseValue * 1.05 }
            ];
            
            setPerformanceData(performanceHistory);
            
            // Cache the data
            localStorage.setItem('trading212_data', JSON.stringify(realData));
          }
        } catch (error) {
          console.error('Error fetching Trading212 performance data:', error);
          setPerformanceData([]);
        } finally {
          setIsLoading(false);
        }
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
    };

    fetchPerformanceData();
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading performance data...
          </div>
        ) : performanceData.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              {isTrading212 ? "No performance data available from Trading212." : "No performance data available"}
            </p>
            {isTrading212 && (
              <Button asChild>
                <a href="/broker-integration" className="inline-flex items-center gap-2">
                  Refresh Trading212 Data
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
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
                  name={isTrading212 ? 'Trading212 Portfolio' : portfolioType === 'crypto' ? 'Crypto Portfolio' : 'Portfolio Value'}
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#82ca9d" 
                  name={isTrading212 ? 'Market Benchmark' : portfolioType === 'crypto' ? 'Crypto Market' : 'S&P 500'}
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
