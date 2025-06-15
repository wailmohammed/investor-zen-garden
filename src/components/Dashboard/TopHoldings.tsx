import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

const TopHoldings = () => {
  const { selectedPortfolio, portfolios } = usePortfolio();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get current portfolio type
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio);
  const portfolioType = currentPortfolio?.portfolio_type || 'stock';

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!selectedPortfolio) {
        setHoldings([]);
        return;
      }

      const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
      const binancePortfolioId = localStorage.getItem('binance_portfolio_id');

      if (selectedPortfolio === trading212PortfolioId) {
        // Fetch real Trading212 holdings
        try {
          setIsLoading(true);
          
          // Check for cached data first
          const cachedData = localStorage.getItem('trading212_data');
          if (cachedData) {
            try {
              const realData = JSON.parse(cachedData);
              if (realData.positions && realData.positions.length > 0) {
                const formattedHoldings = realData.positions.slice(0, 10).map((position: any) => ({
                  symbol: position.symbol,
                  name: position.symbol,
                  value: `$${position.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  allocation: `${((position.marketValue / realData.totalValue) * 100).toFixed(1)}%`,
                  change: `${position.unrealizedPnL >= 0 ? '+' : ''}$${position.unrealizedPnL.toFixed(2)}`,
                  quantity: position.quantity,
                  avgPrice: position.averagePrice,
                  currentPrice: position.currentPrice
                }));
                setHoldings(formattedHoldings);
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

          if (data?.success && data.data?.positions) {
            const formattedHoldings = data.data.positions.slice(0, 10).map((position: any) => ({
              symbol: position.symbol,
              name: position.symbol,
              value: `$${position.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              allocation: `${((position.marketValue / data.data.totalValue) * 100).toFixed(1)}%`,
              change: `${position.unrealizedPnL >= 0 ? '+' : ''}$${position.unrealizedPnL.toFixed(2)}`,
              quantity: position.quantity,
              avgPrice: position.averagePrice,
              currentPrice: position.currentPrice
            }));
            setHoldings(formattedHoldings);
            
            // Cache the data
            localStorage.setItem('trading212_data', JSON.stringify(data.data));
          }
        } catch (error) {
          console.error('Error fetching Trading212 holdings:', error);
          setHoldings([]);
        } finally {
          setIsLoading(false);
        }
      } else if (selectedPortfolio === binancePortfolioId) {
        // Fetch real Binance holdings
        try {
          setIsLoading(true);
          const { data, error } = await supabase.functions.invoke('binance-api', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) throw error;

          if (data?.success && data.data?.holdings) {
            const formattedHoldings = data.data.holdings.slice(0, 10).map((holding: any) => ({
              symbol: holding.symbol,
              name: holding.name,
              value: `$${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              allocation: `${((holding.value / data.data.totalValue) * 100).toFixed(1)}%`,
              change: `${holding.changePercent24h >= 0 ? '+' : ''}${holding.changePercent24h.toFixed(2)}%`,
              amount: holding.amount,
              price: `$${holding.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
            }));
            setHoldings(formattedHoldings);
          }
        } catch (error) {
          console.error('Error fetching Binance holdings:', error);
          setHoldings([]);
        } finally {
          setIsLoading(false);
        }
      } else if (portfolioType === 'crypto') {
        // Fetch real crypto holdings from API
        try {
          setIsLoading(true);
          const { data, error } = await supabase.functions.invoke('crypto-api', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) throw error;

          if (data?.success && data.data?.holdings) {
            const formattedHoldings = data.data.holdings.map((holding: any) => ({
              symbol: holding.symbol,
              name: holding.name,
              value: `$${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              allocation: `${((holding.value / data.data.totalValue) * 100).toFixed(1)}%`,
              change: `${holding.changePercent24h >= 0 ? '+' : ''}${holding.changePercent24h.toFixed(2)}%`,
              amount: holding.amount,
              price: `$${holding.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }));
            setHoldings(formattedHoldings);
          }
        } catch (error) {
          console.error('Error fetching crypto holdings:', error);
          setHoldings([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Stock portfolio holdings
        setHoldings([
          { symbol: 'AAPL', name: 'Apple Inc.', value: '$45,231.00', allocation: '18%', change: '+1.2%' },
          { symbol: 'MSFT', name: 'Microsoft', value: '$38,950.00', allocation: '15%', change: '+0.8%' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', value: '$32,100.00', allocation: '13%', change: '+2.1%' },
          { symbol: 'AMZN', name: 'Amazon', value: '$28,750.00', allocation: '11%', change: '-0.5%' },
          { symbol: 'TSLA', name: 'Tesla', value: '$25,900.00', allocation: '10%', change: '+3.4%' }
        ]);
      }
    };

    fetchHoldings();
  }, [selectedPortfolio, portfolioType]);

  if (!selectedPortfolio) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Top Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Select a portfolio to view holdings
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
        <CardTitle>Top Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading holdings...
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              {isTrading212 ? "No holdings data available from Trading212." : "No holdings data available"}
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
          <div className="space-y-4">
            {holdings.map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <div className="font-medium">{holding.symbol}</div>
                  <div className="text-sm text-muted-foreground">{holding.name}</div>
                  {isTrading212 && holding.quantity && (
                    <div className="text-xs text-muted-foreground">
                      {holding.quantity} shares @ ${holding.currentPrice?.toFixed(2)}
                    </div>
                  )}
                  {(portfolioType === 'crypto' || selectedPortfolio === localStorage.getItem('binance_portfolio_id')) && holding.amount && (
                    <div className="text-xs text-muted-foreground">
                      {holding.amount} @ {holding.price}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">{holding.value}</div>
                  <div className="text-sm text-muted-foreground">{holding.allocation}</div>
                  <div className={`text-sm ${holding.change.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {holding.change}
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
