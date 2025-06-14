
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

interface AllocationData {
  name: string;
  value: number;
  percentage: number;
}

const AssetAllocation = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [allocationData, setAllocationData] = useState<AllocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    const fetchAllocation = async () => {
      if (!user || !selectedPortfolio) {
        setAllocationData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDataSource('');
        
        // Check if this is a Trading212 connected portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching Trading212 allocation data');
          
          // Try fresh API data first
          try {
            const { data, error } = await supabase.functions.invoke('trading212-sync', {
              body: { portfolioId: selectedPortfolio }
            });

            if (!error && data?.success && data.data.positions && data.data.positions.length > 0) {
              const positions = data.data.positions;
              const totalValue = positions.reduce((sum: number, pos: any) => {
                const marketValue = pos.marketValue || (pos.quantity * pos.currentPrice);
                return sum + marketValue;
              }, 0);
              
              if (totalValue > 0) {
                const allocation = positions
                  .map((position: any) => {
                    const marketValue = position.marketValue || (position.quantity * position.currentPrice);
                    return {
                      name: position.symbol,
                      value: marketValue,
                      percentage: (marketValue / totalValue) * 100
                    };
                  })
                  .filter((item: any) => item.value > 0)
                  .sort((a: any, b: any) => b.value - a.value)
                  .slice(0, 8);
                
                setAllocationData(allocation);
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
              if (cached.positions && cached.positions.length > 0) {
                const positions = cached.positions;
                const totalValue = positions.reduce((sum: number, pos: any) => {
                  const marketValue = pos.marketValue || (pos.quantity * pos.currentPrice);
                  return sum + marketValue;
                }, 0);
                
                if (totalValue > 0) {
                  const allocation = positions
                    .map((position: any) => {
                      const marketValue = position.marketValue || (position.quantity * position.currentPrice);
                      return {
                        name: position.symbol,
                        value: marketValue,
                        percentage: (marketValue / totalValue) * 100
                      };
                    })
                    .filter((item: any) => item.value > 0)
                    .sort((a: any, b: any) => b.value - a.value)
                    .slice(0, 8);
                  
                  setAllocationData(allocation);
                  setDataSource('Cached API');
                  return;
                }
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
                // Process CSV data to create allocation
                const holdingsMap = new Map();
                
                csvData.forEach((transaction: any) => {
                  const ticker = transaction.Ticker || transaction.Symbol;
                  const action = transaction.Action;
                  const shares = parseFloat(transaction["No. of shares"] || transaction.Quantity || "0");
                  const price = parseFloat(transaction["Price / share"] || transaction.Price || "0");
                  
                  if (ticker && (action === "Market buy" || action === "Market sell" || !action)) {
                    if (!holdingsMap.has(ticker)) {
                      holdingsMap.set(ticker, {
                        symbol: ticker,
                        quantity: 0,
                        totalCost: 0
                      });
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
                
                const holdings = Array.from(holdingsMap.values())
                  .filter((holding: any) => holding.quantity > 0)
                  .map((holding: any) => ({
                    name: holding.symbol,
                    value: holding.totalCost,
                    percentage: 0
                  }));
                
                if (holdings.length > 0) {
                  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
                  holdings.forEach(h => h.percentage = (h.value / totalValue) * 100);
                  holdings.sort((a, b) => b.value - a.value);
                  
                  setAllocationData(holdings.slice(0, 8));
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
        const demoAllocation = [
          { name: 'AAPL', value: 45000, percentage: 35.2 },
          { name: 'GOOGL', value: 32000, percentage: 25.0 },
          { name: 'MSFT', value: 28000, percentage: 21.9 },
          { name: 'TSLA', value: 15000, percentage: 11.7 },
          { name: 'AMZN', value: 8000, percentage: 6.2 }
        ];
        
        setAllocationData(demoAllocation);
        setDataSource('Demo Data');
        
      } catch (error) {
        console.error('Error fetching allocation:', error);
        setError('Failed to fetch allocation data');
        setAllocationData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocation();
  }, [user, selectedPortfolio]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
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
        <CardTitle>Asset Allocation</CardTitle>
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
        ) : allocationData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No allocation data available.</p>
            <p className="text-sm mt-1">Connect your Trading212 account or upload CSV data to see allocation.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetAllocation;
