
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";
import ViewAllHoldingsDialog from './ViewAllHoldingsDialog';

interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  change?: number;
  changePercent?: number;
}

const TopHoldings = () => {
  const { user } = useAuth();
  const { selectedPortfolio } = usePortfolio();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [allHoldings, setAllHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user || !selectedPortfolio) {
        setHoldings([]);
        setAllHoldings([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDataSource('');
        
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching Trading212 holdings data');
          
          // Try fresh API data first
          try {
            const { data, error } = await supabase.functions.invoke('trading212-sync', {
              body: { portfolioId: selectedPortfolio }
            });

            if (!error && data?.success && data.data.positions && data.data.positions.length > 0) {
              const processedHoldings = data.data.positions.map((position: any) => {
                const marketValue = position.marketValue || (position.quantity * position.currentPrice);
                const unrealizedPnL = position.unrealizedPnL || 0;
                const changePercent = marketValue > 0 ? (unrealizedPnL / (marketValue - unrealizedPnL)) * 100 : 0;
                
                return {
                  symbol: position.symbol,
                  quantity: position.quantity || 0,
                  averagePrice: position.averagePrice || 0,
                  currentPrice: position.currentPrice || 0,
                  marketValue: marketValue,
                  unrealizedPnL: unrealizedPnL,
                  change: unrealizedPnL,
                  changePercent: changePercent
                };
              });
              
              setAllHoldings(processedHoldings);
              setHoldings(processedHoldings.slice(0, 5));
              setDataSource('Live API');
              localStorage.setItem('trading212_data', JSON.stringify(data.data));
              return;
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
                const processedHoldings = cached.positions.map((position: any) => {
                  const marketValue = position.marketValue || (position.quantity * position.currentPrice);
                  const unrealizedPnL = position.unrealizedPnL || 0;
                  const changePercent = marketValue > 0 ? (unrealizedPnL / (marketValue - unrealizedPnL)) * 100 : 0;
                  
                  return {
                    symbol: position.symbol,
                    quantity: position.quantity || 0,
                    averagePrice: position.averagePrice || 0,
                    currentPrice: position.currentPrice || 0,
                    marketValue: marketValue,
                    unrealizedPnL: unrealizedPnL,
                    change: unrealizedPnL,
                    changePercent: changePercent
                  };
                });
                
                setAllHoldings(processedHoldings);
                setHoldings(processedHoldings.slice(0, 5));
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
                // Process CSV data to create holdings
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
                        name: transaction.Name,
                        quantity: 0,
                        totalCost: 0,
                        transactions: []
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
                    holding.transactions.push(transaction);
                  }
                });
                
                const processedHoldings = Array.from(holdingsMap.values())
                  .filter((holding: any) => holding.quantity > 0)
                  .map((holding: any) => ({
                    symbol: holding.symbol,
                    quantity: holding.quantity,
                    averagePrice: holding.quantity > 0 ? holding.totalCost / holding.quantity : 0,
                    currentPrice: holding.quantity > 0 ? holding.totalCost / holding.quantity : 0,
                    marketValue: holding.totalCost,
                    unrealizedPnL: 0,
                    change: 0,
                    changePercent: 0
                  }));
                
                if (processedHoldings.length > 0) {
                  setAllHoldings(processedHoldings);
                  setHoldings(processedHoldings.slice(0, 5));
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
        const demoHoldings = [
          {
            symbol: 'AAPL',
            quantity: 150,
            averagePrice: 180.50,
            currentPrice: 195.20,
            marketValue: 29280,
            unrealizedPnL: 2205,
            change: 2205,
            changePercent: 8.14
          },
          {
            symbol: 'GOOGL',
            quantity: 50,
            averagePrice: 125.30,
            currentPrice: 135.80,
            marketValue: 6790,
            unrealizedPnL: 525,
            change: 525,
            changePercent: 8.38
          },
          {
            symbol: 'MSFT',
            quantity: 75,
            averagePrice: 320.00,
            currentPrice: 315.50,
            marketValue: 23662.50,
            unrealizedPnL: -337.50,
            change: -337.50,
            changePercent: -1.41
          }
        ];
        
        setAllHoldings(demoHoldings);
        setHoldings(demoHoldings.slice(0, 5));
        setDataSource('Demo Data');
        
      } catch (error) {
        console.error('Error fetching holdings:', error);
        setError('Failed to fetch holdings data');
        setHoldings([]);
        setAllHoldings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoldings();
  }, [user, selectedPortfolio]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Holdings</CardTitle>
        {dataSource && (
          <p className="text-xs text-blue-600">Source: {dataSource}</p>
        )}
        {allHoldings.length > 0 && (
          <ViewAllHoldingsDialog holdings={allHoldings} />
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>{error}</p>
            <p className="text-sm mt-1">Go to Broker Integration to connect your Trading212 account.</p>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No holdings data available.</p>
            <p className="text-sm mt-1">Connect your Trading212 account or upload CSV data to see holdings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {holdings.map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{holding.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {holding.quantity.toFixed(4)} shares @ ${holding.averagePrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${holding.marketValue.toFixed(2)}</div>
                  <div className={`text-sm ${holding.changePercent && holding.changePercent >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
                    {holding.changePercent !== undefined ? `${holding.changePercent >= 0 ? '+' : ''}${holding.changePercent.toFixed(2)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopHoldings;
