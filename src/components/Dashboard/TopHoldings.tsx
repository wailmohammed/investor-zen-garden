
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user || !selectedPortfolio) {
        setHoldings([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if this is a Trading212 connected portfolio
        const trading212PortfolioId = localStorage.getItem('trading212_portfolio_id');
        
        if (selectedPortfolio === trading212PortfolioId) {
          console.log('Fetching real Trading212 holdings data');
          
          const { data, error } = await supabase.functions.invoke('trading212-sync', {
            body: { portfolioId: selectedPortfolio }
          });

          if (error) {
            console.error('Error fetching Trading212 holdings:', error);
            setHoldings([]);
          } else if (data?.success && data.data.positions) {
            const realHoldings = data.data.positions.slice(0, 5).map((position: any) => {
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
            
            setHoldings(realHoldings);
          }
        } else {
          // No real data available for other portfolios
          setHoldings([]);
        }
      } catch (error) {
        console.error('Error fetching holdings:', error);
        setHoldings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoldings();
  }, [user, selectedPortfolio]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
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
      <CardHeader>
        <CardTitle>Top Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        {holdings.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No holdings data available.</p>
            <p className="text-sm mt-1">Connect your Trading212 account to see real holdings.</p>
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
