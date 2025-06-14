
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
            setAllHoldings([]);
          } else if (data?.success && data.data.positions) {
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
            
            // Store all holdings for the dialog
            setAllHoldings(processedHoldings);
            // Show top 5 in the card
            setHoldings(processedHoldings.slice(0, 5));
          }
        } else {
          // No real data available for other portfolios
          setHoldings([]);
          setAllHoldings([]);
        }
      } catch (error) {
        console.error('Error fetching holdings:', error);
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
        {allHoldings.length > 0 && (
          <ViewAllHoldingsDialog holdings={allHoldings} />
        )}
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
