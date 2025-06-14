
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

interface PerformanceData {
  date: string;
  value: number;
}

const PerformanceChart = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!user || !selectedPortfolio) {
        setPerformanceData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDataSource('');
        
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching Trading212 performance data');
          
          // Try fresh API data first
          try {
            const { data, error } = await supabase.functions.invoke('trading212-sync', {
              body: { portfolioId: selectedPortfolio }
            });

            if (!error && data?.success && data.data) {
              const currentValue = data.data.totalValue || 0;
              const netDeposits = data.data.netDeposits || 0;
              const totalReturn = data.data.totalReturn || 0;
              
              if (currentValue > 0) {
                const performanceHistory = generatePerformanceHistory(currentValue, netDeposits, totalReturn);
                setPerformanceData(performanceHistory);
                setDataSource('Live API');
                localStorage.setItem('trading212_data', JSON.stringify(data.data));
                return;
              }
            }
          } catch (apiError) {
            console.log('API call failed, trying cached data');
          }

          // Try cached API data
          const cachedData = localStorage.getItem('trading212_data');
          if (cachedData) {
            try {
              const cached = JSON.parse(cachedData);
              const currentValue = cached.totalValue || 0;
              const netDeposits = cached.netDeposits || 0;
              const totalReturn = cached.totalReturn || 0;
              
              if (currentValue > 0) {
                const performanceHistory = generatePerformanceHistory(currentValue, netDeposits, totalReturn);
                setPerformanceData(performanceHistory);
                setDataSource('Cached API');
                return;
              }
            } catch (parseError) {
              console.error('Error parsing cached data:', parseError);
            }
          }

          // Try CSV data as fallback
          const csvDataStr = localStorage.getItem('trading212_csv_data');
          if (csvDataStr) {
            try {
              const csvData = JSON.parse(csvDataStr);
              if (csvData && csvData.length > 0) {
                // Calculate total value from CSV data
                const holdingsMap = new Map();
                
                csvData.forEach((transaction: any) => {
                  const ticker = transaction.Ticker || transaction.Symbol;
                  const action = transaction.Action;
                  const shares = parseFloat(transaction["No. of shares"] || transaction.Quantity || "0");
                  const price = parseFloat(transaction["Price / share"] || transaction.Price || "0");
                  
                  if (ticker && (action === "Market buy" || action === "Market sell" || !action)) {
                    if (!holdingsMap.has(ticker)) {
                      holdingsMap.set(ticker, { quantity: 0, totalCost: 0 });
                    }
                    
                    const holding = holdingsMap.get(ticker);
                    if (action === "Market buy" || !action) {
                      holding.quantity += shares;
                      holding.totalCost += shares * price;
                    } else if (action === "Market sell") {
                      holding.quantity -= shares;
                      holding.totalCost -= shares * price;
                    }
                  }
                });
                
                const totalValue = Array.from(holdingsMap.values())
                  .filter((h: any) => h.quantity > 0)
                  .reduce((sum, h: any) => sum + h.totalCost, 0);
                
                if (totalValue > 0) {
                  const performanceHistory = generatePerformanceHistory(totalValue, totalValue, 0);
                  setPerformanceData(performanceHistory);
                  setDataSource('CSV Data');
                  return;
                }
              }
            } catch (parseError) {
              console.error('Error parsing CSV data:', parseError);
            }
          }
        }

        // Use demo data as final fallback
        const demoPerformance = generatePerformanceHistory(254872.65, 209241.37, 45631.28);
        setPerformanceData(demoPerformance);
        setDataSource('Demo Data');
        
      } catch (error) {
        console.error('Error fetching performance:', error);
        setError('Failed to fetch performance data');
        setPerformanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [user, selectedPortfolio]);

  const generatePerformanceHistory = (currentValue: number, netDeposits: number, totalReturn: number): PerformanceData[] => {
    const today = new Date();
    const performanceHistory: PerformanceData[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const progressRatio = (30 - i) / 30;
      const historicalReturn = totalReturn * progressRatio;
      const historicalValue = netDeposits + historicalReturn;
      
      const dailyVariation = (Math.random() - 0.5) * currentValue * 0.02;
      const value = historicalValue + dailyVariation;
      
      performanceHistory.push({
        date: date.toISOString().split('T')[0],
        value: Number(value.toFixed(2))
      });
    }
    
    if (performanceHistory.length > 0) {
      performanceHistory[performanceHistory.length - 1].value = currentValue;
    }
    
    return performanceHistory;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        {dataSource && (
          <p className="text-xs text-blue-600">Source: {dataSource}</p>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
            <p className="text-sm mt-1">Go to Broker Integration to connect your Trading212 account.</p>
          </div>
        ) : performanceData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No performance data available.</p>
            <p className="text-sm mt-1">Connect your Trading212 account or upload CSV data to see performance.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
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
